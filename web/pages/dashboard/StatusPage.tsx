import axios from 'axios';
import * as React from 'react';
import {hot} from 'react-hot-loader';
import {withTranslation, WithTranslation} from 'react-i18next';

import {Button, Callout, Spinner} from '@blueprintjs/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import AuthContext from '../../components/AuthContext';
import ITargetSelectionEntry from '../../components/interfaces/ITargetSelectionEntry';

interface StatusPageProps extends WithTranslation {
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
		if(this.props.selected.target.service != prevProps.selected.target.service || this.props.selected.target.serviceId != prevProps.selected.target.serviceId) {
			this.getStatus();
		}
	}

	componentDidMount() {
		this.getStatus();
	}

	async getStatus() {
		await this.setState({
			loading: true
		});

		axios.get('/api/target/' + this.props.selected.target.service + '/' + this.props.selected.target.serviceId + '/status').then((response) => {
			this.setState({
				loading: false,
				status: response.data.status
			});
		});
	}

	async toggleStatus() {
		var enabled = this.state.status.enabled;

		await this.setState({
			loading: true
		});
		
		axios.post('/api/target/' + this.props.selected.target.service + '/' + this.props.selected.target.serviceId + '/toggle', {
			enable: !enabled
		}).then(() => {
			this.getStatus();
		});
	}


	render() {
		const {t} = this.props;
        return (
            <>
				{this.state.loading ? <Spinner size={Spinner.SIZE_SMALL} /> : (
					<div className="mt-2">
						<Callout icon={this.state.status.enabled ? 'tick' : 'cross'} intent={this.state.status.enabled ? 'success' : 'danger'} title={this.state.status.enabled ? t('dashboardStatus:statusCallout.enabled.title') : t('dashboardStatus:statusCallout.disabled.title')}>
							{this.state.status.enabled ? t('dashboardStatus:statusCallout.enabled.description') : t('dashboardStatus:statusCallout.disabled.description')}
						</Callout>
						<Button className="mt-2" intent={this.state.status.enabled ? 'none' : 'success'} onClick={this.toggleStatus}>{this.state.status.enabled ? t('dashboardStatus:statusCallout.actions.disable') : t('dashboardStatus:statusCallout.actions.enable')}</Button>
					</div>
				)}
			</>
        )
	}
}

const StatusPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <StatusPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(withTranslation('dashboardStatus')(StatusPageAuth));