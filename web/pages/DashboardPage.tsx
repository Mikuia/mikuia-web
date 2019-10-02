import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';
import {withTranslation, WithTranslation} from 'react-i18next';
import {Route, withRouter, RouteComponentProps} from 'react-router-dom';

import {Button, Callout, ControlGroup, Icon, Menu, Popover, Tab, Tabs, TabId, Position, Classes} from '@blueprintjs/core';
import {Box, Flex} from 'reflexbox';

import IAuthProps from '../components/interfaces/IAuthProps';
import ITargetSelectionEntry from '../components/interfaces/ITargetSelectionEntry';

import AuthContext from '../components/AuthContext';
import CommandsPage from './dashboard/CommandsPage';
import Container from '../components/Container';
import PluginPage from './dashboard/PluginPage';
import PluginsPage from './dashboard/PluginsPage';
import StatusPage from './dashboard/StatusPage';
import TargetSelection from '../components/dashboard/TargetSelection';

interface DashboardPageProps extends IAuthProps, RouteComponentProps, WithTranslation {}
interface DashboardPageState {
	activeTab: TabId,
	plugins: string[],
	selected: ITargetSelectionEntry | null
}

class DashboardPage extends React.Component<DashboardPageProps, DashboardPageState> {
	constructor(props) {
		super(props);

		this.state = {
			activeTab: '',
			plugins: [],
			selected: null
		}
		
		this.handleTabSelection = this.handleTabSelection.bind(this);
		this.handleTargetSelection = this.handleTargetSelection.bind(this);
	}

	// componentDidMount() {
	// 	this.getPlugins();
	// }

	getPlugins() {
		if(!this.state.selected) return;
		axios.get(`/api/target/${this.state.selected.target.service}/${this.state.selected.target.serviceId}/plugins`).then((response) => {
			this.setState({
				plugins: response.data.plugins
			});
		});
	}

	handleAddDiscord() {
		localStorage.setItem('dashboardRefreshOnFocus', 'true');
		window.open('https://discordapp.com/oauth2/authorize?client_id=168134212996562945&permissions=0&scope=bot');
	}

	handleTabSelection(newTabId: string) {
		var path = '/dashboard';

		switch(newTabId) {
			case 'commands':
				path = '/dashboard/commands';
				break;
			case 'plugins':
				path = '/dashboard/plugins';
				break;
		}

		if(newTabId.indexOf('plugin-') > -1) {
			path = '/dashboard/plugins/' + newTabId.replace('plugin-', '');
		}

		this.props.history.push(path);
	}

	async handleTargetSelection(selection: ITargetSelectionEntry | null) {
		await this.setState({
			selected: selection
		});
		this.getPlugins();
	}

	getActiveTab() {
		var path = this.props.location.pathname;
		var tab = 'status';

		switch(path) {
			case '/dashboard/commands':
				tab = 'commands';
				break;
			case '/dashboard/plugins':
				tab = 'plugins';
				break;
		}

		if(path.indexOf('/dashboard/plugins/') > -1) {
			tab = 'plugin-' + path.replace('/dashboard/plugins/', '');
		}

		return tab;
	}

	render() {
		const {t} = this.props;
        return (
            <Container>
				<Flex>
					<Box className="DashboardPage-Sidebar" width={1/4} px={3}>
						<small>{t('dashboard:sidebar.headers.community')}</small>
						<ControlGroup fill className="mt-1">
							<TargetSelection className="DashboardPage-TargetSelection" onItemSelect={this.handleTargetSelection} selected={this.state.selected} />
							<Popover position={Position.BOTTOM}>
								<Button icon="plus" />
								<Menu>
									<Menu.Item icon="plus" onClick={this.handleAddDiscord} text={t('dashboard:sidebar.add.discord')} />
								</Menu>
							</Popover>
						</ControlGroup>
						<br />
						{this.state.selected && (
							<Tabs id="DashboardPage-Tabs" vertical className="DashboardPage-Tabs" selectedTabId={this.getActiveTab()} onChange={this.handleTabSelection}>
								<small className="mb-1">{t('dashboard:sidebar.headers.settings')}</small>
								<Tab id="status" className={Classes.FILL}><Icon icon="pulse" className="mr-2" />{t('dashboard:sidebar.tabs.status')}</Tab>
								<Tab id="commands" className={Classes.FILL}><Icon icon="console" className="mr-2" />{t('dashboard:sidebar.tabs.commands')}</Tab>
								<Tab id="plugins" className={Classes.FILL}><Icon icon="code-block" className="mr-2" />{t('dashboard:sidebar.tabs.plugins')}</Tab>
								<br />

								<small className="mb-1">Plugins</small>
								{this.state.plugins.map((plugin) => (
									<Tab key={`plugin-${plugin}`} id={`plugin-${plugin}`} className={Classes.FILL}><Icon icon="code-block" className="mr-2" />{t(`plugins:${plugin}.name`)}</Tab>
								))}
							</Tabs>
						)}
					</Box>
					<Box width={3/4}>
						{!this.state.selected ? (
							<div>
								<Callout className="mt-2" icon="warning-sign" intent="primary" title={t('dashboard:index.communityCallout.title')}>
									{t('dashboard:index.communityCallout.description')}
								</Callout>
							</div>
						) : (
							<div>
								<Route exact path="/dashboard" render={(props) => <StatusPage {...props} selected={this.state.selected} />} />
								<Route exact path="/dashboard/commands" render={(props) => <CommandsPage {...props} selected={this.state.selected} />} />
								<Route exact path="/dashboard/plugins" render={(props) => <PluginsPage {...props} selected={this.state.selected} />} />
								<Route exact path="/dashboard/plugins/:pluginId" render={(props) => <PluginPage {...props} selected={this.state.selected} />} />
							</div>
						)}
					</Box>
				</Flex>
			</Container>
        )
	}
}

const DashboardPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <DashboardPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(withRouter(withTranslation(['dashboard', 'plugins'])(DashboardPageAuth) as any));