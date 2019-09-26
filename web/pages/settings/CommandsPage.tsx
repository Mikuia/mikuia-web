import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';
import {RouteComponentProps} from 'react-router';

import {Alignment, Button, Classes, Dialog, Drawer, FormGroup, InputGroup, HTMLTable, Navbar} from '@blueprintjs/core';

import AuthContext from '../../components/AuthContext';
import IAuthProps from '../../components/interfaces/IAuthProps';
import ITargetSelectionEntry from '../../components/interfaces/ITargetSelectionEntry';

interface CommandsPageProps extends IAuthProps, RouteComponentProps {
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
	newCommand: {
		alias: string,
		handler: string
	},
	newCommandDialogOpen: boolean,
	newCommandSubmitPending: boolean
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
			loading: false,
			newCommand: {
				alias: '',
				handler: '',
			},
			newCommandDialogOpen: false,
			newCommandSubmitPending: false
		}

		this.handleCommandDrawerClose = this.handleCommandDrawerClose.bind(this);
		this.handleCommandDrawerOpen = this.handleCommandDrawerOpen.bind(this);
		this.handleNewCommandDialogChange = this.handleNewCommandDialogChange.bind(this);
		this.handleNewCommandDialogClose = this.handleNewCommandDialogClose.bind(this);
		this.handleNewCommandDialogOpen = this.handleNewCommandDialogOpen.bind(this);
		this.handleNewCommandDialogSubmit = this.handleNewCommandDialogSubmit.bind(this);

		this.getCommands();
	}

	getCommands() {
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

	handleNewCommandDialogChange(e) {
		this.setState({
			newCommand: {
				...this.state.newCommand,
				[e.target.name]: e.target.value
			}
		})
	}

	handleNewCommandDialogClose() {
		this.setState({
			newCommandDialogOpen: false
		});
	}

	handleNewCommandDialogOpen() {
		this.setState({
			newCommandDialogOpen: true
		});
	}

	handleNewCommandDialogSubmit() {
		this.setState({
			newCommandSubmitPending: true
		}, () => {
			axios.post(`/api/target/${this.props.selected.target.service}/${this.props.selected.target.serviceId}/commands`, {
				alias: this.state.newCommand.alias,
				handler: this.state.newCommand.handler
			}).then((response) => {
				this.handleNewCommandDialogClose();
				this.getCommands();
				this.setState({
					newCommandSubmitPending: false
				});
			});
		});
	}

	render() {
        return (
            <React.Fragment>
				<Navbar className="mt-1">
					<Navbar.Group align={Alignment.LEFT}>
						<Button intent="primary" onClick={this.handleNewCommandDialogOpen}>New command</Button>
					</Navbar.Group>
				</Navbar>

				<HTMLTable interactive striped className="CommandsPage-Table mt-2">
					<thead>
						<tr>
							<th>Alias</th>
							<th>Command</th>
							<th>Handler</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{Object.keys(this.state.data.aliases).map((alias) => {
							var commandId = this.state.data.aliases[alias];

							return (
								<tr>
									<td>{alias}</td>
									<td>{commandId}</td>
									<td>{this.state.data.commands[commandId].handler}</td>
									<td>
										<Button onClick={() => this.handleCommandDrawerOpen(commandId)}>Edit</Button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</HTMLTable>

				<Drawer
					className={Classes.DARK}
					icon="edit"
					isOpen={this.state.commandDrawerOpen}
					onClose={this.handleCommandDrawerClose}
					title={`Editing command ${this.state.commandDrawerId}`}
				>
					<div className={Classes.DRAWER_BODY}>
						<div className={Classes.DIALOG_BODY}>

						</div>
						<div className={Classes.DIALOG_FOOTER}>
						
						</div>
					</div>
				</Drawer>


				<Dialog
					className={Classes.DARK}
					icon="plus"
					isOpen={this.state.newCommandDialogOpen}
					onClose={this.handleNewCommandDialogClose}
					title="New command"
				>
					<div className={Classes.DIALOG_BODY}>
						<FormGroup
							helperText="That's the phrase people will write in chat."
							label="Alias"
							labelFor="alias"
						>
							<InputGroup id="alias" name="alias" placeholder="!command" onChange={this.handleNewCommandDialogChange} value={this.state.newCommand.alias} />
						</FormGroup>
						<FormGroup
							helperText="That's what will happen when the command is executed."
							label="Handler"
							labelFor="handler"
						>
							<InputGroup id="handler" name="handler" placeholder="base.dummy" onChange={this.handleNewCommandDialogChange} value={this.state.newCommand.handler} />
						</FormGroup>
					</div>
					<div className={Classes.DIALOG_FOOTER}>
						<div className={Classes.DIALOG_FOOTER_ACTIONS}>
							<Button intent="none" onClick={this.handleNewCommandDialogClose}>Cancel</Button>
							<Button loading={this.state.newCommandSubmitPending} intent="primary" onClick={this.handleNewCommandDialogSubmit}>Add</Button>
						</div>
					</div>
				</Dialog>

			</React.Fragment>
        )
	}
}

const CommandsPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <CommandsPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(CommandsPageAuth);