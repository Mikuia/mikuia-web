import axios from 'axios';
import * as React from 'react';
import {withTranslation, WithTranslation} from 'react-i18next';

import {Button, MenuItem} from '@blueprintjs/core';
import {Select, ItemRenderer} from '@blueprintjs/select';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {IconName} from '@fortawesome/fontawesome-svg-core';

import ITarget from '../interfaces/ITarget';
import ITargetSelectionEntry from '../interfaces/ITargetSelectionEntry';

const TargetSelect = Select.ofType<ITargetSelectionEntry>();

const TargetItemRenderer: ItemRenderer<ITargetSelectionEntry> = (entry, {handleClick, modifiers, query}) => {
	if(!modifiers.matchesPredicate) return null;

	return (
		<MenuItem
			active={modifiers.active}
			disabled={modifiers.disabled}
			icon={<img src={entry.image} />}
			labelElement={<FontAwesomeIcon icon={['fab', entry.target.service as IconName]} />}
			key={entry.target.serviceId}
			popoverProps={{
				fill: true
			}}
			onClick={handleClick}
			text={entry.displayName}
		/>
	)
}

interface ITargetSelectionProps extends WithTranslation {
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
			var image = '';

			if(this.state.profiles[target.service] && this.state.profiles[target.service][target.serviceId]) {
				displayName = this.state.profiles[target.service][target.serviceId].name;
				image = this.state.profiles[target.service][target.serviceId].image;
			}

			selections.push({
				target: {
					service: target.service,
					serviceId: target.serviceId
				},
				displayName: displayName,
				image: image,
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
		axios.get('/api/target/' + service + '/' + serviceId).then((response) => {
			this.setState({
				profiles: {
					...this.state.profiles,
					[service]: {
						...this.state.profiles[service],
						[serviceId]: response.data.target
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
		const {t} = this.props;
		const items = this.getSelectorValues();
		var activeItem: ITargetSelectionEntry | null = null;

		if(this.props.selected) {
			activeItem = items.filter((i) => i.target.service == this.props.selected!.target.service && i.target.serviceId == this.props.selected!.target.serviceId)[0];
		}

        return (
			<TargetSelect
				activeItem={activeItem}
				className={this.props.className}
				filterable={false}
				items={items}
				itemRenderer={TargetItemRenderer}
				noResults={<MenuItem disabled={true} text={t('dashboard:sidebar.select.noResults')} />}
				onItemSelect={this.props.onItemSelect}
				popoverProps={{
					fill: true,
					usePortal: false
				}}
			>
				<Button
					alignText="left"
					fill
					icon={this.props.selected && <img src={this.props.selected.image} />}
					rightIcon="caret-down"
					text={this.props.selected ? <React.Fragment>{this.props.selected.displayName} <FontAwesomeIcon className="ml-1" icon={['fab', this.props.selected.target.service as IconName]} /></React.Fragment> : t('dashboard:sidebar.select.placeholder')}
				/>
			</TargetSelect>
        )
    }
}

export default withTranslation()(TargetSelection);