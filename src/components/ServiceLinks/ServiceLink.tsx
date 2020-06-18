import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as QS from 'query-string';

import { history, RootState } from '../../store';

const mapStateToProps = (state: RootState) => {
  return {
    router: state.router,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

declare type ServiceLinkType = 'confirm-email' | 'reset-password';

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<{ linkType?: ServiceLinkType }>;

declare type State = {
  isWorking: boolean;
  errorMsg: string;
};

class ServiceLink extends React.Component<Props, State> {
  state = {
    isWorking: true,
    errorMsg: '',
  };

  static isValidType(type?: string) {
    const types: ServiceLinkType[] = ['confirm-email', 'reset-password'];
    return !!type && types.includes(type as ServiceLinkType);
  }

  componentDidMount(): void {
    document.title = 'Служебная ссылка';

    const { token } = QS.parse(this.props.location.search);
    const linkType = this.props.match.params.linkType;

    if (typeof token !== 'string' || !ServiceLink.isValidType(linkType)) {
      this.setState({
        isWorking: false,
        errorMsg: `Некорректная ссылка`,
      });
    } else {
      setTimeout(() => {
        switch (linkType) {
          case 'confirm-email':
            history.push(`/confirm-email/${token}`);
            break;
          case 'reset-password':
            history.push(`/reset-password/${token}`);
            break;
        }
      }, 500);
    }
  }

  render() {
    const { isWorking, errorMsg } = this.state;

    return (
      <section className="hero is-white is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container has-text-centered">
            {isWorking && !errorMsg && (
              <div className="large-loader-wrapper is-active">
                <div className="loader is-loading" />
              </div>
            )}
            {!isWorking && errorMsg && (
              <div className="notification is-danger is-light">{errorMsg}</div>
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceLink);
