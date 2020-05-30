import React from 'react';

import { SimpleSpinner } from '../Common/SimpleSpinner';

declare type Props = {};

declare type State = {
  isFetching: boolean;
  errorMsg: string;
};

export default class Surveys extends React.Component<Props, State> {
  state: State = {
    isFetching: false,
    errorMsg: '',
  };

  componentDidMount(): void {
    document.title = 'Мои анкеты';
  }

  render() {
    const { isFetching, errorMsg } = this.state;

    return (
      <div className="container">
        {isFetching && (
          <div className="columns">
            <div className="column is-12">
              <SimpleSpinner text="Загрузка..." />
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="columns">
            <div className="column is-12">
              <div className="notification is-danger is-light">
                Не удалось загрузить данные: {errorMsg}
              </div>
            </div>
          </div>
        )}
        {!isFetching && !errorMsg && (
          <div className="columns">
            <div className="column is-12">
              <div className="box">
                <h3 className="title is-5 has-text-grey-light">Мои анкеты</h3>
                <h4 className="subtitle is-6 has-text-grey-lighter">
                  Coming soon{' '}
                  <span className="icon">
                    <i className="fa fa-smile-o" />
                  </span>{' '}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
