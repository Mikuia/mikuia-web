import {Route} from '../route';
import {PromisifiedRedisClient} from 'mikuia-shared';

export class DataRoute extends Route {
	constructor(db: PromisifiedRedisClient) {
		super(db);

		this.router.get('/handlers', async (req, res) => {
			var handlers = await this.db.hgetallAsync('mikuia:handlers');

			res.json({
				handlers: handlers
			});
		});
	}
}