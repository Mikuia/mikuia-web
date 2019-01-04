import axios from 'axios';
import React from 'react';
import {hot} from 'react-hot-loader';
import {Redirect, Route} from 'react-router-dom';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Navbar, NavbarBrand, Nav, NavItem, NavLink, Row, UncontrolledDropdown} from 'reactstrap';
import {LinkContainer} from 'react-router-bootstrap';

import AuthContext from '../components/AuthContext';

import IndexPage from '../pages/IndexPage';
import SettingsPage from '../pages/SettingsPage';

function PrivateRoute({component: Component, auth, ...rest}) {
	return (
		<Route {...rest} render={props => auth.user ? (
			<Component {...props} />
		) : (
			<Redirect to="/" />
		)} />
	)
}

class DefaultLayout extends React.Component {
	constructor() {
		super();

		this.state = {
			auth: {
				user: false
			},
			error: false
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
				import(/* webpackChunkName: 'npm.noty' */ 'noty').then(({default: Noty}) => {
					new Noty({
						layout: 'topCenter',
						theme: 'mikuia',
						timeout: 3000,
						type: 'warning',
						text: 'Session changed, refreshing login info...'
					}).show();
				});
				this.getAuth();
			}
		})
	}

	getAuth() {
		axios.get('/api/auth').then((response) => {
			localStorage.setItem('loggedIn', response.data.user ? true : false);

			this.setState({
				auth: response.data
			});
		});
	}

	logout() {
		axios.post('/logout').then((response) => {
			this.getAuth();
		});
	}

	render() {
		if(this.state.error) {
			return (
				<Container>
					<Row>
						<Col md={{size: 6, offset: 3}}>
							<div>
								<Row>
									<Col className="error">
										<h4 className="color-error mt-1 mb-0">Error</h4>
										Something happened.
									</Col>
								</Row>
							</div>
						</Col>
					</Row>
				</Container>
			)
		}

		return (
			<AuthContext.Provider value={this.state.auth}>
				<Navbar dark color="mikuia" expand="md">
					<Container>
						<NavbarBrand href="/">
							<img className="mb-auto" src="/images/logo.png" />
							{/* Mikuia */}
						</NavbarBrand>
						<Nav className="mr-auto" navbar>
							<NavItem>
								<LinkContainer exact to="/">
									<NavLink>Home</NavLink>
								</LinkContainer>
							</NavItem>
							<NavItem>
								<LinkContainer to="/settings">
									<NavLink>Settings</NavLink>
								</LinkContainer>
							</NavItem>
						</Nav>
						<Nav className="ml-auto" navbar>
							<Choose>
								<When condition={this.state.auth.user}>
									<UncontrolledDropdown nav inNavbar>
										<DropdownToggle nav caret>
											{this.state.auth.user.id}
										</DropdownToggle>
										<DropdownMenu right>
											<LinkContainer to="/settings">
												<DropdownItem>
													Settings
												</DropdownItem>
											</LinkContainer>
											<DropdownItem divider />
											<DropdownItem onClick={this.logout}>
												Logout
											</DropdownItem>
										</DropdownMenu>
									</UncontrolledDropdown>
								</When>
								<When condition={this.state.auth.user === false}>
									<NavItem>
										<FontAwesomeIcon icon={['fas', 'spinner']} spin={true} />
									</NavItem>
								</When>
								<Otherwise>
								<NavItem>
										<NavLink href="/auth/discord">Login with Discord</NavLink>
									</NavItem>
									<NavItem>
										<NavLink href="/auth/twitch">Login with Twitch</NavLink>
									</NavItem>
								</Otherwise>
							</Choose>
						</Nav>
					</Container>
				</Navbar>

				<Choose>
					<When condition={this.state.auth.user === false}>
						<div className="align-center">
							<FontAwesomeIcon icon={['fas', 'spinner']} spin={true} />
						</div>
					</When>
					<Otherwise>
						<Route exact path="/" component={IndexPage} />
           				<PrivateRoute path="/settings" auth={this.state.auth} component={SettingsPage} />
					</Otherwise>
				</Choose>

			</AuthContext.Provider>
		)
	}
}

export default hot(module)(DefaultLayout);