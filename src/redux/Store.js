import { combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { legacy_createStore as createStore } from "redux";
import counterReducer from "./reducers/counterReducer";


const rootReducer = combineReducers({
  counter: counterReducer,
})

const middleware = [thunk];
const store = createStore(
  rootReducer,
 
  composeWithDevTools(applyMiddleware(...middleware))
);
export default store;



