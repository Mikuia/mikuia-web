import React from 'react';
import ReactDOM from 'react-dom';

import {BrowserRouter, Route} from 'react-router-dom';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import {faDiscord, faTwitch} from '@fortawesome/free-brands-svg-icons';

import DefaultLayout from './layouts/DefaultLayout';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'noty/src/noty.scss';
import './styles/external/noty-mikuia.scss';

import './styles/app.scss';

library.add(faDiscord);
library.add(faTwitch);
library.add(faSpinner);

ReactDOM.render(
    <BrowserRouter>
        <DefaultLayout />
    </BrowserRouter>
, document.getElementById('app'));