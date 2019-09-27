import * as React from 'react';
import {hot} from 'react-hot-loader';
import {Route, withRouter, RouteComponentProps} from 'react-router-dom';

import {Callout, Icon, Tab, Tabs, TabId} from '@blueprintjs/core';
import {Box, Flex} from 'reflexbox';

import IAuthProps from '../components/interfaces/IAuthProps';
import ITargetSelectionEntry from '../components/interfaces/ITargetSelectionEntry';

import AuthContext from '../components/AuthContext';
import CommandsPage from './settings/CommandsPage';
import Container from '../components/Container';
import PluginsPage from './settings/PluginsPage';
import StatusPage from './settings/StatusPage';
import TargetSelection from '../components/settings/TargetSelection';

interface SettingsPageProps extends IAuthProps, RouteComponentProps {}
interface SettingsPageState {
	activeTab: TabId,
	selected: ITargetSelectionEntry | null
}

class SettingsPage extends React.Component<SettingsPageProps, SettingsPageState> {
	constructor(props) {
		super(props);

		this.state = {
			activeTab: '',
			selected: null
		}
		
		this.handleTabSelection = this.handleTabSelection.bind(this);
		this.handleTargetSelection = this.handleTargetSelection.bind(this);
	}

	handleTabSelection(newTabId: TabId) {
		var path = '/settings';

		switch(newTabId) {
			case 'commands':
				path = '/settings/commands';
				break;
			case 'plugins':
				path = '/settings/plugins';
				break;
		}

		this.props.history.push(path);
	}

	handleTargetSelection(selection: ITargetSelectionEntry) {
		this.setState({
			selected: selection
		});
	}

	getActiveTab() {
		var path = this.props.location.pathname;
		var tab = 'status';

		switch(path) {
			case '/settings/commands':
				tab = 'commands';
				break;
			case '/settings/plugins':
				tab = 'plugins';
				break;
		}

		return tab;
	}

	render() {
        return (
            <Container>
				<Flex>
					<Box className="SettingsPage-Sidebar" width={1/4} px={3}>
						<small>Target</small>
						<TargetSelection className="SettingsPage-TargetSelection mt-1" onItemSelect={this.handleTargetSelection} selected={this.state.selected} />
						<br />
						{this.state.selected && (
							<React.Fragment>
								<small>Settings</small>

								<Tabs id="SettingsPage-Tabs" vertical className="SettingsPage-Tabs mt-1" selectedTabId={this.getActiveTab()} onChange={this.handleTabSelection}>
									<Tab id="status" className="bp3-fill"><Icon icon="pulse" className="mr-2" />Status</Tab>
									<Tab id="commands" className="bp3-fill"><Icon icon="console" className="mr-2" />Commands</Tab>
									<Tab id="plugins" className="bp3-fill"><Icon icon="code-block" className="mr-2" />Plugins</Tab>
								</Tabs>
							</React.Fragment>
						)}
					</Box>
					<Box width={3/4}>
						{!this.state.selected ? (
							<div>
								<Callout className="mt-2" icon="warning-sign" intent="primary" title="Choose your platform.">
									Select your platform from the dropdown on the left.
								</Callout>
							</div>
						) : (
							<div>
								<Route exact path="/settings" render={(props) => <StatusPage {...props} selected={this.state.selected} />} />
								<Route path="/settings/commands" render={(props) => <CommandsPage {...props} selected={this.state.selected} />} />
								<Route path="/settings/plugins" render={(props) => <PluginsPage {...props} selected={this.state.selected} />} />
							</div>
						)}
					</Box>
				</Flex>
			</Container>
        )
	}
}

const SettingsPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <SettingsPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(withRouter(SettingsPageAuth));