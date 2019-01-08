import React from 'react';
import ReactDOM from 'react-dom';

import {BrowserRouter} from 'react-router-dom';

import {library, dom} from '@fortawesome/fontawesome-svg-core';
import {faDiscord} from '@fortawesome/free-brands-svg-icons/faDiscord';
import {faTwitch} from '@fortawesome/free-brands-svg-icons/faTwitch';
import {faCheckCircle} from '@fortawesome/free-regular-svg-icons/faCheckCircle';
import {faTimesCircle} from '@fortawesome/free-regular-svg-icons/faTimesCircle';
import {faSpinner} from '@fortawesome/free-solid-svg-icons/faSpinner';


import DefaultLayout from './layouts/DefaultLayout';

// import 'bootstrap/dist/css/bootstrap.min.css';

import 'noty/src/noty.scss';
import './styles/external/noty-mikuia.scss';

import './styles/app.scss';

library.add(faDiscord, faTwitch, faSpinner, faCheckCircle, faTimesCircle);

ReactDOM.render(
    <BrowserRouter>
        <DefaultLayout />
    </BrowserRouter>
, document.getElementById('app'));

dom.watch();