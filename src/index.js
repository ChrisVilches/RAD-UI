import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './scss/styles.scss';
import Layout from './layout/Layout';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cable from './services/Cable';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
import "react-toggle/style.css";
import "./vendor/font-mfizz-2.4.1/font-mfizz.css";

moment.locale('en', {
  relativeTime : {
    future: "in %s",
    past:   "%s ago",
    s:  "seconds",
    m:  "a minute",
    mm: "%d minutes",
    h:  "an hour",
    hh: "%dh",
    d:  "a day",
    dd: "%dd",
    M:  "a month",
    MM: "%d months",
    y:  "a year",
    yy: "%d years"
  }
});

Cable.connect();
ReactDOM.render(<Layout/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
