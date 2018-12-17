import axios from 'axios';
import React from 'react';
import {hot} from 'react-hot-loader';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Col, Container, Media, Row} from 'reactstrap';

import AuthContext from '../components/AuthContext';

const SERVICE_NAMES = {
	discord: 'Discord',
	twitch: 'Twitch'
}

class SettingsPage extends React.Component {
	constructor() {
		super();

		this.state = {
			profiles: {},
			services: false
		}

		this.getServices();
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
				services: response.data.services
			}, () => {
				for(let service of Object.keys(this.state.services)) {
					this.getProfile(service);
				}
			});
		});
	}

    render() {
        return (
            <Container>
				<Row>
					<Col md="12">
						<Choose>
							<When condition={this.props.auth.user}>
								<h1>Settings</h1>
								<br />
								
								<h4>Your Acccount</h4>
								User ID: <b>{this.props.auth.user.id}</b>

								<br /><br />

								<h4>Your Connected Services</h4>
								<Choose>
									<When condition={this.state.services === false}>
										<FontAwesomeIcon className="mr-2" icon={['fas', 'spinner']} spin={true} />
										Loading services...
									</When>
									<Otherwise>
										<For each="service" of={Object.keys(this.state.services)}>
											<With serviceId={this.state.services[service]}>
												<Choose>
													<When condition={this.state.profiles[service] == undefined}>
														<Media key={service}>
															<Media left>
																<Media object src="https://placekitten.com/64/64" />
															</Media>
															<Media body className="ml-2">
																<Media heading className="mb-0">
																	<FontAwesomeIcon className="mr-2" icon={['fab', service]} />
																	{SERVICE_NAMES[service]}
																</Media>
																<FontAwesomeIcon className="mr-2" icon={['fas', 'spinner']} spin={true} />
																Loading details...
															</Media>
														</Media>
													</When>
													<Otherwise>
														{this.renderService(service)}
													</Otherwise>
												</Choose>
											</With>
										</For>
									</Otherwise>
								</Choose>
							</When>
							<Otherwise>
								You are not logged in.
							</Otherwise>
						</Choose>						
					</Col>
				</Row>
			</Container>
        )
	}
	
	renderServiceDetails(data) {
		return (
			<Media key={data.service}>
				<Media left>
					<Media object src={data.avatar} height="64" width="64" />
				</Media>
				<Media body className="ml-2">
					<Media heading className="mb-0">
						<FontAwesomeIcon className="mr-2" icon={['fab', data.service]} />
						{data.name}
					</Media>
					<span dangerouslySetInnerHTML={{__html: data.details}} />
				</Media>
			</Media>
		)
	}

	renderService(service) {
		switch(service) {
			case 'discord':
				return this.renderServiceDetails({
					service: service,
					name: 'Discord',
					avatar: 'https://cdn.discordapp.com/avatars/' + this.state.profiles.discord.id + '/' + this.state.profiles.discord.avatar + '.png',
					details: 'Tag: <b>' + this.state.profiles.discord.username + '#' + this.state.profiles.discord.discriminator + '</b><br />User ID: <b>' + this.state.profiles.discord.id + '</b>'
				});
			case 'twitch':
				return this.renderServiceDetails({
					service: service,
					name: 'Twitch',
					avatar: this.state.profiles.twitch.profile_image_url,
					details: 'Display Name: <b>' + this.state.profiles.twitch.display_name + '</b><br />Username: <b>' + this.state.profiles.twitch.login + '</b><br />User ID: <b>' + this.state.profiles.twitch.id + '</b>'
				});
		}
	}
}

const SettingsPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <SettingsPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(SettingsPageAuth);