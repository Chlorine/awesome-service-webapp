import React from 'react';

import { SimpleSpinner } from '../Common/SimpleSpinner';

import api from '../../back/server-api';
import { AppState } from '../../store/state';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';

const mapStateToProps = (state: AppState) => {
  return {
    currentEvent: state.currentEvent,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {
  isFetching: boolean;
  errorMsg: string;
  fragment: string | null;
  copied: boolean;
};

class EventWidget extends React.Component<Props, State> {
  state: State = {
    isFetching: false,
    errorMsg: '',
    fragment: null,
    copied: false,
  };

  componentDidMount(): void {
    document.title = 'Виджет регистрации';

    const { event } = this.props.currentEvent;
    const id = event ? event.id : 'invalid_event_id';

    this.setState({ isFetching: true });

    api.events
      .exec('getEventWidgetFragment', { id })
      .then(({ fragment }) => this.setState({ fragment }))
      .catch(err => this.setState({ errorMsg: err.message }))
      .then(() => this.setState({ isFetching: false }));
  }

  render() {
    const { isFetching, errorMsg, fragment, copied } = this.state;

    return (
      <div className="container">
        <div className="columns">
          <div className="column is-12">
            <div className="box">
              {isFetching && <SimpleSpinner text="Загрузка..." />}
              {errorMsg && (
                <div className="notification is-danger is-light">
                  Не удалось загрузить данные: {errorMsg}
                </div>
              )}
              {fragment && (
                <>
                  <h3 className="title is-5 has-text-grey">
                    Код для вставки виджета
                  </h3>
                  <div className="field">
                    <textarea
                      className="textarea is-family-monospace"
                      readOnly
                      value={fragment}
                      style={{ fontSize: '0.75rem' }}
                      rows={15}
                    />
                  </div>
                  <div className="level is-mobile">
                    <div className="level-left">
                      <div className="level-item">
                        <CopyToClipboard
                          text={fragment}
                          onCopy={(text, result) => {
                            if (result) {
                              this.setState({ copied: true });
                            }
                          }}
                        >
                          <button className="button is-light">
                            Копировать
                          </button>
                        </CopyToClipboard>
                      </div>
                      {copied && (
                        <div className="level-item">
                          <span className="has-text-grey">Скопировано</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventWidget);
