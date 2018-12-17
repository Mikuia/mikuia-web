import axios from 'axios';
import React from 'react';
import {hot} from 'react-hot-loader';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Navbar, NavbarBrand, Nav, NavItem, NavLink, Row, UncontrolledDropdown} from 'reactstrap';

import AuthContext from '../components/AuthContext';

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

	getAuth() {
		axios.get('/api/user').then((response) => {
			this.setState({
				auth: response.data
			});
		});
	}

	logout() {
		this.setState({
			auth: {
				user: false
			}
		}, () => {
			axios.get('/logout').then((response) => {
				this.getAuth();
			});
		});
	}

	render() {
		if(this.state.error) {
			return (
				<Container>
					<Row>
						<Col md={{size: 6, offset: 3}}>
							<div >
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
								<NavLink active href="/">Home</NavLink>
							</NavItem>
							<NavItem>
								<NavLink href="/">Poop</NavLink>
							</NavItem>
							<NavItem>
								<NavLink href="/">Butts</NavLink>
							</NavItem>
							<NavItem>
								<NavLink href="/">Dicks</NavLink>
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
				<Container>
					<Row>
						<Col md="12">
							<h1>Headline</h1>
							Something interesting.
						</Col>
					</Row>
				</Container>
			</AuthContext.Provider>
		)
	}
}

export default hot(module)(DefaultLayout);