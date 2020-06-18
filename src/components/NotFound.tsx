import React from 'react';
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

class NotFound extends React.Component<Props, State> {
  componentDidMount(): void {
    document.title = '404';
  }

  render() {
    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h3 className="title">
              <i className="fa fa-frown-o" /> 404
            </h3>
            <strong>{this.props.router.location.pathname}</strong>
            <br />
            <span className="has-text-danger">Страница не найдена</span>
            <br />
            <br />
            <Link className="has-text-link" to="/">
              На главную
            </Link>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotFound);
