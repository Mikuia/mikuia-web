import React from 'react';
import {Redirect, Route} from 'react-router-dom';

function PrivateRoute({component: Component, auth, ...rest}) {
	return (
		<Route {...rest} render={props => auth.user ? (
			<Component {...props} />
		) : (
			<Redirect to="/" />
		)} />
	)
}

export default PrivateRoute;