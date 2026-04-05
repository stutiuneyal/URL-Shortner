import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    BriefcaseBusiness,
    CalendarClock,
    CheckCircle2,
    Plus
} from "lucide-react";
import { listWorkspaces } from "../api/workspaces.api";
import { useUiStore } from "../store/ui.store";
import { useWsStore } from "../store/ws.store";

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

export default function Workspaces() {
    const pushToast = useUiStore((s) => s.pushToast);
    const { list, setList, current, setCurrent } = useWsStore();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            try {
                const workspaces = await listWorkspaces();
                if (!mounted) return;
                setList(workspaces);
            } catch (error) {
                console.error("Failed to load workspaces", error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [setList]);

    const selectedWorkspaceId = current?.id;

    const stats = useMemo(() => {
        return {
            total: list.length,
            selected: current ? 1 : 0
        };
    }, [list.length, current]);

    return (
        <div className="space-y-6">
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel-soft overflow-hidden"
            >
                <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.4fr_0.9fr] lg:px-6">
                    <div>
                        <div className="soft-label mb-2">Workspaces</div>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                            Manage workspace context cleanly
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                            This page is now aligned with the matte product shell and gives
                            you a better foundation for roles, members, and collaboration
                            later.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="panel-muted p-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Total Workspaces
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-foreground">
                                {stats.total}
                            </div>
                        </div>

                        <div className="panel-muted p-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Selected
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-foreground">
                                {stats.selected}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            <section className="panel-soft overflow-hidden">
                <div className="border-b border-border px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="soft-label mb-2">Workspace Library</div>
                            <h3 className="text-xl font-semibold text-foreground">
                                All available workspaces
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                You can switch the active workspace here or from the header.
                            </p>
                        </div>

                        <div className="panel-muted flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                            <Plus size={14} />
                            Workspace creation is available in the header picker
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-5">
                    {loading ? (
                        <WorkspaceListLoading />
                    ) : list.length ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {list.map((workspace) => {
                                const isSelected = workspace.id === selectedWorkspaceId;

                                return (
                                    <motion.button
                                        key={workspace.id}
                                        type="button"
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.995 }}
                                        onClick={() => {
                                            setCurrent(workspace);
                                            pushToast({
                                                type: "success",
                                                title: "Workspace switched",
                                                description: `${workspace.name} is now active.`
                                            });
                                        }}
                                        className={`text-left rounded-[1.5rem] border p-5 transition ${isSelected
                                                ? "border-accent/30 bg-accent/10"
                                                : "border-border bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.045]"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-accent">
                                                <BriefcaseBusiness size={20} />
                                            </div>

                                            {isSelected ? (
                                                <div className="rounded-2xl border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                                                    Active
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="mt-5">
                                            <div className="text-lg font-semibold text-foreground">
                                                {workspace.name}
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarClock size={14} />
                                                Created: {formatDate(workspace.createdAt)}
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center gap-2 text-sm">
                                            {isSelected ? (
                                                <>
                                                    <CheckCircle2 size={16} className="text-success" />
                                                    <span className="text-success">Currently selected</span>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Click to make this your active workspace
                                                </span>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-accent">
                                <BriefcaseBusiness size={24} />
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-foreground">
                                No workspaces found
                            </h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                Create your first workspace from the header to begin organizing
                                links, analytics, and future domain settings.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function WorkspaceListLoading() {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-[1.5rem] border border-border bg-white/[0.03] p-5"
                >
                    <div className="h-12 w-12 rounded-2xl bg-white/[0.06]" />
                    <div className="mt-5 h-5 w-40 rounded-full bg-white/[0.06]" />
                    <div className="mt-3 h-4 w-32 rounded-full bg-white/[0.05]" />
                    <div className="mt-5 h-4 w-48 rounded-full bg-white/[0.05]" />
                </div>
            ))}
        </div>
    );
}