import * as React from 'react';
import {hot} from 'react-hot-loader';

import AuthContext from '../../components/AuthContext';

class PluginsPage extends React.Component {
	render() {
        return (
            <React.Fragment>
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