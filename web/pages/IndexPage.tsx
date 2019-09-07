import * as React from 'react';
import {hot} from 'react-hot-loader';

import AuthContext from '../components/AuthContext';
import Container from '../components/Container';

class IndexPage extends React.Component {
    render() {
        return (
            <Container>
				<h1>Headline</h1>
				Something interesting.
			</Container>
        )
    }
}

const IndexPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <IndexPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(IndexPageAuth);