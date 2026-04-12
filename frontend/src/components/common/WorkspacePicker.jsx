import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    BriefcaseBusiness,
    Check,
    Plus,
    X
} from "lucide-react";
import { useUiStore } from "../../store/ui.store";
import { useWsStore } from "../../store/ws.store";
import { createWorkspace, listWorkspaces } from "../../api/workspaces.api";
import AppSelect from "../ui/AppSelect";
import FormField from "../ui/FormField";

function CreateWorkspaceModal({
    open,
    name,
    setName,
    submitting,
    onClose,
    onSubmit
}) {
    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 px-4 pt-24 pb-6 backdrop-blur-md md:pt-28"
                >
                    <div className="flex min-h-full items-start justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="panel relative w-full max-w-md rounded-[28px] p-5 shadow-2xl md:p-6"
                        >
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <div className="soft-label mb-2">Create Workspace</div>
                                    <h3 className="text-xl font-semibold text-foreground">
                                        New workspace
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        Give this workspace a clear name so it is easy to identify across links, domains, and analytics.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn-ghost-premium h-10 w-10 rounded-2xl p-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Workspace Name
                                    </label>
                                    <input
                                        className="input-premium"
                                        placeholder="e.g. Growth Team"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="panel-muted flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground">
                                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                                    <span>
                                        This workspace will become active as soon as it is created.
                                    </span>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn-secondary-premium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !name.trim()}
                                        className="btn-primary-premium disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting ? "Creating..." : "Create Workspace"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default function WorkspacePicker() {
    const pushToast = useUiStore((s) => s.pushToast);
    const { list, current, setList, setCurrent } = useWsStore();

    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            try {
                const workspaces = await listWorkspaces();
                if (!mounted) return;
                setList(Array.isArray(workspaces) ? workspaces : []);
            } catch (error) {
                console.error("Failed to load workspaces", error);
                if (!mounted) return;
                pushToast({
                    type: "error",
                    title: "Failed to load workspaces",
                    description:
                        error?.response?.data?.message ||
                        error?.message ||
                        "Something went wrong while loading workspaces."
                });
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [setList, pushToast]);

    const workspaceOptions = useMemo(() => {
        if (!Array.isArray(list)) return [];
        return list.map((workspace) => ({
            value: String(workspace.id),
            label: workspace.name
        }));
    }, [list]);

    const selectedLabel = useMemo(() => {
        if (loading) return "Loading workspaces...";
        return current?.name || "Select workspace";
    }, [current?.name, loading]);

    const handleWorkspaceChange = (value) => {
        if (value === "__empty__") return;

        const ws = list.find((item) => String(item.id) === String(value));
        if (ws) {
            setCurrent(ws);
        }
    };

    const onCreate = async (e) => {
        e.preventDefault();

        const trimmed = name.trim();
        if (!trimmed) {
            pushToast({
                type: "warning",
                title: "Workspace name required",
                description: "Enter a workspace name before continuing."
            });
            return;
        }

        setSubmitting(true);
        try {
            const ws = await createWorkspace(trimmed);
            const updated = [...list, ws];
            setList(updated);
            setCurrent(ws);
            setName("");
            setOpenCreate(false);

            pushToast({
                type: "success",
                title: "Workspace created",
                description: `${ws.name} is now active.`
            });
        } catch (error) {
            console.error("Failed to create workspace", error);
            pushToast({
                type: "error",
                title: "Failed to create workspace",
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    "We couldn’t create the workspace. Please try again."
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="min-w-[260px]">
                    <FormField
                        label="Workspace"
                        hint={
                            loading
                                ? "Loading available workspaces..."
                                : "Switch the active workspace for links, domains, and analytics data."
                        }
                    >
                        <AppSelect
                            value={current?.id ? String(current.id) : ""}
                            onValueChange={handleWorkspaceChange}
                            placeholder={loading ? "Loading workspaces..." : "Select workspace"}
                            icon={BriefcaseBusiness}
                            options={
                                workspaceOptions.length
                                    ? workspaceOptions
                                    : [{ value: "__empty__", label: "No workspaces found" }]
                            }
                            disabled={loading || !workspaceOptions.length}
                        />
                    </FormField>
                </div>

                <button
                    type="button"
                    onClick={() => setOpenCreate(true)}
                    className="btn-secondary-premium"
                >
                    <Plus size={16} />
                    New workspace
                </button>

                <div className="hidden text-xs text-muted-foreground xl:block xl:pb-3">
                    Active: <span className="font-medium text-foreground">{selectedLabel}</span>
                </div>
            </div>

            <CreateWorkspaceModal
                open={openCreate}
                name={name}
                setName={setName}
                submitting={submitting}
                onClose={() => setOpenCreate(false)}
                onSubmit={onCreate}
            />
        </>
    );
}