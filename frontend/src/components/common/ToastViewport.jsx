import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import { useUiStore } from "../../store/ui.store";

function getToastIcon(type) {
    switch (type) {
        case "success":
            return <CheckCircle2 size={18} className="text-success" />;
        case "error":
            return <AlertCircle size={18} className="text-danger" />;
        case "warning":
            return <AlertTriangle size={18} className="text-warning" />;
        default:
            return <Info size={18} className="text-accent" />;
    }
}

export default function ToastViewport() {
    const toasts = useUiStore((s) => s.toasts);
    const removeToast = useUiStore((s) => s.removeToast);

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="pointer-events-auto panel-soft overflow-hidden"
                    >
                        <div className="flex items-start gap-3 px-4 py-4">
                            <div className="mt-0.5">{getToastIcon(toast.type)}</div>

                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-foreground">
                                    {toast.title}
                                </div>
                                {toast.description ? (
                                    <div className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {toast.description}
                                    </div>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                className="btn-ghost-premium h-8 w-8 rounded-xl p-0"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}