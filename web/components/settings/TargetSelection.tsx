import axios from 'axios';
import * as React from 'react';

import {Button, MenuItem} from '@blueprintjs/core';
import {Select, ItemRenderer} from '@blueprintjs/select';

import ITarget from '../interfaces/ITarget';
import ITargetSelectionEntry from '../interfaces/ITargetSelectionEntry';

import Common from '../../common';

const TargetSelect = Select.ofType<ITargetSelectionEntry>();

const TargetItemRenderer: ItemRenderer<ITargetSelectionEntry> = (entry, {handleClick, modifiers, query}) => {
	if(!modifiers.matchesPredicate) return null;

	return (
		<MenuItem
			active={modifiers.active}
			disabled={modifiers.disabled}
			label={Common.SERVICE_NAMES[entry.target.service]}
			key={entry.target.serviceId}
			popoverProps={{
				fill: true
			}}
			onClick={handleClick}
			text={entry.displayName}
		/>
	)
}

interface ITargetSelectionProps {
	className: string,
	onItemSelect: (item: ITargetSelectionEntry, event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => void,
	selected: ITargetSelectionEntry | null
}

interface ITargetSelectionState {
	profiles: object,
	targets: ITarget[]
}

class TargetSelection extends React.Component<ITargetSelectionProps, ITargetSelectionState> {
	constructor(props) {
		super(props);

		this.state = {
			profiles: {},
			targets: []
		}

		this.getTargets();
	}

	getSelectorValues() {
		var selections: ITargetSelectionEntry[] = [];
		for(var target of this.state.targets) {
			var displayName = target.serviceId;
			var label = target.serviceId;

			if(this.state.profiles[target.service] && this.state.profiles[target.service][target.serviceId]) {
				displayName = this.state.profiles[target.service][target.serviceId].displayName;
				label = displayName + ' (' + Common.SERVICE_NAMES[target.service] + ')';
			}

			selections.push({
				target: {
					service: target.service,
					serviceId: target.serviceId
				},
				displayName: displayName,
				label: label
			});
		}

		return selections;
	}

	getTargets() {
		axios.get('/api/auth/targets').then((response) => {
			this.setState({
				targets: response.data.targets
			}, () => {
				for(var target of this.state.targets) {
					this.getTargetProfile(target.service, target.serviceId);
				}
			});
		});
	}

	getTargetProfile(service, serviceId) {
		axios.get('/api/profile/' + service + '/' + serviceId).then((response) => {
			this.setState({
				profiles: {
					...this.state.profiles,
					[service]: {
						...this.state.profiles[service],
						[serviceId]: response.data.profile
					}
				}
			}, () => {
				if(this.state.targets.length == 1) {
					this.props.onItemSelect(this.getSelectorValues()[0]);
				}
			});
		});
	}

    render() {
        return (
			<TargetSelect
				className={this.props.className}
				filterable={false}
				items={this.getSelectorValues()}
				itemRenderer={TargetItemRenderer}
				noResults={<MenuItem disabled={true} text="No results." />}
				onItemSelect={this.props.onItemSelect}
				popoverProps={{
					fill: true,
					usePortal: false
				}}
			>
				<Button alignText="left" fill text={this.props.selected ? this.props.selected.label : "Select target"} rightIcon="caret-down" />
			</TargetSelect>
        )
    }
}

export default TargetSelection;