import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as passport from 'passport';
import * as path from 'path';
import * as session from 'express-session';
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

		this.app.use(bodyParser.urlencoded({
			extended: true
		}));
		this.app.use(bodyParser.json());
		this.app.use(cookieParser());
		this.app.use(session({
			secret: 'please_change_this_later'
		}));
		this.app.use(passport.initialize());
		this.app.use(passport.session());
		
		this.app.use(express.static(path.resolve('web/public')));
		
		passport.use(new twitchStrategy.Strategy({
			clientID: settings.services.twitch.clientId,
			clientSecret: settings.services.twitch.clientSecret,
			callbackURL: settings.services.twitch.callbackUrl,
			scope: 'user_read'
		}, async (accessToken, refreshToken, profile, done) => {
			try {
				var user = await this.users.findOrCreateByServiceId('twitch', profile.id);

				console.log('Logged in as ' + user.id);

				return done(null, user);
			} catch(e) {
				console.log('oh shit');
				return done(null, false);
			}
			console.log(profile);
			// return done(null, profile);
		}));
		
		passport.serializeUser((user: User, done: (err, id) => void) => {
			console.log('Serializing user ' + user.id);
			done(null, user.id);
		});
		
		passport.deserializeUser(async (id: string, done: (err, user) => void) => {
			console.log('Deserializing from user ID ' + id)
			var user = await this.users.findById(id);
			done(null, user);
		});
		
		this.app.get('/api/user', (req, res) => {
			res.json({
				user: req.user ? req.user : null
			});
		});

		this.app.get('/api/*', (req, res) => {
			res.json({});
		});

		this.app.get('/auth/twitch', passport.authenticate('twitch.js'));
		this.app.get('/auth/twitch/callback', passport.authenticate('twitch.js', {
			failureRedirect: '/'
		}), (req, res) => {
			res.redirect('/');
		});

		this.app.get('/logout', (req, res) => {
			req.logout();
			res.redirect('/');
		});
		
		this.app.get('/dist/bundle.js', (req, res) => {
			if(isProduction) {
				res.sendFile(__dirname + '/../../web/public/dist/bundle.js');
			} else {
				res.redirect('http://localhost:16835/dist/bundle.js');
			}
		});
		
		this.app.get('*', (req, res) => {
			console.log(req.isAuthenticated());
			console.log(req.user);
			res.sendFile(path.resolve('src/views/index.html'));
		});
		
		this.app.listen(16834);
	}
}