import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as _ from 'lodash';

import { SimpleSpinner } from '../../Common/SimpleSpinner';
import api from '../../../back/server-api';
import { AppState } from '../../../store/state';

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
  widgetUrlBase: string;
  copied: boolean;
  widgetModalVisible: boolean;
  widgetSrc: string;
};

class EventWidget extends React.Component<Props, State> {
  eventId = '';

  state: State = {
    isFetching: false,
    errorMsg: '',
    fragment: null,
    widgetUrlBase: '',
    copied: false,
    widgetModalVisible: false,
    widgetSrc: 'about:blank',
  };

  componentDidMount(): void {
    document.title = 'Виджет регистрации';

    const { event } = this.props.currentEvent;
    const id = event ? event.id : 'invalid_event_id';
    this.eventId = id;

    this.setState({ isFetching: true });

    api.events
      .exec('getEventWidgetFragment', { id })
      .then(({ fragment, widgetUrlBase }) =>
        this.setState({ fragment, widgetUrlBase }),
      )
      .catch(err => this.setState({ errorMsg: err.message }))
      .then(() => this.setState({ isFetching: false }));

    window.addEventListener('message', this.onWindowMessage, false);
  }

  componentWillUnmount(): void {
    window.removeEventListener('message', this.onWindowMessage);
  }

  showWidget = () => {
    this.setState({
      widgetModalVisible: true,
      widgetSrc: `${this.state.widgetUrlBase}/welcome?eventId=${this.eventId}&iframeElemId=dummyId`,
    });
  };

  onWindowMessage = (ev: MessageEvent) => {
    const msg = ev.data;

    if (msg && _.isObjectLike(msg)) {
      if (msg.msgType === 'AwesomeWidgetMessage') {
        if (msg.action === 'close') {
          this.setState({ widgetModalVisible: false });
        }
      }
    }
  };

  render() {
    const {
      isFetching,
      errorMsg,
      fragment,
      copied,
      widgetModalVisible,
      widgetSrc,
    } = this.state;

    return (
      <>
        <div className={`modal ${widgetModalVisible ? 'is-active' : ''}`}>
          <div className="modal-background" />
          <div className="modal-content">
            <figure className="image is-9by16">
              <iframe
                title="widget-test"
                className="has-ratio"
                scrolling={'no'}
                src={widgetSrc}
              />
            </figure>
          </div>
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={() => this.setState({ widgetModalVisible: false })}
          />
        </div>
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
                        className="textarea is-family-monospace is-size-7"
                        readOnly
                        value={fragment}
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
                      <div className="level-right">
                        <button
                          className="button is-primary is-light"
                          onClick={this.showWidget}
                        >
                          Тест
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventWidget);
