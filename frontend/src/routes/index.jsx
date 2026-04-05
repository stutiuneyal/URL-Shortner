import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useWsStore } from "../store/ws.store";

import ProtectedRoute from "./ProtectedRoute";
import Landing from "./Landing";
import Login from "./auth/Login";
import Register from "./auth/Register";
import UnlockLink from "./UnlockLink";

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "./Dashboard";
import Links from "./Links";
import Domains from "./Domains";
import Workspaces from "./Workspaces";
import Settings from "./Settings";

export default function RoutesConfig() {
    const initAuth = useAuthStore((s) => s.init);
    const initWs = useWsStore((s) => s.init);

    useEffect(() => {
        initAuth();
        initWs();
    }, [initAuth, initWs]);

    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unlock/:slug" element={<UnlockLink />} />

            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/links" element={<Links />} />
                <Route path="/domains" element={<Domains />} />
                <Route path="/workspaces" element={<Workspaces />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}