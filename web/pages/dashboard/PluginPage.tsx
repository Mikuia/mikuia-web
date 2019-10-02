import * as React from 'react';
import {hot} from 'react-hot-loader';
import {withTranslation, WithTranslation} from 'react-i18next';

import {Callout} from '@blueprintjs/core';

import AuthContext from '../../components/AuthContext';

interface PluginPageProps extends WithTranslation {}
interface PluginPageState {}

class PluginPage extends React.Component<PluginPageProps, PluginPageState> {
	render() {
		const {t} = this.props;
        return (
            <Callout
				title={t('dashboard/plugins:noSettingsCallout.title')}
			>
				{t('dashboard/plugins:noSettingsCallout.description')}
			</Callout>
        )
	}
}

const PluginPageAuth = props => (
	<AuthContext.Consumer>
		{auth => <PluginPage {...props} auth={auth} />}
	</AuthContext.Consumer>
)

export default hot(module)(withTranslation('dashboard/plugins')(PluginPageAuth));