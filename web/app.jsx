import React from 'react';
import ReactDOM from 'react-dom';

import {BrowserRouter} from 'react-router-dom';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';

import DefaultLayout from './layouts/DefaultLayout';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.scss';

library.add(faSpinner);

ReactDOM.render(
    <BrowserRouter>
        <DefaultLayout />
    </BrowserRouter>
, document.getElementById('app'));