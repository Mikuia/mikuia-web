import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';
import {Link, Route, RouteComponentProps, withRouter} from 'react-router-dom';

import {Alignment, Button, Menu, Navbar, Popover, Spinner} from '@blueprintjs/core';

import IAuth from '../components/interfaces/IAuth';
import IAuthProps from '../components/interfaces/IAuthProps';

import AppToaster from '../components/AppToaster';
import AuthContext from '../components/AuthContext';
import Container from '../components/Container';
import PrivateRoute from '../components/PrivateRoute';

import AccountPage from '../pages/AccountPage';
import IndexPage from '../pages/IndexPage';
import SettingsPage from '../pages/SettingsPage';
import IApiAuthResponse from '../components/interfaces/responses/IApiAuthResponse';

interface DefaultLayoutProps extends IAuthProps, RouteComponentProps {}
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
		window.addEventListener('storage', (e) => {
			if(e.storageArea === localStorage && e.key == 'loggedIn') {
				AppToaster.show({
					intent: 'warning',
					message: 'Session changed, refreshing login info...'
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
					<Navbar>
						<Container>
							<Navbar.Group>
								<Navbar.Heading>
									<img src="/images/logo.png" />
								</Navbar.Heading>
								<Navbar.Divider />
								<Link to="/">
									<Button minimal text="Home" />
								</Link>
								<Link to="/account">
									<Button minimal text="Account" />
								</Link>
								<Link to="/settings">
									<Button minimal text="Settings" />
								</Link>
							</Navbar.Group>
							<Navbar.Group align={Alignment.RIGHT}>
								{this.state.loading ? <Button minimal loading /> : (
									this.state.auth.user ? (
										<Popover>
											<Button minimal icon="user" text={this.state.auth.user.id} rightIcon="caret-down" />
											<Menu>
												<Menu.Item onClick={() => this.props.history.push('/settings')} tagName="span" text="Settings" />
												<Menu.Item onClick={() => this.props.history.push('/account')} tagName="span" text="Account" />
												<Menu.Divider />
												<Menu.Item onClick={this.logout} text="Logout" />
											</Menu>
										</Popover>
									) : (
										<Popover>
											<Button minimal text="Login" />
											<Menu>
												<Menu.Item href="/auth/twitch" text="Login with Twitch" />
												<Menu.Divider />
												<Menu.Item href="/auth/discord" text="Login with Discord" />
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
							<PrivateRoute path="/settings" auth={this.state.auth} component={SettingsPage} />
						</React.Fragment>
					)}
				</div>
			</AuthContext.Provider>
		)
	}
}

export default hot(module)(withRouter(DefaultLayout));