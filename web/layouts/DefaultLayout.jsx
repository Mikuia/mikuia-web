import React from 'react';
import {hot} from 'react-hot-loader';

import Test from '../components/Test';

class DefaultLayout extends React.Component {
    render() {
        return (
            <div>
                <Test />
            </div>
        )
    }
}

export default hot(module)(DefaultLayout);