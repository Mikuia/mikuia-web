import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';

import {AnchorButton, Button, Card} from '@blueprintjs/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import IAuthProps from '../components/interfaces/IAuthProps';
import IDiscordProfile from '../components/interfaces/services/IDiscordProfile';
import ITwitchProfile from '../components/interfaces/services/ITwitchProfile';

import AppToaster from '../components/AppToaster';
import AuthContext from '../components/AuthContext';
import Container from '../components/Container';

import Common from '../common';

interface IAccountPageProfiles {
	discord?: IDiscordProfile;
	twitch?: ITwitchProfile;
}

interface IAccountPageServices {
	discord?: string;
	twitch?: string;
}

interface IAccountPageProps extends IAuthProps {}
interface IAccountPageState {
	loading: boolean;
	profiles: IAccountPageProfiles;
	services: IAccountPageServices;
}

class AccountPage extends React.Component<IAccountPageProps, IAccountPageState> {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			profiles: {},
			services: {}
		}

		this.getServices();

		this.unlinkService = this.unlinkService.bind(this);
	}

	getProfile(service) {
		axios.get('/api/auth/profile/' + service).then((response) => {
			this.setState({
				profiles: {
					...this.state.profiles,
					[service]: response.data.service
				}
			});
		});
	}

	getServices() {
		axios.get('/api/auth/services').then((response) => {
			this.setState({
				loading: false,
				services: response.data.services
			}, () => {
				for(let service of Object.keys(this.state.services)) {
					this.getProfile(service);
				}
			});
		});
	}

    render() {
		if(!this.props.auth.user) return;

		return (
			<Container>
				<h1 className="bp3-heading">Account</h1>
				User ID: <b>{this.props.auth.user.id}</b>
				<br /><br />

				<h2 className="bp3-heading">Connections</h2>

				{this.state.loading ? (
					<FontAwesomeIcon icon={['fas', 'spinner']} spin={true} />
				) : Object.keys(this.state.services).map((service) => {
					var serviceId = this.state.services[service];
					return this.renderService(service);
				})}

				{!this.state.services.twitch && (
					<AnchorButton className="mb-2" href="/connect/twitch">
						<FontAwesomeIcon className="mr-1" icon={['fab', 'twitch']} />
						{' '}
						Connect with Twitch
					</AnchorButton>
				)}

				<br />

				{!this.state.services.discord && (
					<AnchorButton href="/connect/discord">
						<FontAwesomeIcon className="mr-1" icon={['fab', 'discord']} />
						{' '}
						Connect with Discord
					</AnchorButton>
				)}

			</Container>
        );
	}
	
	renderServiceDetails(data) {
		return (
			<Card className="mb-4" key={data.service}>
				<h5 className={"bp3-heading color-service-" + data.service}>
					<FontAwesomeIcon className="mr-1" icon={['fab', data.service]} />
					{' '}
					{Common.SERVICE_NAMES[data.service]}
				</h5>
				
				<p>Connected as <b>{data.name}</b>.</p>
				<Button intent="danger" text="Unlink" onClick={() => this.unlinkService(data.service)} />
			</Card>
		)
	}

	renderService(service) {
		switch(service) {
			case 'discord':
				if(this.state.profiles.discord === undefined) return;
				return this.renderServiceDetails({
					service: service,
					name: this.state.profiles.discord.username + '#' + this.state.profiles.discord.discriminator,
					avatar: 'https://cdn.discordapp.com/avatars/' + this.state.profiles.discord.id + '/' + this.state.profiles.discord.avatar + '.png'
				});
			case 'twitch':
				if(this.state.profiles.twitch === undefined) return;
				return this.renderServiceDetails({
					service: service,
					name: this.state.profiles.twitch.display_name,
					avatar: this.state.profiles.twitch.profile_image_url
				});
		}
	}

	unlinkService(service) {
		if(Object.keys(this.state.services).length < 2) {
			AppToaster.show({
				intent: 'danger',
				message: 'Cannot unlink your only connection.'
			});
		} else {
			axios.post('/disconnect/' + service).then((response) => {
				this.getServices();
			});
		}
	}
}

const AccountPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <AccountPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(AccountPageAuth);