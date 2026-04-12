import { motion } from "framer-motion";
import {
    BarChart3,
    Link2,
    Globe2,
    Users,
    Settings,
    Sparkles
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUiStore } from "../../store/ui.store";

const items = [
    { key: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { key: "/links", icon: Link2, label: "Links" },
    { key: "/domains", icon: Globe2, label: "Domains" },
    { key: "/workspaces", icon: Users, label: "Workspaces" },
    { key: "/settings", icon: Settings, label: "Settings" }
];

export default function SideNav() {
    const collapsed = useUiStore((s) => s.siderCollapsed);
    const nav = useNavigate();
    const loc = useLocation();

    return (
        <motion.aside
            animate={{
                width: collapsed ? 96 : 288
            }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed left-0 top-0 z-40 h-screen px-4 py-4"
        >
            <div className="panel flex h-full flex-col overflow-hidden">
                <div className="border-b border-border px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-foreground shadow-insetLine">
                            <div className="flex items-center gap-[3px]">
                                <span className="h-4 w-[6px] rounded-full bg-accent" />
                                <span className="h-6 w-[6px] rounded-full bg-white/80" />
                                <span className="h-3 w-[6px] rounded-full bg-white/40" />
                            </div>
                        </div>

                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="min-w-0"
                            >
                                <div className="text-lg font-semibold tracking-tight text-foreground">
                                    URL Shortener
                                </div>
                                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                    Workspace Console
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="premium-scrollbar flex-1 overflow-auto px-3 py-4">
                    <div className="mb-3 px-2">
                        {!collapsed && <div className="soft-label">Navigation</div>}
                    </div>

                    <nav className="space-y-2">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const active = loc.pathname === item.key;

                            return (
                                <motion.button
                                    key={item.key}
                                    type="button"
                                    whileHover={{ x: 2 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => nav(item.key)}
                                    className={`nav-item w-full ${active ? "nav-item-active" : ""
                                        } ${collapsed ? "justify-center px-0" : "justify-start"}`}
                                >
                                    <span
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition ${active
                                            ? "border-white/10 bg-white/[0.08] text-foreground"
                                            : "border-transparent bg-transparent text-muted-foreground"
                                            }`}
                                    >
                                        <Icon size={18} />
                                    </span>

                                    {!collapsed && (
                                        <div className="flex min-w-0 flex-1 items-center justify-between">
                                            <span className="truncate">{item.label}</span>
                                            {active && (
                                                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(167,139,250,0.75)]" />
                                            )}
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-border p-3">
                    <div
                        className={`panel-muted flex items-center gap-3 px-3 py-3 ${collapsed ? "justify-center" : ""
                            }`}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-accent">
                            <Sparkles size={18} />
                        </div>

                        {!collapsed && (
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">
                                    What’s available
                                </div>
                                <div className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                    Domains, analytics, QR tools, and collaboration can grow here over time.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}