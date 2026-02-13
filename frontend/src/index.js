import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Aquí se define el Router
import App from "./App";
import "./styles/theme.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Router solo aquí */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
  );
