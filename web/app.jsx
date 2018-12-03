import React from 'react';
import ReactDOM from 'react-dom';

import {AppContainer} from 'react-hot-loader';
import {browserHistory, BrowserRouter, Route, Switch} from 'react-router-dom';

import DefaultLayout from './layouts/DefaultLayout';

import './styles/app.scss';

const render = Component => {
    ReactDOM.render(
        <AppContainer>
            <BrowserRouter history={browserHistory}>
                <Component />
            </BrowserRouter>
        </AppContainer>
    , document.getElementById('app'));
}

render(DefaultLayout)

if(module.hot) {
    module.hot.accept();
    // module.hot.accept('./layouts/DefaultLayout', () => { render(DefaultLayout) })
}