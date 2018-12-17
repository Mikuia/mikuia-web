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

	async findByUserId(userId: string): Promise<User> {
		return new Promise<User>(async (resolve, reject) => {
			var user = await this.db.hgetallAsync('user:' + userId);

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
				var user = await this.findByUserId(userId);
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

				await this.linkWithServiceId(user.id, service, serviceId);
				resolve(user);
			}
		});
	}

	async getServiceProfile(service: string, serviceId: string) {
		return new Promise<object>(async (resolve, reject) => {
			var profile = await this.db.hgetallAsync('service:' + service + ':user:' + serviceId);

			resolve(profile);
		});
	}

	async getServicesByUserId(userId: string) {
		return new Promise<object>(async (resolve, reject) => {
			var services = await this.db.hgetallAsync('user:' + userId + ':services');

			resolve(services);
		});
	}

	async linkWithServiceId(userId: string, service: string, serviceId: string): Promise<void> {
		return new Promise(async (resolve) => {
			await this.db.hsetAsync('users:service:' + service, serviceId, userId);
			await this.db.hsetAsync('user:' + userId + ':services', service, serviceId);

			resolve();
		});
	}

	async saveServiceProfile(service: string, serviceId: string, profile: object) {
		return new Promise(async (resolve) => {
			await this.db.hmsetAsync('service:' + service + ':user:' + serviceId, profile);

			resolve();
		});
	}
}