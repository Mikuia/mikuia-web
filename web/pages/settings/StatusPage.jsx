import axios from 'axios';
import React from 'react';
import {hot} from 'react-hot-loader';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button} from 'reactstrap';

import AuthContext from '../../components/AuthContext';

class StatusPage extends React.Component {
	constructor() {
		super();

		this.state = {
			status: false
		}
		
		this.toggleStatus = this.toggleStatus.bind(this);
	}

	componentDidUpdate(prevProps) {
		if(this.props.selected.service != prevProps.selected.service && this.props.selected.serviceId != prevProps.selected.serviceId) {
			this.updateStatus();
		}
	}

	toggleStatus() {
		var enabled = this.state.status.enabled;
		this.setState({
			status: false
		}, () => {
			axios.post('/api/target/' + this.props.selected.service + '/' + this.props.selected.serviceId + '/toggle', {
				enable: !enabled
			}).then(() => {
				this.updateStatus();
			});
		});
	}

	updateStatus() {
		axios.get('/api/target/' + this.props.selected.service + '/' + this.props.selected.serviceId + '/status').then((response) => {
			this.setState({
				status: response.data.status
			});
		});
	}

	render() {
        return (
            <React.Fragment>
				<small>Status</small>
				<br />
				<Choose>
					<When condition={!this.props.selected.service}>
						Select your platform (target (whatever)), herpa derp.
					</When>
					<Otherwise>
						<Choose>
							<When condition={!this.state.status}>
								{/* <div className="align-center"> */}
									<FontAwesomeIcon icon={['fas', 'spinner']} spin={true} />
								{/* </div> */}
							</When>
							<Otherwise>
								<With enabled={this.state.status.enabled}>
									<span className={enabled ? 'text-success' : 'text-danger'}>
										<h4 className="mb-0 mt-3">
											<FontAwesomeIcon className="mr-2" icon={['far', enabled ? 'check-circle' : 'times-circle']} />
											{enabled ? 'Enabled' : 'Disabled'}
										</h4>
										<p>
											{enabled ? 'Mikuia will join your channel, and will respond to messages.' : 'Mikuia will not join your channel, and won\'t respond to messages.'}
										</p>
									</span>

									<Button color={enabled ? 'danger' : 'success'} outline={enabled} size="sm" onClick={this.toggleStatus}>{enabled ? 'Disable' : 'Enable'}</Button>
								</With>
							</Otherwise>
						</Choose>
					</Otherwise>
				</Choose>	
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