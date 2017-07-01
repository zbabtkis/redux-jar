import { call, all, takeEvery, fork } from 'redux-saga/effects';

export const CREATE_RESOURCE_ERROR = 'RJA/CREATE_RESOURCE_ERROR';
export const CREATE_RESOURCE_REQUEST = 'RJA/CREATE_RESOURCE_REQUEST';
export const CREATE_RESOURCE_SUCCESS = 'RJA/CREATE_RESOURCE_SUCCESS';

export const UPDATE_RESOURCE_ERROR = 'RJA/UPDATE_RESOURCE_ERROR';
export const UPDATE_RESOURCE_REQUEST = 'RJA/UPDATE_RESOURCE_REQUEST';
export const UPDATE_RESOURCE_SUCCESS = 'RJA/UPDATE_RESOURCE_SUCCESS';

export const READ_RESOURCE_ERROR = 'RJA/READ_RESOURCE_ERROR';
export const READ_RESOURCE_REQUEST = 'RJA/READ_RESOURCE_REQUEST';
export const READ_RESOURCE_SUCCESS = 'RJA/READ_RESOURCE_SUCCESS';

export const INDEX_RESOURCE_ERROR = 'RJA/INDEX_RESOURCE_ERROR';
export const INDEX_RESOURCE_REQUEST = 'RJA/INDEX_RESOURCE_REQUEST';
export const INDEX_RESOURCE_SUCCESS = 'RJA/INDEX_RESOURCE_SUCCESS';

function apiCall(url, options) {
  return fetch(url, options)
    .then(res => res.json());
}

function* indexResource(action) {
  const url = action.payload.links.self;
  const options = { method: 'GET' };

  try {
    console.log(url, options);
    const payload = yield call(apiCall, url, options);
    console.log('d', payload);

    yield put({
      type: INDEX_RESOURCE_SUCCESS,
      payload,
    });
  } catch(payload) {
    console.log('error');
    yield put({
      type: INDEX_RESOURCE_ERROR,
      payload,
    });
  }
}

function* updateResource({ payload }) {
  const url = payload.links.self;

  const options = {
    method: 'PATCH',
    data: JSON.stringify(payload),
  };

  try {
    const payload = yield call(fetch, url, options);

    yield put({
      type: UPDATE_RESOURCE_SUCCESS,
      payload,
    });
  } catch(payload) {
    yield put({
      type: UPDATE_RESOURCE_ERROR,
      payload,
    });
  }
}

function* createResource({ payload }) {
  const url = payload.links.self;

  const options = {
    method: 'POST',
    data: JSON.stringify(payload),
  };

  try {
    const payload = yield call(fetch, url, options);

    console.log('d', payload);

    yield put({
      type: CREATE_RESOURCE_SUCCESS,
      payload,
    });
  } catch(payload) {
    console.log('e');
    yield put({
      type: CREATE_RESOURCE_ERROR,
      payload,
    });
  }
}

function* readResource(action) {
  const url = action.payload.links.self;
  const options = { method: 'GET' };

  try {
    const payload = yield call(fetch, url, options);

    yield put({
      type: READ_RESOURCE_SUCCESS,
      payload,
    });
  } catch(payload) {
    yield put({
      type: READ_RESOURCE_ERROR,
      payload,
    });
  }
}

export const saga = function *(action) {
  yield takeEvery(INDEX_RESOURCE_REQUEST, indexResource);
}

export function configureApiActions(options) {
  function withLink(resource) {
    return {
      payload: {
        data: resource,
        links: {
          self: `${options.host}/${resource.type}/${resource.id}`,
        },
      },
    };
  }

  return {
    createResource(resource) {
      return {
        type: CREATE_RESOURCE_REQUEST,
        payload: {
          data: resource,
          links: {
            self: `${options.host}/${resource.type}/${resource.id}`,
          },
        },
      };
    },

    readResource(resource) {
      return {
        type: READ_RESOURCE_REQUEST,
        payload: {
          data: resource,
          links: {
            self: `${options.host}/${resource.type}/${resource.id}`,
          },
        },
      };
    },
    updateResource(resource) {
      return {
        type: UPDATE_RESOURCE_REQUEST,
        payload: {
          data: resource,
          links: {
            self: `${options.host}/${resource.type}/${resource.id}`,
          },
        },
      };
    },
    indexResource(resource) {
      return {
        type: INDEX_RESOURCE_REQUEST,
        payload: {
          links: {
            self: `${options.host}/${resource.type}`,
          },
        },
      };
    },
  };
}

/**
 * @name setResource
 * @description Returns state with a resource keyed by ID
 * @param {Object} previousState The state to add to
 * @param {Object} resource The resource to key by id in the returned state
 * @returns {Object} The new state with resource keyed by id
 */
function getStateWithResource(previousState, resource) {
  return {
    ...previousState,
    [resource.type]: {
      ...(previousState[resource.type] || {}),
      data: {
        ...(previousState[resource.type].data || {}),
        [resource.id]: action.payload,
      },
    },
  };
}

/**
 * @name reducer
 * @description Redux reducer to compute latest API state
 * @param state
 * @param action
 * @returns {Object} New api state
 */
export function reducer(state = {}, action) {
  const collectionReturned = action.type === INDEX_RESOURCE_SUCCESS;
  const resourceReturned = [
    CREATE_RESOURCE_SUCCESS,
    UPDATE_RESOURCE_SUCCESS,
    READ_RESOURCE_SUCCESS
  ].includes(action.type);

  if (resourceReturned) {
    return action.payload.included.reduce((newState, resource) => {
      return getStateWithResource(newState, resource);
    }, getStateWithResource(state, action.payload.data))
  }

  if (collectionReturned) {
    return action.payload.included.reduce((newState, resource) => {
      return getStateWithResource(newState, resource);
    }, action.payload.data.reduce((newState, resource) => {
      return getStateWithResource(newState, resource);
    }, state));
  }

  return state;
}
