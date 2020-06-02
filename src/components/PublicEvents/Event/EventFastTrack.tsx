import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';

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
  link: string | null;
  copied: boolean;
};

class EventFastTrack extends React.Component<Props, State> {
  state: State = {
    isFetching: true,
    errorMsg: '',
    link: null,
    copied: false,
  };

  componentDidMount(): void {
    document.title = 'Ссылка быстрой регистрации';

    const { event } = this.props.currentEvent;
    const id = event ? event.id : 'invalid_event_id';

    this.setState({ isFetching: true });

    api.events
      .exec('getEventFastTrackLink', { id })
      .then(({ link }) => this.setState({ link }))
      .catch(err => this.setState({ errorMsg: err.message }))
      .then(() => this.setState({ isFetching: false }));
  }

  render() {
    const { isFetching, errorMsg, link, copied } = this.state;

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
              {link && (
                <>
                  <h3 className="title is-5 has-text-grey">
                    Ссылка быстрой регистрации
                  </h3>
                  <p className="content">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </p>
                  <div className="level is-mobile">
                    <div className="level-left">
                      <div className="level-item">
                        <CopyToClipboard
                          text={link}
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

export default connect(mapStateToProps, mapDispatchToProps)(EventFastTrack);
