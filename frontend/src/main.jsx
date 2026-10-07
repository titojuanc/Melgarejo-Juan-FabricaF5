import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { NotificationsProvider } from "./components/Notifications.jsx";
import { TurnosProvider } from "./components/TurnosProvider.jsx";
import { AuthProvider } from "./components/AuthProvider.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <NotificationsProvider>
                <AuthProvider>
                    <TurnosProvider>
                        <App />
                    </TurnosProvider>
                </AuthProvider>
            </NotificationsProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
