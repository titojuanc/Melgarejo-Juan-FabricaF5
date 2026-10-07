import { createContext, useContext, useEffect, useState } from "react";
import * as service from "../services/auth.js";
import { useNotifications } from "./Notifications.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotifications();

    useEffect(() => {
        const controller = new AbortController();
        service
            .getCurrentUser(controller.signal)
            .then(setUser)
            .catch((error) => {
                if (error.name !== "AbortError") notify(error.message, "error");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    async function login(data) {
        const currentUser = await service.login(data);
        setUser(currentUser);
        return currentUser;
    }

    async function register(data) {
        const currentUser = await service.register(data);
        setUser(currentUser);
        return currentUser;
    }

    async function logout() {
        await service.logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);