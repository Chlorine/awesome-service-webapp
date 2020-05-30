import React from 'react';
import ReactDOM from 'react-dom';

import dateLocaleRU from 'date-fns/locale/ru';
import { setLocale as Yup_setLocale } from 'yup';

import {
  registerLocale as DateTimePicker_registerLocale,
  setDefaultLocale as DateTimePicker_setDefaultLocale,
} from 'react-datepicker';

import 'font-awesome/css/font-awesome.css';
import 'react-datepicker/dist/react-datepicker.css';

import './index.scss';

import App from './App';
import * as serviceWorker from './serviceWorker';

DateTimePicker_registerLocale('ru', dateLocaleRU);
DateTimePicker_setDefaultLocale('ru');

Yup_setLocale({
  mixed: {
    required: 'Обязательное поле',
    // eslint-disable-next-line no-template-curly-in-string
    notType: 'Значение должно иметь тип ${type}',
  },
  string: {
    // eslint-disable-next-line no-template-curly-in-string
    max: 'Макс. количество символов: ${max}',
    // eslint-disable-next-line no-template-curly-in-string
    min: 'Мин. количество символов: ${min}',
    email: 'Некорректный email-адрес',
  },
  number: {
    // eslint-disable-next-line no-template-curly-in-string
    min: 'Значение должно быть больше или равно ${min}',
    // eslint-disable-next-line no-template-curly-in-string
    max: 'Значение должно быть меньше или равно ${max}',
    integer: 'Значение должно быть целым числом (integer)',
  },
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
