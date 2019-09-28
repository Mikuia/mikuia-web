import * as bluebird from 'bluebird';
import * as redis from 'redis';

bluebird.promisifyAll(redis);

import {PromisifiedRedisClient} from 'mikuia-shared';

import {App} from './lib/app';

export class Web {
    private app: App;
    private db: PromisifiedRedisClient;
    private settings;

    initApp() {
        this.app = new App(this.db, this.settings);
    }

    async initDatabase(): Promise<void> {
        return new Promise((resolve) => {
            this.db = redis.createClient(this.settings.redis) as PromisifiedRedisClient;
        
            this.db.on('ready', () => {
                resolve();
            });

            this.db.on('error', (error) => {
                throw new Error(error);
            });
        });
    }

    loadSettings() {
        try {
            this.settings = require('../settings.json');
        } catch(e) {
            throw new Error('Failed to load the settings.');
        }
    }

    async start() {
        this.loadSettings();

        await this.initDatabase();
        this.initApp();
    }
}

var web = new Web();
web.start();