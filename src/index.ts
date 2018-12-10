import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cookieSession from 'cookie-session';
import * as express from 'express';
import * as passport from 'passport';
import * as twitchStrategy from 'passport-twitch.js';

const isProduction = process.env.NODE_ENV == 'production';

var settings = require('../settings.json');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(cookieSession({
    secret: 'please_change_this_later'
}));
app.use(passport.initialize());

app.use(express.static(__dirname + '/../web/public'));

passport.use(new twitchStrategy.Strategy({
    clientID: settings.services.twitch.clientId,
    clientSecret: settings.services.twitch.clientSecret,
    callbackURL: settings.services.twitch.callbackUrl,
    scope: 'user_read'
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/auth/twitch', passport.authenticate('twitch.js'));
app.get('/auth/twitch/callback', passport.authenticate('twitch.js', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});

app.get('/dist/bundle.js', (req, res) => {
    if(isProduction) {
        res.sendFile(__dirname + '/../web/public/dist/bundle.js');
    } else {
        res.redirect('http://localhost:16835/dist/bundle.js');
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.listen(16834);