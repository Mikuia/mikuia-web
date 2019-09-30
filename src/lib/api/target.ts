import * as express from 'express';
import {Route} from '../route';
import {Commands, PromisifiedRedisClient, Targets, Users} from 'mikuia-shared';

export class TargetRoute extends Route {
	private commands: Commands;
	private targets: Targets;
	private users: Users;

	async checkTargetAuth(req: express.Request): Promise<boolean> {
		if(!req.user) return false;

		var targetAuth = await this.targets.checkAuth(req.user.id, req.params.service, req.params.serviceId);
		if(targetAuth) return true;

		return false;
	}

	constructor(db: PromisifiedRedisClient) {
		super(db);

		this.commands = new Commands(db);
		this.targets = new Targets(db);
		this.users = new Users(db);

		// this.app.delete('/api/target/:service/:serviceId/command/:commandId', async (req, res) => {
		// 	var targetAuth = await this.checkTargetAuth(req.user, req.params.service, req.params.serviceId);
		// 	if(!targetAuth) return res.sendStatus(403);
		// });

		this.router.get('/:service/:serviceId', async (req, res) => {
			var target = await this.db.hgetallAsync(`target:${req.params.service}:${req.params.serviceId}`);
			var result = {
				image: '',
				name: req.params.service + ':' + req.params.serviceId
			}

			if(target) result = target;
			if(!target && req.params.service == 'twitch') {
				var profile = await this.users.getServiceProfile(req.params.service, req.params.serviceId) as any;
				if(profile) {
					result.image = profile.profile_image_url;
					result.name = profile.display_name;
				}
			}

			res.json({
				target: result
			});
		});

		this.router.get('/:service/:serviceId/commands', async (req, res) => {
			if(!this.checkTargetAuth(req)) return res.sendStatus(403);

			var aliases = await this.commands.getAliases(req.params.service, req.params.serviceId);
			var commands = await this.commands.getAll(req.params.service, req.params.serviceId);
			res.json({
				aliases: aliases,
				commands: commands
			});
		});

		this.router.post('/:service/:serviceId/commands', async (req, res) => {
			if(!this.checkTargetAuth(req)) return res.sendStatus(403);

			var command = await this.commands.create(req.params.service, req.params.serviceId, req.body.handler);
			await this.commands.addAlias(req.params.service, req.params.serviceId, req.body.alias, command.id);

			res.json({
				id: command.id
			});
		});

		this.router.get('/:service/:serviceId/plugins', async (req, res) => {
			if(!this.checkTargetAuth(req)) return res.sendStatus(403);

			var plugins = await this.targets.getByServiceId(req.params.service, req.params.serviceId).getPlugins();

			res.json({
				plugins: plugins
			});
		});

		this.router.get('/:service/:serviceId/status', async (req, res) => {
			if(!this.checkTargetAuth(req)) return res.sendStatus(403);

			var enabled = await this.db.sismemberAsync('service:' + req.params.service + ':targets:enabled', req.params.serviceId);

			res.json({
				status: {
					enabled: enabled ? true : false
				}
			});
		});

		this.router.post('/:service/:serviceId/toggle', async (req, res) => {
			if(!this.checkTargetAuth(req)) return res.sendStatus(403);

			if(req.body.enable == undefined) return res.sendStatus(400);

			if(req.body.enable) {
				await this.db.saddAsync('service:' + req.params.service + ':targets:enabled', req.params.serviceId);
			} else {
				await this.db.sremAsync('service:' + req.params.service + ':targets:enabled', req.params.serviceId);
			}

			res.sendStatus(200);
		});
	}
}