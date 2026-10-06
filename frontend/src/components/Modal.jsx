import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { useNotifications } from "./Notifications.jsx";

export default function Modal({ title, children, onClose, busy = false }) {
    const dialog = useRef(null);
    const returnFocus = useRef(document.activeElement);
    const titleId = useId();
    const { setNotificationTarget } = useNotifications();
    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        setNotificationTarget(element);
        return () => {
            setNotificationTarget(null);
            element.close();
            returnFocus.current?.focus();
        };
    }, []);
    return (
        <dialog
            ref={dialog}
            className="modal"
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                if (!busy) onClose();
            }}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    if (!busy) onClose();
                }
            }}
        >
            <div className="modal-header">
                <h2 id={titleId}>{title}</h2>
                <button
                    className="icon-button"
                    title="Cerrar"
                    aria-label="Cerrar"
                    disabled={busy}
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
            </div>
            {children}
        </dialog>
    );
}
