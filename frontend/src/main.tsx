import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

import "leaflet/dist/leaflet.css";
import Router from "./pages/router";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext";
import { AuthSyncProvider } from "./components/AuthSyncProvider";

const body = document.body;
const theme = localStorage.getItem("theme") || "system";
body.classList.add(theme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <Toaster />
      <AuthSyncProvider>
        <Router />
      </AuthSyncProvider>{" "}
    </SocketProvider>
  </StrictMode>
);
