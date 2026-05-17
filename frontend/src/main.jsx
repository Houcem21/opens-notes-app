import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import SessionProvider from "./common/session/SessionProvider";

import App from "./App.jsx";

import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/utilities.css";
import "./index.css";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <App />
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>
);