import axios from 'axios';
import React from 'react';
import {hot} from 'react-hot-loader';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button, Col, Container, Row} from 'reactstrap';

import AuthContext from '../components/AuthContext';
import TargetSelector from '../components/settings/TargetSelector';

class SettingsPage extends React.Component {
	constructor() {
		super();

		this.state = {
			selected: {
				service: false,
				serviceId: false
			},
			status: false
		}
		
		this.handleTargetSelection = this.handleTargetSelection.bind(this);
		this.toggleStatus = this.toggleStatus.bind(this);
	}

	toggleStatus() {
		var enabled = this.state.status.enabled;
		this.setState({
			status: false
		}, () => {
			axios.post('/api/target/' + this.state.selected.service + '/' + this.state.selected.serviceId + '/toggle', {
				enable: !enabled
			}).then(() => {
				this.updateStatus();
			});
		});
	}

	handleTargetSelection(selection) {
		this.setState({
			selected: selection.value
		}, () => {
			this.updateStatus();
		});
	}

	updateStatus() {
		axios.get('/api/target/' + this.state.selected.service + '/' + this.state.selected.serviceId + '/status').then((response) => {
			this.setState({
				status: response.data.status
			});
		});
	}

	render() {
        return (
            <Container>
				<Row>
					<Col md="3">
						<small>Target</small>
						<br />
						<TargetSelector onChange={this.handleTargetSelection} />
					</Col>
					<Col md="9">
						<small>Status</small>
						<br />
						<Choose>
							<When condition={!this.state.selected.service}>
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
					</Col>
				</Row>
			</Container>
        )
	}
}

const SettingsPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <SettingsPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(SettingsPageAuth);