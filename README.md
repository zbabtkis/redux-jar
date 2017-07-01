# Redux JAR
A Redux library for synchronizing and storing JSONAPI resources

## Requirements
1. redux
1. redux-effects

## Installation
1. `yarn add redux-jar`
1. Add the reducer

```js
import { reducer as api } from 'redux-jar';

const reducers = combineReducers({
 api,
});

const store = createStore(reducers);
```

## Use
Configure an actions object for your API:

```js
const apiActions = configureApiActions({
  host: 'locahost:8080',
});

store.dispatch(apiActions.createResource({
  type: 'users',
  attributes: {
    first_name: 'Tony',
    last_name: 'Montana',
    email: 'tony.montana@scarface.io`,
  },
}));

// later

import { getResources } from 'redux-jar';

const users = getResources(store.getState(), { type: 'users' });
```
