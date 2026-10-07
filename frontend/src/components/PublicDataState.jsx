import { LoaderCircle, RefreshCw } from "lucide-react";

export default function PublicDataState({
    loading,
    error,
    retry,
    loadingLabel = "Cargando informacion...",
}) {
    if (loading) {
        return (
            <div className="public-state" role="status">
                <LoaderCircle className="spin" size={21} />
                <span>{loadingLabel}</span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="public-state public-error" role="alert">
                <p>{error}</p>
                <button className="button secondary" onClick={retry}>
                    <RefreshCw size={16} /> Reintentar
                </button>
            </div>
        );
    }
    return null;
}