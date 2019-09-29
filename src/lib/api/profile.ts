import {Route} from '../route';
import {PromisifiedRedisClient, Users} from 'mikuia-shared';

export class ProfileRoute extends Route {
	private users: Users;

	constructor(db: PromisifiedRedisClient) {
		super(db);

		this.users = new Users(db);

		this.router.get('/:service/:serviceId', async (req, res) => {
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
	}
}