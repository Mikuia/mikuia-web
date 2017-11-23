import React from 'react';
import ReactDOM from 'react-dom';

import './styles/app.scss';

import {browserHistory, BrowserRouter, Route, Switch} from 'react-router-dom';

ReactDOM.render(
    <BrowserRouter history={browserHistory}>
        <h1>Hi</h1>
    </BrowserRouter>
, document.getElementById('app'));