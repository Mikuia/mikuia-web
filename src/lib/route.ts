import * as express from 'express';
import {PromisifiedRedisClient} from 'mikuia-shared';

export class Route {
	public router: express.Router;

	constructor(protected db: PromisifiedRedisClient) {
		this.router = express.Router();
	}
}