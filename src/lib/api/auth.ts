import {Route} from '../route';
import {PromisifiedRedisClient, Users} from 'mikuia-shared';

export class AuthRoute extends Route {
	private users: Users;

	constructor(db: PromisifiedRedisClient) {
		super(db);

		this.users = new Users(db);

		this.router.get('/', (req, res) => {
			res.status(200).json({
				user: req.user ? req.user : null
			});
		});

		this.router.get('/profile/:service', async (req, res) => {
			if(!req.isAuthenticated()) return res.status(401).json({
				service: null
			});
		
			var services = await this.users.getServicesByUserId(req.user!.id);
		
			if(services[req.params.service] == undefined) return res.json({
				service: null
			});
		
			var profile = await this.users.getServiceProfile(req.params.service, services[req.params.service]);
		
			console.log(profile);
		
			res.json({
				service: profile
			});
		});

		this.router.get('/services', async (req, res) => {
			if(!req.isAuthenticated()) res.status(401).json({});
		
			var services = await this.users.getServicesByUserId(req.user!.id);
		
			res.json({
				services: services
			});
		});

		this.router.get('/targets', async (req, res) => {
			if(!req.isAuthenticated()) res.status(401).json([]);
		
			var services = await this.users.getServicesByUserId(req.user!.id);
			var targets = [] as any;
		
			for(var service of Object.keys(services)) {
				var serviceId = services[service];
				
				if(service == 'twitch') {
					targets.push({
						service: 'twitch',
						serviceId: serviceId
					});
				} else {
					var userTargets = await this.db.smembersAsync(`user:${req.user!.id}:service:${service}:targets`);
		
					for(var targetId of userTargets) {
						targets.push({
							service: service,
							serviceId: targetId
						});
					}
				}
			}
		
			res.json({
				targets: targets
			});
		});
	}
}





