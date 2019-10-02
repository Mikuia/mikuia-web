import * as React from 'react';
import {hot} from 'react-hot-loader';
import {withTranslation, WithTranslation} from 'react-i18next';

import AuthContext from '../../components/AuthContext';
import { H1 } from '@blueprintjs/core';

interface PluginsPageProps extends WithTranslation {}
interface PluginsPageState {}

class PluginsPage extends React.Component<PluginsPageProps, PluginsPageState> {
	render() {
		const {t} = this.props;
        return (
			<H1>hi</H1>
        )
	}
}

const PluginsPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <PluginsPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(withTranslation('dashboard/plugins')(PluginsPageAuth));