import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useWsStore } from "../store/ws.store";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./auth/login";
import Register from "./auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "./Dashboard";
import Links from "./Links";
import Domains from "./Domains";
import Workspaces from "./Workspaces";
import Settings from "./Settings";

export default function RoutesConfig() {

    const initAuth = useAuthStore((s) => s.init)
    const intiWs = useWsStore((s) => s.init)

    useEffect(() => {
        initAuth();
        intiWs();
    }, [initAuth, intiWs])

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Parent-Child/Nested Routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/links" element={<Links />} />
                <Route path="/domains" element={<Domains />} />
                <Route path="/workspaces" element={<Workspaces />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
            {/* Default Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )

}