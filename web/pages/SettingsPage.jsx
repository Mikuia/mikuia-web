import React from 'react';
import {hot} from 'react-hot-loader';
import {Route} from 'react-router-dom';

import {Col, Container, Nav, NavItem, NavLink, Row} from 'reactstrap';
import {LinkContainer} from 'react-router-bootstrap';

import AuthContext from '../components/AuthContext';
import StatusPage from './settings/StatusPage';
import TargetSelector from '../components/settings/TargetSelector';

class SettingsPage extends React.Component {
	constructor() {
		super();

		this.state = {
			selected: {
				service: false,
				serviceId: false
			}
		}
		
		this.handleTargetSelection = this.handleTargetSelection.bind(this);
	}

	handleTargetSelection(selection) {
		this.setState({
			selected: selection.value
		});
	}

	render() {
        return (
            <Container>
				<Row>
					<Col md="3">
						<small>Target</small>
						<br />
						<TargetSelector onChange={this.handleTargetSelection} />
						<br />
						<If condition={this.state.selected.service && this.state.selected.serviceId}>
							<small>Settings</small>
							<Nav pills vertical>
								<NavItem>
									<LinkContainer to="/settings">
										<NavLink>Status</NavLink>
									</LinkContainer>
								</NavItem>
							</Nav>
						</If>
					</Col>
					<Col md="9">
						<Route path="/settings" render={(props) => <StatusPage {...props} selected={this.state.selected} />} />
					</Col>
				</Row>
			</Container>
        )
	}
}

const SettingsPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <SettingsPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(SettingsPageAuth);