import React from 'react';
import ReactDOM from 'react-dom';

import {BrowserRouter} from 'react-router-dom';

import DefaultLayout from './layouts/DefaultLayout';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.scss';

ReactDOM.render(
    <BrowserRouter>
        <DefaultLayout />
    </BrowserRouter>
, document.getElementById('app'));