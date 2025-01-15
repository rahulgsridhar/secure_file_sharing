import React from "react";
import { Provider } from "react-redux";
import App from "./App";
import store from "./store/store";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the App component
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
