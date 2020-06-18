import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
  return {
    router: state.router,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

declare type State = {};

class Page4 extends React.Component<Props, State> {
  componentDidMount(): void {
    document.title = 'Страница 4';
  }

  render() {
    return (
      <div className="section">
        <h1 className="title">Страница 4</h1>
        <h2 className="subtitle">
          Четвертая страница. Но не последняя по важности.
        </h2>
        <div>
          <strong className="has-text-grey-light">
            {this.props.router.location.pathname}
          </strong>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Page4);
