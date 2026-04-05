import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useUiStore } from "../../store/ui.store";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import ToastViewport from "../common/ToastViewport";

export default function AppLayout() {
    const collapsed = useUiStore((s) => s.siderCollapsed);

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute inset-0 bg-premium-grid bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent)]" />
                <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />
                <div className="absolute bottom-[-12rem] right-[-10rem] h-[22rem] w-[22rem] rounded-full bg-white/[0.04] blur-3xl" />
            </div>

            <ToastViewport />
            <SideNav />

            <motion.main
                animate={{
                    paddingLeft: collapsed ? 112 : 304
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="relative min-h-screen"
            >
                <TopNav />

                <div className="px-4 pb-6 pt-2 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="mx-auto w-full max-w-[1600px]"
                    >
                        <div className="panel min-h-[calc(100vh-7.75rem)] overflow-hidden">
                            <div className="grid-fade border-b border-border px-6 py-5 sm:px-8">
                                <div className="soft-label mb-2">Workspace Console</div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                                            URL Shortener
                                        </h1>
                                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                                            Manage links, domains, workspaces, and analytics from a
                                            matte-black control room built for clarity and speed.
                                        </p>
                                    </div>

                                    <div className="panel-muted inline-flex items-center gap-2 self-start px-3 py-2 text-xs text-muted-foreground sm:self-auto">
                                        <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                                        Premium shell enabled
                                    </div>
                                </div>
                            </div>

                            <div className="premium-scrollbar h-full overflow-auto px-4 py-4 sm:px-6 sm:py-6">
                                <Outlet />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.main>
        </div>
    );
}