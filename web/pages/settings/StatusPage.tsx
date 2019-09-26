import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';

import {Button, Callout, Spinner} from '@blueprintjs/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import AuthContext from '../../components/AuthContext';
import ITargetSelectionEntry from '../../components/interfaces/ITargetSelectionEntry';

interface StatusPageProps {
	selected: ITargetSelectionEntry
}
interface StatusPageState {
	loading: boolean;
	status: {
		enabled: boolean;
	};
}

class StatusPage extends React.Component<StatusPageProps, StatusPageState> {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			status: {
				enabled: false
			}
		}
		
		this.toggleStatus = this.toggleStatus.bind(this);
	}

	componentDidUpdate(prevProps) {
		if(this.props.selected.target.service != prevProps.selected.target.service && this.props.selected.target.serviceId != prevProps.selected.target.serviceId) {
			this.updateStatus();
		}
	}

	componentDidMount() {
		this.updateStatus();
	}

	toggleStatus() {
		var enabled = this.state.status.enabled;
		this.setState({
			loading: true
		}, () => {
			axios.post('/api/target/' + this.props.selected.target.service + '/' + this.props.selected.target.serviceId + '/toggle', {
				enable: !enabled
			}).then(() => {
				this.updateStatus();
			});
		});
	}

	updateStatus() {
		axios.get('/api/target/' + this.props.selected.target.service + '/' + this.props.selected.target.serviceId + '/status').then((response) => {
			this.setState({
				loading: false,
				status: response.data.status
			});
		});
	}

	render() {
        return (
            <React.Fragment>
				{this.state.loading ? <Spinner size={Spinner.SIZE_SMALL} /> : (
					<div className="mt-2">
						<Callout icon={this.state.status.enabled ? 'tick' : 'cross'} intent={this.state.status.enabled ? 'success' : 'danger'} title={"Mikuia is " + (this.state.status.enabled ? 'enabled' : 'disabled') + '.'}>
							{this.state.status.enabled ? 'Mikuia will join your channel, and will respond to messages.' : 'Mikuia will not join your channel, and won\'t respond to messages.'}
						</Callout>
						<Button className="mt-2" intent={this.state.status.enabled ? 'none' : 'success'} onClick={this.toggleStatus}>{this.state.status.enabled ? 'Disable' : 'Enable'}</Button>
					</div>
				)}
				</React.Fragment>
        )
	}
}

const StatusPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <StatusPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(StatusPageAuth);