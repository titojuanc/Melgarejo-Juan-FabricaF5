import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

const NotificationsContext = createContext(null);

function Notification({ item, dismiss }) {
    useEffect(() => {
        const timer = setTimeout(() => dismiss(item.id), 7000);
        return () => clearTimeout(timer);
    }, [item.id, dismiss]);
    return (
        <div
            className={`notification ${item.type}`}
            role={item.type === "error" ? "alert" : "status"}
        >
            {item.type === "error" ? (
                <CircleAlert size={21} />
            ) : (
                <CheckCircle2 size={21} />
            )}
            <span>{item.message}</span>
            <button
                className="icon-button"
                title="Cerrar notificacion"
                aria-label="Cerrar notificacion"
                onClick={() => dismiss(item.id)}
            >
                <X size={18} />
            </button>
        </div>
    );
}

export function NotificationsProvider({ children }) {
    const [items, setItems] = useState([]);
    const [notificationTarget, setNotificationTarget] = useState(null);
    function notify(message, type = "success") {
        setItems((current) => [
            ...current,
            { id: crypto.randomUUID(), message, type },
        ]);
    }
    function dismiss(id) {
        setItems((current) => current.filter((item) => item.id !== id));
    }
    return (
        <NotificationsContext.Provider
            value={{ notify, setNotificationTarget }}
        >
            {children}
            {createPortal(
                <div className="notifications" aria-label="Notificaciones">
                    {items.map((item) => (
                        <Notification
                            key={item.id}
                            item={item}
                            dismiss={dismiss}
                        />
                    ))}
                </div>,
                notificationTarget || document.body,
            )}
        </NotificationsContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationsContext);
