import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as passport from 'passport';
import * as path from 'path';
import * as session from 'express-session';

import {unflatten} from 'flat';

import * as connectRedis from 'connect-redis';

import * as discordStrategy from 'passport-discord';
import * as twitchStrategy from 'passport-twitch.js';

import {Commands, PromisifiedRedisClient, User, Users} from 'mikuia-shared';

import {AuthRoute} from './api/auth';
import {DataRoute} from './api/data';
import {ProfileRoute} from './api/profile';
import {TargetRoute} from './api/target';

const isProduction = process.env.NODE_ENV == 'production';
let RedisStore = connectRedis(session);

export class App {
	private app: express.Application;
	private commands: Commands;
	private users: Users;

	constructor(private db: PromisifiedRedisClient, private settings) {
		this.app = express();
		this.commands = new Commands(this.db);
		this.users = new Users(this.db);

		this.setupApp();
		this.setupAuth();
		this.setupRoutes();
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
			secret: this.settings.web.sessionSecret,
			store: new RedisStore({ client: this.db })
		}));
		this.app.use(passport.initialize());
		this.app.use(passport.session());
		
		this.app.use(express.static(path.resolve('web/public')));

		this.app.listen(this.settings.web.port);
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
		this.app.use('/api/auth', new AuthRoute(this.db).router);
		this.app.use('/api/data', new DataRoute(this.db).router);
		this.app.use('/api/profile', new ProfileRoute(this.db).router);
		this.app.use('/api/target', new TargetRoute(this.db).router);

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

			var services = await this.users.getServicesByUserId(req.user!.id);
			if(Object.keys(services).length > 1) {
				await this.users.unlinkServiceByUserId(req.user!.id, req.params.service);
			}

			res.sendStatus(200);
		});

		this.app.get('/locales/:lang/handlers.json', async (req, res) => {
			var data = await this.db.hgetallAsync(`locale:${req.params.lang}:handlers`);

			res.json(unflatten(data));
		});

		this.app.get('/locales/:lang/plugins.json', async (req, res) => {
			var data = await this.db.hgetallAsync(`locale:${req.params.lang}:plugins`);

			res.json(unflatten(data));
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