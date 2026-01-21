import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { store } from "./store/index.ts"; 
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store} >
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
    </Provider>
  </StrictMode>,
);
