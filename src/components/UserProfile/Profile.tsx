import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router';
import { Route, RouteComponentProps } from 'react-router-dom';

import Personal from './Personal';
import Password from './Password';
import { SideMenu } from '../Common/SideMenu';
import { VEPageTitle } from '../Common/ViewElements';
import { RootState } from '../../store';

const mapStateToProps = (state: RootState) => {
  return {
    router: state.router,
    auth: state.auth,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

declare type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps;

declare type State = {
  errorMsg: string;
};

class Profile extends React.Component<Props, State> {
  state: State = {
    errorMsg: '',
  };

  componentDidMount(): void {
    document.title = 'Учетная запись';
  }

  render() {
    const { path: basePath } = this.props.match;
    // const basePath = //'/profile';

    return (
      <section className="hero is-white">
        <div className="hero-body">
          {/* --- Титле ---------------------------- */}
          <div className="container">
            <div className="columns">
              <div className="column is-12">
                <VEPageTitle title="Учетная запись" />
                <br />
              </div>
            </div>
          </div>
          {/* --- Остальное ------------------------*/}
          <div className="container">
            <div className="columns">
              <div className="column is-3-desktop is-4-tablet">
                {/* --- Менюха --------------------------- */}
                <SideMenu
                  basePath={basePath}
                  sections={[
                    {
                      title: 'Пользователь',
                      items: [
                        { linkTo: '/personal', title: 'Мои данные' },
                        { linkTo: '/password', title: 'Пароль' },
                      ],
                    },
                  ]}
                />
              </div>
              {/* --- Штуки справа от менюхи --------------------------- */}
              <div className="column is-9-desktop is-8-tablet">
                <Switch>
                  <Route
                    exact
                    path={basePath}
                    component={() => <Redirect to={`${basePath}/personal`} />}
                  />
                  <Route path={`${basePath}/personal`} component={Personal} />
                  <Route path={`${basePath}/password`} component={Password} />
                  <Route
                    component={() => (
                      <small className="has-text-grey">
                        Выберите интересующий вас раздел
                      </small>
                    )}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
