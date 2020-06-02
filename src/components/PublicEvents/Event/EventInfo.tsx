import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { AppState } from '../../../store/state';
import { formatEventDates } from '../../../utils/format-event-date';

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
};

class EventInfo extends React.Component<Props, State> {
  state: State = {
    isFetching: false,
    errorMsg: '',
  };

  componentDidMount(): void {
    const { event } = this.props.currentEvent;
    if (event) {
      document.title = event.name;
    }
  }

  render() {
    // const { isFetching, errorMsg } = this.state;
    const event = this.props.currentEvent.event!;

    return (
      <div className="container">
        <div className="columns">
          <div className="column is-12">
            <div className="box">
              <h3 className="title is-5 has-text-grey">{event.name}</h3>
              <h4 className="subtitle is-6">{event.description}</h4>
              <p>
                <strong>Место проведения: </strong>
                {event.place.name}
              </p>
              <p>
                <strong>Адрес: </strong>
                {event.place.address}
              </p>
              <br />
              <p>
                <span className="icon">
                  <i className="fa fa-calendar" />
                </span>{' '}
                {formatEventDates(event.start, event.end)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventInfo);
