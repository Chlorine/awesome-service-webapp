import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as _ from 'lodash';

import { SimpleSpinner } from '../../Common/SimpleSpinner';
import api from '../../../back/server-api';

import './EventWidget.scss';
import { RootState } from '../../../store';

const mapStateToProps = (state: RootState) => {
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
  fragments: string[] | null;
  widgetUrlBase: string;
  copied: boolean;
  widgetModalVisible: boolean;
  widgetSrc: string;
  variant: 'button' | 'triggers' | 'embed';
};

const _v2idx = (variant: State['variant']): number => {
  switch (variant) {
    case 'button':
      return 0;
    case 'triggers':
      return 1;
    case 'embed':
      return 2;
  }

  return 0;
};

class EventWidget extends React.Component<Props, State> {
  eventId = '';

  state: State = {
    isFetching: false,
    errorMsg: '',
    fragments: null,
    widgetUrlBase: '',
    copied: false,
    widgetModalVisible: false,
    widgetSrc: 'about:blank',
    variant: 'button',
  };

  componentDidMount(): void {
    document.title = 'Виджет регистрации';

    const { event } = this.props.currentEvent;
    const id = event ? event.id : 'invalid_event_id';
    this.eventId = id;

    this.setState({ isFetching: true });

    api.events
      .exec('getEventWidgetFragment', { id })
      .then(({ fragments, widgetUrlBase }) =>
        this.setState({ fragments, widgetUrlBase }),
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
      fragments,
      copied,
      widgetModalVisible,
      widgetSrc,
      variant,
    } = this.state;

    return (
      <>
        <div className={`modal ${widgetModalVisible ? 'is-active' : ''}`}>
          <div className="modal-background" />
          <div className="modal-content">
            <div className="widget-iframe-container">
              <iframe title="widget-test" scrolling={'yes'} src={widgetSrc} />
            </div>
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
                {fragments && (
                  <>
                    <h3 className="title is-5 has-text-grey mb-3">
                      Код для вставки виджета
                    </h3>
                    {/* ---- Варианты виджета --------------------- */}

                    <div className="field is-horizontal py-3">
                      <div className="field-label">
                        <label className="label">Варианты</label>
                      </div>
                      <div className="field-body">
                        <div className="field">
                          <div className="control">
                            <label className="radio">
                              <input
                                type="radio"
                                value="button"
                                checked={variant === 'button'}
                                onChange={() =>
                                  this.setState({ variant: 'button' })
                                }
                              />{' '}
                              Показ виджета по нажатию кнопки
                            </label>
                            <br />
                            <label className="radio">
                              <input
                                type="radio"
                                value="triggers"
                                checked={variant === 'triggers'}
                                onChange={() =>
                                  this.setState({ variant: 'triggers' })
                                }
                              />{' '}
                              Свои элементы-триггеры (например, для разных
                              мероприятий)
                            </label>
                            <br />
                            <label className="radio">
                              <input
                                type="radio"
                                value="embed"
                                checked={variant === 'embed'}
                                onChange={() =>
                                  this.setState({ variant: 'embed' })
                                }
                              />{' '}
                              Встраивание виджета в страницу
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="field">
                      <textarea
                        className="textarea is-family-monospace is-size-7"
                        readOnly
                        value={fragments[_v2idx(variant)]}
                        rows={15}
                      />
                    </div>
                    <div className="level is-mobile">
                      <div className="level-left">
                        <div className="level-item">
                          <CopyToClipboard
                            text={fragments[_v2idx(variant)]}
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
