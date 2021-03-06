import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';
import {RouteComponentProps} from 'react-router';
import {Trans, withTranslation, WithTranslation} from 'react-i18next';

import {Alert, Alignment, Button, Classes, Dialog, Drawer, FormGroup, InputGroup, Intent, HTMLTable, Navbar, NonIdealState, Spinner} from '@blueprintjs/core';

import AuthContext from '../../components/AuthContext';
import IAuthProps from '../../components/interfaces/IAuthProps';
import ITargetSelectionEntry from '../../components/interfaces/ITargetSelectionEntry';
import NewCommand from './commands/NewCommand';

interface CommandsPageProps extends IAuthProps, RouteComponentProps, WithTranslation {
	selected: ITargetSelectionEntry
}

interface CommandsPageState {
	commandDrawerId: string,
	commandDrawerOpen: boolean,
	data: {
		aliases: any,
		commands: any
	},
	loading: boolean,
	newCommandOpen: boolean,
	removeCommandAlertId: string,
	removeCommandAlertOpen: boolean
}

class CommandsPage extends React.Component<CommandsPageProps, CommandsPageState> {
	constructor(props) {
		super(props);

		this.state = {
			commandDrawerId: '',
			commandDrawerOpen: false,
			data: {
				aliases: {},
				commands: {}
			},
			loading: true,
			newCommandOpen: false,
			removeCommandAlertId: '',
			removeCommandAlertOpen: false
		}

		this.handleCommandDrawerClose = this.handleCommandDrawerClose.bind(this);
		this.handleCommandDrawerOpen = this.handleCommandDrawerOpen.bind(this);
		this.handleNewCommandClose = this.handleNewCommandClose.bind(this);
		this.handleNewCommandOpen = this.handleNewCommandOpen.bind(this);
		this.handleRemoveCommandAlertClose = this.handleRemoveCommandAlertClose.bind(this);
		this.handleRemoveCommandAlertOpen = this.handleRemoveCommandAlertOpen.bind(this);
		this.handleRemoveCommandAlertSubmit = this.handleRemoveCommandAlertSubmit.bind(this);
	}

	componentDidUpdate(prevProps) {
		if(this.props.selected.target.service != prevProps.selected.target.service || this.props.selected.target.serviceId != prevProps.selected.target.serviceId) {
			this.getCommands();
		}
	}

	componentDidMount() {
		this.getCommands();
	}

	async getCommands() {
		await this.setState({
			loading: true
		});

		axios.get('/api/target/' + this.props.selected.target.service + '/' + this.props.selected.target.serviceId + '/commands').then((response) => {
			this.setState({
				data: response.data,
				loading: false,
			});
		});
	}

	handleCommandDrawerClose() {
		this.setState({
			commandDrawerId: '',
			commandDrawerOpen: false
		});
	}

	handleCommandDrawerOpen(commandId) {
		this.setState({
			commandDrawerId: commandId,
			commandDrawerOpen: true
		});
	}

	handleNewCommandClose(event, shouldGetCommands: boolean = false) {
		if(shouldGetCommands) this.getCommands();
		this.setState({
			newCommandOpen: false
		});
	}

	handleNewCommandOpen() {
		this.setState({
			newCommandOpen: true
		});
	}

	handleRemoveCommandAlertClose() {
		this.setState({
			removeCommandAlertId: '',
			removeCommandAlertOpen: false
		})
	}

	handleRemoveCommandAlertOpen(commandId) {
		this.setState({
			removeCommandAlertId: commandId,
			removeCommandAlertOpen: true
		});
	}

	handleRemoveCommandAlertSubmit() {
		axios.delete(`/api/target/${this.props.selected.target.service}/${this.props.selected.target.serviceId}/command/${this.state.removeCommandAlertId}`).then((response) => {
			this.handleRemoveCommandAlertClose();
			this.getCommands();
		});
	}

	render() {
		const {t} = this.props;
        return (
            <>
				{!this.state.loading && Object.keys(this.state.data.aliases).length > 0 &&
					<>
						<Navbar className="mt-1">
							<Navbar.Group align={Alignment.LEFT}>
								<Button intent="primary" onClick={this.handleNewCommandOpen} text={t('dashboard/commands:actions.newCommand')} />
							</Navbar.Group>
						</Navbar>
						<HTMLTable interactive striped className="CommandsPage-Table mt-2">
							<thead>
								<tr>
									<th style={{width: '20%'}}>{t('dashboard/commands:table.headings.alias')}</th>
									<th style={{width: '10%'}}>{t('dashboard/commands:table.headings.command')}</th>
									<th style={{width: '50%'}}>{t('dashboard/commands:table.headings.handler')}</th>
									<th style={{width: '20%'}}>{t('dashboard/commands:table.headings.actions')}</th>
								</tr>
							</thead>
							<tbody>
								{!this.state.loading && Object.keys(this.state.data.aliases).map((alias) => {
									var commandId = this.state.data.aliases[alias];
									var handler = this.state.data.commands[commandId].handler;

									return (
										<tr key={commandId}>
											<td onClick={() => this.handleCommandDrawerOpen(commandId)}>{alias}</td>
											<td onClick={() => this.handleCommandDrawerOpen(commandId)}>{commandId}</td>
											<td onClick={() => this.handleCommandDrawerOpen(commandId)}>{handler} - {t('handlers:' + handler)}</td>
											<td>
												<Button onClick={() => this.handleCommandDrawerOpen(commandId)}>{t('common:actions.edit')}</Button>
												{' '}
												<Button onClick={() => this.handleRemoveCommandAlertOpen(commandId)} intent="danger">{t('common:actions.remove')}</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</HTMLTable>
					</>
				}

				{!this.state.loading && !Object.keys(this.state.data.aliases).length && 
					<NonIdealState
						icon="console"
						title={t('dashboard/commands:alerts.noCommandsDefined.title')}
						description={<><Trans i18nKey="dashboard/commands:alerts.noCommandsDefined.description" /></>}
						action={<Button intent="primary" onClick={this.handleNewCommandOpen} text={t('dashboard/commands:actions.newCommand')} />}
					/>
				}

				{this.state.loading && <><br /><Spinner size={Spinner.SIZE_SMALL} /></>}

				<Drawer
					className={Classes.DARK}
					icon="edit"
					isOpen={this.state.commandDrawerOpen}
					onClose={this.handleCommandDrawerClose}
					title={t('dashboard/commands:drawer.title', {commandId: this.state.commandDrawerId})}
				>
					<div className={Classes.DRAWER_BODY}>
						<div className={Classes.DIALOG_BODY}>

						</div>
						<div className={Classes.DIALOG_FOOTER}>
						
						</div>
					</div>
				</Drawer>

				<NewCommand isOpen={this.state.newCommandOpen} onClose={this.handleNewCommandClose} onOpen={this.handleNewCommandOpen} selected={this.props.selected} />

				<Alert
					className={Classes.DARK}
					cancelButtonText={t('dashboard/commands:removeCommand.actions.cancel')}
					confirmButtonText={t('dashboard/commands:removeCommand.actions.confirm')}
					icon="trash"
					intent={Intent.DANGER}
					isOpen={this.state.removeCommandAlertOpen}
					onCancel={this.handleRemoveCommandAlertClose}
					onConfirm={this.handleRemoveCommandAlertSubmit}
				>
					<p>{<Trans i18nKey="dashboard/commands:removeCommand.description" values={{commandId: this.state.removeCommandAlertId}} />}</p>
				</Alert>
			</>
        )
	}
}

const CommandsPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <CommandsPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(withTranslation(['dashboard/commands', 'handlers'])(CommandsPageAuth));