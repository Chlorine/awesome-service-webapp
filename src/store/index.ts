///<reference types="webpack-env" />

import { compose, createStore, applyMiddleware } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';

import { createRootReducer } from './reducers';
import { AppState } from './state';

export const history = createBrowserHistory();

const rootReducer = createRootReducer(history);

export type RootState = ReturnType<typeof rootReducer>;

export const configureStore = () => {
  const preloadedState: Partial<AppState> = {};

  const store = createStore(
    rootReducer,
    preloadedState,
    compose(applyMiddleware(thunk, routerMiddleware(history))),
  );

  // Hot reloading
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createRootReducer(history));
    });
  }

  return store;
};
