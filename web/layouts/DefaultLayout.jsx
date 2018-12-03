import React from 'react';
import {hot} from 'react-hot-loader';

import {Col, Container, Row} from 'reactstrap';

import Test from '../components/Test';

class DefaultLayout extends React.Component {
	constructor() {
		super();

		this.state = {
			error: true
		}
	}

	componentDidCatch(error, info) {
		console.log(error);
		console.log(info);
		this.setState({
			error: true
		});
	}

	render() {
		if(this.state.error) {
			return (
				<Container>
					<Row>
						<Col md={{size: 6, offset: 3}}>
							<div >
								<Row>
									<Col className="error">
										<h4 className="color-error mt-1 mb-0">Error</h4>
										Failed to connect to Mikuia backend.
									</Col>
								</Row>
							</div>
						</Col>
					</Row>
				</Container>
			)
		}

		return (
			<div>
				<Test />
			</div>
		)
	}
}

export default hot(module)(DefaultLayout);