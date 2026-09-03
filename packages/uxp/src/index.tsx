import React from "react";
import ReactDOM from "react-dom/client";
import { polyFillGlobalErrorHandler } from "./api/errors";
import { initTheme } from "./api/theme";
import { App } from "./main";
import "./index.scss";
import "./main.scss";

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

polyFillGlobalErrorHandler();
initTheme();
