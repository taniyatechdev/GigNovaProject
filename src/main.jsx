import { ThemeProvider } from "./context/ThemeContext";
import "./theme.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import { GigNovaProvider } from "./context/GigNovaContext";
import { store } from "./redux/store";

import "./index.css";
import "./theme-pages.css";

// Persist Redux saved gigs to localStorage

store.subscribe(() => {
  try {
    const savedGigs = store.getState().savedGigs.gigs;

    localStorage.setItem(
      "gignova_saved_gigs",
      JSON.stringify(savedGigs)
    );
  } catch (error) {
    console.error("Failed to save gigs:", error);
  }
});

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <ThemeProvider>
    <Provider store={store}>
      <HashRouter>
        <GigNovaProvider>
          <App />
        </GigNovaProvider>
      </HashRouter>
    </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
