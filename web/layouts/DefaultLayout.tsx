import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';
import {Link, Route, RouteComponentProps, withRouter} from 'react-router-dom';
import {withTranslation, WithTranslation} from 'react-i18next';

import {Alignment, Button, Menu, Navbar, Popover, Spinner} from '@blueprintjs/core';

import IAuth from '../components/interfaces/IAuth';

import AppToaster from '../components/AppToaster';
import AuthContext from '../components/AuthContext';
import Container from '../components/Container';
import PrivateRoute from '../components/PrivateRoute';

import AccountPage from '../pages/AccountPage';
import DashboardPage from '../pages/DashboardPage';
import IndexPage from '../pages/IndexPage';
import IApiAuthResponse from '../components/interfaces/responses/IApiAuthResponse';
import Common from '../common';

interface DefaultLayoutProps extends RouteComponentProps, WithTranslation {}
interface DefaultLayoutState {
	auth: IAuth,
	error: boolean,
	loading: boolean
}

class DefaultLayout extends React.Component<DefaultLayoutProps, DefaultLayoutState> {
	constructor(props) {
		super(props);

		this.state = {
			auth: {
				user: null
			},
			error: false,
			loading: true
		}

		this.getAuth();

		this.logout = this.logout.bind(this);
	}

	componentDidCatch(error, info) {
		console.log(error);
		console.log(info);
		this.setState({
			error: true
		});
	}

	componentDidMount() {
		const {t} = this.props;
		window.addEventListener('storage', (e) => {
			if(e.storageArea === localStorage && e.key == 'loggedIn') {
				AppToaster.show({
					intent: 'warning',
					message: t('common:alerts.sessionChanged')
				});
				this.getAuth();
			}
		})
	}

	getAuth() {
		axios.get('/api/auth').then((response: IApiAuthResponse) => {
			localStorage.setItem('loggedIn', response.data.user ? 'true' : 'false');

			this.setState({
				auth: response.data,
				loading: false
			});
		});
	}

	logout() {
		this.setState({
			loading: true
		}, () => {
			axios.post('/logout').then(() => {
				this.getAuth();
			});
		})
	}

	render() {
		const {t} = this.props;

		if(this.state.error) {
			return (
				<div>
					<h4>Error</h4>
					Something happened.
				</div>
			)
		}

		return (
			<AuthContext.Provider value={this.state.auth}>
				<div className="app bp3-dark">
					<Navbar className="MikuiaNavbar">
						<Container>
							<Navbar.Group>
								<Navbar.Heading>
									<Link to="/">
										<img src="/images/logo.png" />
									</Link>
								</Navbar.Heading>
								<Navbar.Divider />
								<Link to="/">
									<Button minimal text={t('common:pages.index')} />
								</Link>
							</Navbar.Group>
							<Navbar.Group align={Alignment.RIGHT}>
								{this.state.loading ? <Button minimal loading /> : (
									this.state.auth.user ? (
										<Popover>
											<Button minimal icon="user" text={this.state.auth.user.id} rightIcon="caret-down" />
											<Menu>
												<Menu.Item onClick={() => this.props.history.push('/account')} tagName="span" text={t('common:pages.account')} />
												<Menu.Item onClick={() => this.props.history.push('/dashboard')} tagName="span" text={t('common:pages.dashboard')} />
												<Menu.Divider />
												<Menu.Item onClick={this.logout} text={t('header:menu.logout')} />
											</Menu>
										</Popover>
									) : (
										<Popover>
											<Button minimal text="Login" />
											<Menu>
												<Menu.Item href="/auth/twitch" text={t('header:actions.loginWith', {name: Common.SERVICE_NAMES['twitch']})} />
												<Menu.Divider />
												<Menu.Item href="/auth/discord" text={t('header:actions.loginWith', {name: Common.SERVICE_NAMES['discord']})} />
											</Menu>
										</Popover>
									)
								)}
							</Navbar.Group>
						</Container>
					</Navbar>

					{this.state.loading ? (
						<Container>
							<Spinner size={Spinner.SIZE_SMALL} />
						</Container>
					) : (
						<React.Fragment>
							<Route exact path="/" component={IndexPage} />
							<PrivateRoute path="/account" auth={this.state.auth} component={AccountPage} />
							<PrivateRoute path="/dashboard" auth={this.state.auth} component={DashboardPage} />
						</React.Fragment>
					)}
				</div>
			</AuthContext.Provider>
		)
	}
}

export default hot(module)(withRouter(withTranslation()(DefaultLayout) as any));