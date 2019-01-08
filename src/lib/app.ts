import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as passport from 'passport';
import * as path from 'path';
import * as session from 'express-session';

import * as discordStrategy from 'passport-discord';
import * as twitchStrategy from 'passport-twitch.js';

import {PromisifiedRedisClient} from './typings/redis';
import {User} from './user';
import {Users} from './users';

const isProduction = process.env.NODE_ENV == 'production';

export class App {
	private app: express.Application;
	private users: Users;

	constructor(private db: PromisifiedRedisClient, private settings) {
		this.app = express();
		this.users = new Users(this.db);

		this.setupApp();
		this.setupAuth();
		this.setupRoutes();
	}

	async checkTargetAuth(user, targetService, targetServiceId) {
		if(!user) return false;

		var services = await this.users.getServicesByUserId(user.id);
		for(var service of Object.keys(services)) {
			var serviceId = services[service];

			if(service == targetService && serviceId == targetServiceId) return true;
		}

		return false;
	}

	async handleAuth(service, req, profile, done) {
		await this.users.saveServiceProfile(service, profile.id, profile);

		if(!req.user) {
			try {
				var user = await this.users.findOrCreateByServiceId(service, profile.id);

				user.services = {
					[service]: profile
				}

				return done(null, user);
			} catch(e) {
				console.log('oh shit, something failed with new user login.');
				console.log(e);
				return done(null, false);
			}
		} else {
			try {
				await this.users.linkWithServiceId(req.user.id, service, profile.id);

				return done(null, req.user);
			} catch(e) {
				console.log('oh shit, something fucked up when linking accounts.');
				console.log(e);
				return done(null, false);
			}
		}
	}

	setupApp() {
		if(isProduction) {
			this.app.use(compression());
		}

		this.app.use(bodyParser.urlencoded({
			extended: true
		}));
		this.app.use(bodyParser.json());
		this.app.use(cookieParser());
		this.app.use(session({
			resave: true,
			saveUninitialized: false,
			secret: 'please_change_this_later'
		}));
		this.app.use(passport.initialize());
		this.app.use(passport.session());
		
		this.app.use(express.static(path.resolve('web/public')));

		this.app.listen(16834);
	}

	setupAuth() {
		passport.use(new discordStrategy.Strategy({
			clientID: this.settings.services.discord.clientId,
			clientSecret: this.settings.services.discord.clientSecret,
			callbackURL: this.settings.services.discord.callbackUrl,
			passReqToCallback: true,
			scope: ['identify']
		}, async (req, accessToken, refreshToken, profile, done) => {
			return this.handleAuth('discord', req, profile, done);
		}));

		passport.use(new twitchStrategy.Strategy({
			clientID: this.settings.services.twitch.clientId,
			clientSecret: this.settings.services.twitch.clientSecret,
			callbackURL: this.settings.services.twitch.callbackUrl,
			passReqToCallback: true,
			scope: 'user_read'
		}, async (req, accessToken, refreshToken, profile, done) => {
			return this.handleAuth('twitch', req, profile, done);
		}));
		
		passport.serializeUser((user: User, done: (err, id) => void) => {
			done(null, user.id);
		});
		
		passport.deserializeUser(async (id: string, done: (err, user) => void) => {
			var user = await this.users.findByUserId(id);
			done(null, user);
		});
	}

	setupRoutes() {
		this.app.get('/api/auth', (req, res) => {
			res.json({
				user: req.user ? req.user : null
			});
		});

		this.app.get('/api/auth/profile/:service', async (req, res) => {
			if(!req.isAuthenticated()) return res.json({
				service: null
			});

			var services = await this.users.getServicesByUserId(req.user.id);

			if(services[req.params.service] == undefined) return res.json({
				service: null
			});

			var profile = await this.users.getServiceProfile(req.params.service, services[req.params.service]);

			console.log(profile);

			res.json({
				service: profile
			});
		});

		this.app.get('/api/auth/services', async (req, res) => {
			if(!req.isAuthenticated()) res.json({});

			var services = await this.users.getServicesByUserId(req.user.id);

			res.json({
				services: services
			});
		});

		this.app.get('/api/auth/targets', async (req, res) => {
			if(!req.isAuthenticated()) res.json([]);

			var services = await this.users.getServicesByUserId(req.user.id);
			var targets = [] as any;

			for(var service of Object.keys(services)) {
				var serviceId = services[service];

				console.log(service + ': ' + serviceId);

				if(service == 'twitch') {
					targets.push({
						service: 'twitch',
						serviceId: serviceId
					});
				}
			}

			res.json({
				targets: targets
			});
		});

		this.app.get('/api/profile/:service/:serviceId', async (req, res) => {
			var profile = await this.users.getServiceProfile(req.params.service, req.params.serviceId) as any;
			var result = {} as any;

			if(profile) {
				switch(req.params.service) {
					case 'discord':
						result.avatar = 'https://cdn.discordapp.com/avatars/' + profile.id + '/' + profile.avatar + '.png'
						result.displayName = profile.username + '#' + profile.discriminator;
						result.id = profile.id;
						result.username = profile.username + '#' + profile.discriminator;
						break;
					case 'twitch':
						result.avatar = profile.profile_image_url;
						result.displayName = profile.display_name;
						result.id = profile.id;
						result.username = profile.login;
						break;
				}
			}

			res.json({
				profile: result
			});
		});

		this.app.post('/api/target/:service/:serviceId/toggle', async (req, res) => {
			var targetAuth = await this.checkTargetAuth(req.user, req.params.service, req.params.serviceId);
			if(!targetAuth) return res.sendStatus(403);

			if(req.body.enable == undefined) return res.sendStatus(400);

			if(req.body.enable) {
				await this.db.saddAsync('service:' + req.params.service + ':channels:enabled', req.params.serviceId);
			} else {
				await this.db.sremAsync('service:' + req.params.service + ':channels:enabled', req.params.serviceId);
			}

			res.sendStatus(200);
		});

		this.app.get('/api/target/:service/:serviceId/status', async (req, res) => {
			var targetAuth = await this.checkTargetAuth(req.user, req.params.service, req.params.serviceId);
			if(!targetAuth) return res.sendStatus(403);

			var enabled = await this.db.sismemberAsync('service:' + req.params.service + ':channels:enabled', req.params.serviceId);

			res.json({
				status: {
					enabled: enabled ? true : false
				}
			});
		});

		this.app.get('/api/*', (req, res) => {
			res.json({});
		});

		this.app.get('/auth/discord', passport.authenticate('discord'));
		this.app.get('/auth/discord/callback', passport.authenticate('discord', {
			failureRedirect: '/'
		}), (req, res) => {
			res.redirect('/account');
		});

		this.app.get('/auth/twitch', passport.authenticate('twitch.js'));
		this.app.get('/auth/twitch/callback', passport.authenticate('twitch.js', {
			failureRedirect: '/'
		}), (req, res) => {
			res.redirect('/account');
		});

		this.app.get('/connect/discord', passport.authorize('discord'));
		this.app.get('/connect/twitch', passport.authorize('twitch.js'));
		
		this.app.post('/disconnect/:service', async (req, res) => {
			if(!req.isAuthenticated()) res.sendStatus(403);

			var services = await this.users.getServicesByUserId(req.user.id);
			if(Object.keys(services).length > 1) {
				await this.users.unlinkServiceByUserId(req.user.id, req.params.service);
			}

			res.sendStatus(200);
		});

		this.app.post('/logout', (req, res) => {
			req.logout();
			res.redirect('/');
		});
		
		this.app.get('/js/bundle.js', (req, res) => {
			res.redirect('http://localhost:16835/js/bundle.js');
		});
		
		this.app.get('*', (req, res) => {
			if(isProduction) {
				res.sendFile(path.resolve('web/public/app.html'));
			} else {
				res.sendFile(path.resolve('src/views/dev.html'));
			}
		});
	}
}