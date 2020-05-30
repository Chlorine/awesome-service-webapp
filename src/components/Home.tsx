import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Link } from 'react-router-dom';
import { AppState } from '../store/state';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import './Home.scss';

const mapStateToProps = (state: AppState) => {
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

class Home extends React.Component<Props, State> {
  componentDidMount(): void {
    document.title = 'Добро пожаловать!';
  }

  render() {
    return (
      <>
        <section className="hero is-primary is-medium is-bold">
          <div className="hero-body">
            <div className="container has-text-centered">
              <h1 className="title">
                Многие мечтают об идеальных облачных сервисах
              </h1>
              <h2 className="subtitle">
                Пришла пора поймать удачу за хвост! Будущее уже здесь.
              </h2>
            </div>
          </div>
        </section>
        <div className="box home-cta">
          <p className="has-text-centered">
            <span className="tag is-warning">
              <strong>Внимание!</strong>
            </span>{' '}
            Регистрация пользователей <Link to={'/signup'}>открыта</Link>
          </p>
        </div>
        <div className="home-intro column is-8 is-offset-2">
          <h2 className="title">
            Сервис для организаторов публичных мероприятий
          </h2>
          <br />
          <p className="subtitle">
            Регистрируйте посетителей с помощью нашего виджета на вашем сайте,
            создавайте произвольные анкеты участников, анализируйте результаты.
          </p>
          <p>
            С помощью решений{' '}
            <a href="https://soft.ru" target="_blank" rel="noopener noreferrer">
              Тикет Софт
            </a>{' '}
            организуйте <strong>автоматическую печать бейджей</strong>{' '}
            непосредственно на мероприятии. Предоставьте посетителям ссылку
            быстрого ввода данных в виде QR-кода на плакатах. Пример ссылки для
            тестового мероприятия из БД системы:{' '}
            <a
              href="https://fast-track.cloudtickets.io/start/5ec3c5e7c68b4a441f444c3d"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://fast-track.cloudtickets.io/start/5ec3c5e7c68b4a441f444c3d
            </a>
          </p>
        </div>
        <section className="container">
          <div className="columns home-features">
            <div className="column is-4">
              <div className="card is-shady">
                <div className="card-image home-card-image has-text-centered">
                  <i className="fa fa-birthday-cake" />
                </div>
                <div className="card-content">
                  <div className="content">
                    <h4 className="title has-text-grey">
                      Проведение мероприятий
                    </h4>
                    <p>
                      Самое трудное мы взяли на себя. Волки сыты и овцы целы.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-4">
              <div className="card is-shady">
                <div className="card-image home-card-image has-text-centered">
                  <i className="fa fa-handshake-o" />
                </div>
                <div className="card-content">
                  <div className="content">
                    <h4 className="title has-text-grey">Интеграция сервисов</h4>
                    <p>
                      Эффективное взаимодействие со сторонними сервисами на
                      взаимовыгодных условиях!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-4">
              <div className="card is-shady">
                <div className="card-image home-card-image has-text-centered">
                  <i className="fa fa-diamond" />
                </div>
                <div className="card-content">
                  <div className="content">
                    <h4 className="title has-text-grey">
                      Бриллиант технологий
                    </h4>
                    <p>
                      Непревзойденное быстродействие. Милые сочетания цветов.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
