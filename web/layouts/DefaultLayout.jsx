import React from 'react';
import {hot} from 'react-hot-loader';

import {Col, Container, Navbar, NavbarBrand, Nav, NavItem, NavLink, Row} from 'reactstrap';

import Test from '../components/Test';

class DefaultLayout extends React.Component {
	constructor() {
		super();

		this.state = {
			error: false
		}
	}

	componentDidCatch(error, info) {
		console.log(error);
		console.log(info);
		this.setState({
			error: true
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
			<div>
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
							<NavItem>
								<NavLink href="/auth/twitch">Login with Twitch</NavLink>
							</NavItem>
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
			</div>
		)
	}
}

export default hot(module)(DefaultLayout);