import { CircleAlert, LoaderCircle, RefreshCw } from "lucide-react";

export default function LoadState({ loading, error, retry }) {
    if (loading)
        return (
            <div className="load-state" role="status">
                <LoaderCircle className="spin" />
                <span>Cargando turnos...</span>
            </div>
        );
    if (error)
        return (
            <div className="load-state error-state">
                <CircleAlert />
                <p>{error}</p>
                <button className="button secondary" onClick={retry}>
                    <RefreshCw size={16} /> Reintentar
                </button>
            </div>
        );
    return null;
}
