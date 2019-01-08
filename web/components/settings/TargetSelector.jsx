import axios from 'axios';
import React from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {components} from 'react-select';
import Select from 'react-select';

import Common from '../../common';

const Option = (props) => {
	return (
		<components.Option {...props}>
			<FontAwesomeIcon className="mr-2" icon={['fab', props.data.value.service]} />
			{props.data.label}
		</components.Option>
	);
}

const SingleValue = (props) => {
	return (
		<components.SingleValue {...props}>
			<FontAwesomeIcon className="mr-2" icon={['fab', props.data.value.service]} />
			{props.data.label}
		</components.SingleValue>
	);
}

class TargetSelector extends React.Component {
	constructor() {
		super();

		this.state = {
			profiles: {},
			targets: []
		}

		this.getTargets();
	}

	getSelectorValues() {
		var selections = [];
		for(var target of this.state.targets) {
			var label = target.serviceId;

			if(this.state.profiles[target.service] && this.state.profiles[target.service][target.serviceId]) {
				label = this.state.profiles[target.service][target.serviceId].displayName;
			}

			selections.push({
				value: {
					service: target.service,
					serviceId: target.serviceId
				},
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
			});
		});
	}

    render() {
        return (
			<Select styles={Common.darkReactSelect} components={{Option: Option, SingleValue: SingleValue}} options={this.getSelectorValues()} onChange={this.props.onChange} />
        )
    }
}

export default TargetSelector;