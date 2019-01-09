import React from 'react';
import {hot} from 'react-hot-loader';

import AuthContext from '../../components/AuthContext';

class PluginsPage extends React.Component {
	constructor() {
		super();

		this.state = {
		}
		
	}

	render() {
        return (
            <React.Fragment>
				<small>Plugins</small>
				<br />
				<h1>hi</h1>
			</React.Fragment>
        )
	}
}

const PluginsPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <PluginsPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(PluginsPageAuth);