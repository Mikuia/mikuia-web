import React from 'react';
import {hot} from 'react-hot-loader';
import {Route} from 'react-router-dom';

import {Col, Container, Nav, NavItem, NavLink, Row} from 'reactstrap';
import {LinkContainer} from 'react-router-bootstrap';

import AuthContext from '../components/AuthContext';
import PluginsPage from './settings/PluginsPage';
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
									<LinkContainer exact to="/settings">
										<NavLink>Status</NavLink>
									</LinkContainer>
									<LinkContainer to="/settings/plugins">
										<NavLink>Plugins</NavLink>
									</LinkContainer>
								</NavItem>
							</Nav>
						</If>
					</Col>
					<Col md="9">
						<Choose>
							<When condition={!this.state.selected.service}>
								<small>Settings</small>
								<br />
								Please select your platform first.
							</When>
							<Otherwise>
								<Route exact path="/settings" render={(props) => <StatusPage {...props} selected={this.state.selected} />} />
								<Route path="/settings/plugins" render={(props) => <PluginsPage {...props} selected={this.state.selected} />} />
							</Otherwise>
						</Choose>
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