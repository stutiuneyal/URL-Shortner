import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    LogOut,
    Menu,
    PanelLeftClose,
    Plus,
    Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useUiStore } from "../../store/ui.store";
import WorkspacePicker from "../common/WorkspacePicker";

export default function TopNav() {
    const navigate = useNavigate();
    const collapsed = useUiStore((s) => s.siderCollapsed);
    const toggle = useUiStore((s) => s.toggleSider);
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const initials = useMemo(() => {
        const base = user?.email || "U";
        return base.slice(0, 2).toUpperCase();
    }, [user?.email]);

    useEffect(() => {
        const onPointerDown = (e) => {
            if (!menuRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };

        window.addEventListener("pointerdown", onPointerDown);
        return () => window.removeEventListener("pointerdown", onPointerDown);
    }, []);

    const handleLogout = () => {
        setOpen(false);
        logout();
    };

    return (
        <header className="sticky top-0 z-30 px-4 pb-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel-soft flex min-h-[72px] flex-1 items-center justify-between gap-3 px-3 py-3 sm:px-4"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={toggle}
                            className="btn-ghost-premium h-11 w-11 rounded-2xl p-0"
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
                        </button>

                        <div className="hidden h-10 w-px bg-border sm:block" />

                        <div className="min-w-0 flex-1">
                            <WorkspacePicker />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/links")}
                            className="btn-secondary-premium hidden sm:inline-flex"
                        >
                            <Plus size={16} />
                            New Link
                        </button>

                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setOpen((v) => !v)}
                                className="panel-muted flex items-center gap-3 rounded-2xl px-2.5 py-2 transition hover:border-white/10 hover:bg-white/[0.04]"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.08] text-sm font-semibold text-foreground">
                                    {initials}
                                </div>

                                <div className="hidden text-left sm:block">
                                    <div className="max-w-[180px] truncate text-sm font-medium text-foreground">
                                        {user?.email || "Signed in"}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Sparkles size={12} className="text-accent" />
                                        Active workspace
                                    </div>
                                </div>

                                <ChevronDown
                                    size={16}
                                    className={`hidden text-muted-foreground transition sm:block ${open ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {open && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                        transition={{ duration: 0.18 }}
                                        className="panel-soft absolute right-0 top-[calc(100%+0.75rem)] w-[260px] overflow-hidden"
                                    >
                                        <div className="border-b border-border px-4 py-4">
                                            <div className="text-sm font-medium text-foreground">
                                                {user?.email || "Signed in"}
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Manage your links and settings from one place.
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOpen(false);
                                                    navigate("/settings");
                                                }}
                                                className="nav-item w-full justify-start"
                                            >
                                                <Sparkles size={16} />
                                                Settings
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="nav-item w-full justify-start text-danger hover:text-danger"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </header>
    );
}