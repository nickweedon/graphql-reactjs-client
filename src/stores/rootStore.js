import { createStore } from 'redux';
import rootReducer from '../reducers/rootReducer';

// noinspection JSCheckFunctionSignatures
export default createStore(rootReducer);

