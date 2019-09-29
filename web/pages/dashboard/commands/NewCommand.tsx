import axios from 'axios';
import * as React from 'react';
import {withTranslation, WithTranslation} from 'react-i18next';

import {Button, Classes, Dialog, FormGroup, InputGroup, MenuItem} from '@blueprintjs/core';
import {ItemPredicate, ItemRenderer, Select} from '@blueprintjs/select';

import Common from '../../../common';
import ITargetSelectionEntry from '../../../components/interfaces/ITargetSelectionEntry';

interface IHandlerSelectionEntry {
	handler: string,
	plugin: string
}

const HandlerSelect = Select.ofType<IHandlerSelectionEntry>();

interface NewCommandProps extends WithTranslation {
	isOpen: boolean,
	onClose: (event?: React.SyntheticEvent<HTMLElement, Event> | undefined, shouldGetCommands?: boolean) => void,
	onOpen: (event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => void,
	selected: ITargetSelectionEntry
}

interface NewCommandState {
	alias: string,
	handlers: any,
	loading: boolean,
	selected: IHandlerSelectionEntry | null,
	submitPending: boolean
}

class NewCommand extends React.Component<NewCommandProps, NewCommandState> {
	constructor(props) {
		super(props);

		this.state = {
			alias: '',
			handlers: {},
			loading: true,
			selected: null,
			submitPending: false,
		}

		this.filterHandler = this.filterHandler.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleHandlerSelection = this.handleHandlerSelection.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.renderHandler = this.renderHandler.bind(this);
	}

	componentDidMount() {
		this.getHandlers();
	}

	filterHandler: ItemPredicate<IHandlerSelectionEntry> = (query, entry, _index, exactMatch) => {
		const {t} = this.props;

		const normalizedName = entry.handler.toLowerCase();
		const normalizedQuery = query.toLowerCase().trim();
	
		if(exactMatch) {
			return normalizedName === normalizedQuery;
		} else {
			return `${normalizedName} - ${t('handlers:' + entry.handler)}`.toLowerCase().indexOf(normalizedQuery) >= 0;
		}
	}

	async getHandlers() {
		await this.setState({
			loading: true
		});

		axios.get('/api/data/handlers').then((response) => {
			this.setState({
				handlers: response.data.handlers,
				loading: false
			});
		});
	}

	getSelectorValues() {
		var results: IHandlerSelectionEntry[] = [];
		for(var handler of Object.keys(this.state.handlers)) {
			var plugin = this.state.handlers[handler];

			results.push({
				handler: handler,
				plugin: plugin
			});
		}
		return results;
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		} as Pick<NewCommandState, keyof NewCommandState>);
	}

	handleHandlerSelection(selected: IHandlerSelectionEntry) {
		this.setState({
			selected: selected
		});
	}

	async handleSubmit() {
		if(!this.state.selected) return;
	
		await this.setState({
			submitPending: true
		});

		axios.post(`/api/target/${this.props.selected.target.service}/${this.props.selected.target.serviceId}/commands`, {
			alias: this.state.alias,
			handler: this.state.selected.handler
		}).then((response) => {
			this.props.onClose(undefined, true);
			this.setState({
				submitPending: false
			});
		});
	}
	
	renderHandler: ItemRenderer<IHandlerSelectionEntry> = (entry, {handleClick, modifiers, query}) => {
		const {t} = this.props;
		if(!modifiers.matchesPredicate) return null;
	
		return (
			<MenuItem
				active={modifiers.active}
				disabled={modifiers.disabled}
				label={entry.plugin}
				key={entry.handler}
				popoverProps={{
					fill: true
				}}
				onClick={handleClick}
				text={Common.highlightText(entry.handler + ' - ' + t('handlers:' + entry.handler), query)}
			/>
		)
	}

	render() {
		const {t} = this.props;
		return (
			<Dialog
				className={Classes.DARK}
				icon="plus"
				isOpen={this.props.isOpen}
				onClose={this.props.onClose}
				title={t('dashboard/commands:actions.newCommand')}
			>
				<div className={Classes.DIALOG_BODY}>
					<FormGroup
						helperText={t('dashboard/commands:newCommand.alias.description')}
						label={t('dashboard/commands:newCommand.alias.title')}
						labelFor="alias"
					>
						<InputGroup id="alias" name="alias" placeholder="!command" onChange={this.handleChange} value={this.state.alias} />
					</FormGroup>
					<FormGroup
						helperText={t('dashboard/commands:newCommand.handler.description')}
						label={t('dashboard/commands:newCommand.handler.title')}
						labelFor="handler"
					>
						<HandlerSelect
							activeItem={this.state.selected}
							className="CommandsPage-NewCommand-HandlerSelection"
							filterable={true}
							items={this.getSelectorValues()}
							itemPredicate={this.filterHandler}
							itemRenderer={this.renderHandler}
							noResults={<MenuItem disabled={true} text={t('dashboard/commands:newCommand.select.noHandlers')} />}
							onItemSelect={this.handleHandlerSelection}
							popoverProps={{
								portalClassName: 'CommandsPage-NewCommand-HandlerSelection-Popover',
								fill: true,
								usePortal: true
							}}
						>
							<Button
								alignText="left"
								fill
								rightIcon="caret-down"
								text={this.state.selected ? <>{this.state.selected.handler} - {t(`handlers:${this.state.selected.handler}`)}</> : t('dashboard/commands:newCommand.select.placeholder')}
							/>
						</HandlerSelect>
						{/* <InputGroup id="handler" name="handler" placeholder="base.dummy" onChange={this.handleChange} value={this.state.handler} /> */}
					</FormGroup>
				</div>
				<div className={Classes.DIALOG_FOOTER}>
					<div className={Classes.DIALOG_FOOTER_ACTIONS}>
						<Button intent="none" onClick={this.props.onClose}>{t('common:actions.cancel')}</Button>
						<Button loading={this.state.submitPending} intent="primary" onClick={this.handleSubmit}>{t('common:actions.add')}</Button>
					</div>
				</div>
			</Dialog>
		);
	}
}

export default withTranslation(['dashboard/commands', 'handlers'])(NewCommand);