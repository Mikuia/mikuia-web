import {User} from './user';
import {PromisifiedRedisClient} from './typings/redis';

export class Users {	
	constructor(private db: PromisifiedRedisClient) {}

	async create(): Promise<User> {
		return new Promise<User>(async (resolve) => {
			var userId = Math.random().toString(36).slice(-10);

			await this.db.saddAsync('users', userId);
			await this.db.hsetAsync('user:' + userId, 'id', userId);

			var user = await this.db.hgetallAsync('user:' + userId);

			resolve(user);
		});
	}

	async findById(id: string): Promise<User> {
		return new Promise<User>(async (resolve, reject) => {
			var user = await this.db.hgetallAsync('user:' + id);

			if(!user) {
				reject(new Error('User with this ID does not exist.'));
			} else {
				resolve(user);
			}
		});
	}

	async findByServiceId(service: string, serviceId: string): Promise<User> {
		return new Promise<User>(async (resolve, reject) => {
			var userId = await this.db.hgetAsync('users:service:' + service, serviceId);

			if(!userId) {
				reject(new Error('Cannot find an user associated with this service type and service ID.'));
			} else {
				var user = await this.findById(userId);
				resolve(user);
			}
		});
	}

	async findOrCreateByServiceId(service: string, serviceId: string): Promise<User> {
		return new Promise<User>(async (resolve, reject) => {
			try {
				var user = await this.findByServiceId(service, serviceId);
				resolve(user);
			} catch(e) {
				console.log('User does not exist, creating one.');
				var user = await this.create();

				await this.linkWithServiceId(user, service, serviceId);
				resolve(user);
			}
		});
	}

	async linkWithServiceId(user: User, service: string, serviceId: string): Promise<void> {
		return new Promise(async (resolve) => {
			await this.db.hsetAsync('users:service:' + service, serviceId, user.id);
			await this.db.hsetAsync('user:' + user.id + ':services', service, serviceId);

			resolve();
		});
	}
}