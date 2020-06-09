import React from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { RouterState } from 'connected-react-router';

import { RootState } from '../../store';
import { AuthState } from '../../store/state';

import classNames from 'classnames';
import { CurrentBreakpoint } from '../Common/CurrentBreakpoint';

let _SHOW_CURRENT_BREAKPOINT = process.env.NODE_ENV !== 'production';
_SHOW_CURRENT_BREAKPOINT = false;

export const Navbar: React.FC = () => {
  const [burgerIsActive, setBurgerIsActive] = React.useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ddAvailable, setDDAvailable] = React.useState<boolean>(true);

  const auth = useSelector<RootState, AuthState>(state => state.auth);
  const router = useSelector<RootState, RouterState>(state => state.router);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onDDNavItemClick = () => {
    setBurgerIsActive(false);
    setDDAvailable(false);
    setTimeout(setDDAvailable, 100, true);
  };

  // const { pathname } = router.location;
  // console.log(JSON.stringify(router.location, null, 2));

  return (
    <nav
      className="navbar is-light is-fixed-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <NavLink
          exact
          className="navbar-item"
          activeClassName="is-active"
          isActive={(match, location) =>
            location.pathname.includes('/home') ||
            location.pathname.includes('/overview')
          }
          to={to('/', auth.inProgress)}
          onClick={() => setBurgerIsActive(false)}
        >
          <span className="has-text-dark is-size-5">
            <i className="fa fa-bicycle has-text-primary" />{' '}
            <span className="has-text-weight-bold">Awesome Service</span>{' '}
            {_SHOW_CURRENT_BREAKPOINT && (
              <small className="is-size-7 has-text-grey">
                <CurrentBreakpoint />
              </small>
            )}
          </span>
        </NavLink>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          href="#"
          role="button"
          className={classNames('navbar-burger burger', {
            'is-active': burgerIsActive,
          })}
          aria-label="menu"
          aria-expanded="false"
          data-target="theNavbar"
          onClick={() => setBurgerIsActive(!burgerIsActive)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div
        id="theNavbar"
        className={classNames('navbar-menu', {
          'is-active': burgerIsActive,
        })}
      >
        {/* --- Как бы меню залогиненного юзера ---- */}
        {auth.user && (
          <div className="navbar-start">
            {/* --- Стр. 1 ---- */}
            <NavLink
              className="navbar-item"
              to="/public-events"
              activeClassName="is-active"
              onClick={() => setBurgerIsActive(false)}
            >
              Мероприятия
            </NavLink>

            {/* --- Стр. 2 ---- */}
            {/*<NavLink*/}
            {/*  className="navbar-item"*/}
            {/*  to="/page2"*/}
            {/*  activeClassName="is-active"*/}
            {/*  onClick={() => setBurgerIsActive(false)}*/}
            {/*>*/}
            {/*  Стр. 2*/}
            {/*</NavLink>*/}

            {/*<div className="navbar-item has-dropdown is-hoverable is-boxed">*/}
            {/*  /!* eslint-disable-next-line jsx-a11y/anchor-is-valid *!/*/}
            {/*  <a className="navbar-link">Еще</a>*/}
            {/*  {ddAvailable && (*/}
            {/*    <div className="navbar-dropdown">*/}
            {/*      /!* --- Стр. 3 ---- *!/*/}
            {/*      <NavLink*/}
            {/*        className="navbar-item"*/}
            {/*        to="/page3"*/}
            {/*        activeClassName="is-active"*/}
            {/*        onClick={onDDNavItemClick}*/}
            {/*      >*/}
            {/*        Стр. 3*/}
            {/*      </NavLink>*/}
            {/*      /!* --- Стр. 4 ---- *!/*/}
            {/*      <NavLink*/}
            {/*        className="navbar-item"*/}
            {/*        to="/page4"*/}
            {/*        activeClassName="is-active"*/}
            {/*        onClick={onDDNavItemClick}*/}
            {/*      >*/}
            {/*        Стр. 4*/}
            {/*      </NavLink>*/}

            {/*      <hr className="navbar-divider" />*/}
            {/*      <a className="navbar-item" href="/">*/}
            {/*        После черточки*/}
            {/*      </a>*/}
            {/*    </div>*/}
            {/*  )}*/}
            {/*</div>*/}
          </div>
        )}
        <NavbarEnd
          router={router}
          auth={auth}
          setBurgerNotActive={() => setBurgerIsActive(false)}
        />
      </div>
    </nav>
  );
};

const to = (path: string, isDisabled: boolean): string => {
  return isDisabled ? '#' : path;
};

const NavbarEnd: React.FC<{
  router: RouterState;
  auth: AuthState;
  setBurgerNotActive: () => void;
}> = ({ router, auth, setBurgerNotActive }) => {
  const { pathname } = router.location;

  const [ddAvailable, setDDAvailable] = React.useState<boolean>(true);
  const onDDNavItemClick = () => {
    setBurgerNotActive();
    setDDAvailable(false);
    setTimeout(setDDAvailable, 100, true);
  };

  return (
    <div className="navbar-end">
      {/* --- Кнопки без залогиненного юзера ------- */}
      {!auth.user && (
        <div className="navbar-item">
          <div className="buttons">
            {/* --- Регистрация --- */}
            {!pathname.includes('/signup') && (
              <NavLink
                className="button is-primary"
                to={to('/signup', auth.inProgress)}
                // @ts-ignore
                disabled={auth.inProgress}
                onClick={() => setBurgerNotActive()}
              >
                <strong>Регистрация</strong>
              </NavLink>
            )}
            {/* --- Вход в систему --- */}
            {!pathname.includes('/login') && (
              <NavLink
                className="button is-white"
                to={to('/login', auth.inProgress)}
                // @ts-ignore
                disabled={auth.inProgress}
                onClick={() => setBurgerNotActive()}
              >
                Вход
              </NavLink>
            )}
          </div>
        </div>
      )}
      {/* --- Нечто при залогиненном юзере ------- */}
      {!!auth.user && (
        <div className="navbar-item has-dropdown is-hoverable">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="navbar-link" href="#">
            <span className="icon">
              <i className="fa fa-user-circle" />
            </span>
          </a>
          {ddAvailable && (
            <div className="navbar-dropdown is-right">
              <div className="navbar-item">
                <p className="is-size-7 has-text-grey-light">
                  <strong>Выполнен вход</strong>
                  <br />
                  {auth.user?.email}
                </p>
              </div>
              <hr className="navbar-divider" />
              <Link
                className="navbar-item"
                to={'/profile'}
                onClick={onDDNavItemClick}
              >
                Учетная запись
              </Link>
              <hr className="navbar-divider" />
              <NavLink
                className="navbar-item"
                to={'/logout'}
                onClick={onDDNavItemClick}
              >
                Выход
              </NavLink>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
