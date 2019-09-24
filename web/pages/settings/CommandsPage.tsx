import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';
import {RouteComponentProps} from 'react-router';

import {Button, Dialog, Classes, FormGroup, InputGroup} from '@blueprintjs/core';

import AuthContext from '../../components/AuthContext';
import IAuthProps from '../../components/interfaces/IAuthProps';
import ITargetSelectionEntry from '../../components/interfaces/ITargetSelectionEntry';

interface CommandsPageProps extends IAuthProps, RouteComponentProps {
	selected: ITargetSelectionEntry
}
interface CommandsPageState {
	command: {
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
			command: {
				alias: '',
				handler: '',
			},
			newCommandDialogOpen: false,
			newCommandSubmitPending: false
		}

		this.handleNewCommandDialogChange = this.handleNewCommandDialogChange.bind(this);
		this.handleNewCommandDialogClose = this.handleNewCommandDialogClose.bind(this);
		this.handleNewCommandDialogOpen = this.handleNewCommandDialogOpen.bind(this);
		this.handleNewCommandDialogSubmit = this.handleNewCommandDialogSubmit.bind(this);
	}

	handleNewCommandDialogChange(e) {
		this.setState({
			command: {
				...this.state.command,
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
				alias: this.state.command.alias,
				handler: this.state.command.handler
			}).then((response) => {
				this.handleNewCommandDialogClose();
				this.setState({
					newCommandSubmitPending: false
				});
			});
		});
	}

	render() {
        return (
            <React.Fragment>
				<small>Commands</small>
				<br />
				<Button className="mt-1" intent="primary" onClick={this.handleNewCommandDialogOpen}>New command</Button>

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
							<InputGroup id="alias" name="alias" placeholder="!command" onChange={this.handleNewCommandDialogChange} value={this.state.command.alias} />
						</FormGroup>
						<FormGroup
							helperText="That's what will happen when the command is executed."
							label="Handler"
							labelFor="handler"
						>
							<InputGroup id="handler" name="handler" placeholder="base.dummy" onChange={this.handleNewCommandDialogChange} value={this.state.command.handler} />
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