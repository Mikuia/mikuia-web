import React from 'react';
import {hot} from 'react-hot-loader';

import {Col, Container, Row} from 'reactstrap';

import AuthContext from '../components/AuthContext';

class IndexPage extends React.Component {
    render() {
        return (
            <Container>
				<Row>
					<Col md="12">
						<h1>Headline</h1>
						Something interesting.
					</Col>
				</Row>
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