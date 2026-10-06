import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout.jsx";
import ReservaPage from "./pages/ReservaPage.jsx";
import TurnosPage from "./pages/TurnosPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import InfoPage from "./pages/InfoPage.jsx";

export default function App() {
    const { pathname } = useLocation();
    useEffect(() => {
        document.getElementById("main-content")?.focus();
    }, [pathname]);

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<ReservaPage />} />
                <Route path="/inicio" element={<HomePage />} />
                <Route path="/turnos" element={<TurnosPage />} />
                <Route path="/gym" element={<InfoPage section="gym" />} />
                <Route
                    path="/cumpleanos"
                    element={<InfoPage section="cumpleanos" />}
                />
                <Route
                    path="/torneos"
                    element={<InfoPage section="torneos" />}
                />
                <Route
                    path="/nosotros"
                    element={<InfoPage section="nosotros" />}
                />
                <Route path="*" element={<InfoPage section="notFound" />} />
            </Routes>
        </Layout>
    );
}
