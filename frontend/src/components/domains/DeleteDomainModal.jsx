import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";

function DeleteDomainModalContent({
    domain,
    onClose,
    onConfirm,
    loading
}) {
    return (
        <AnimatePresence>
            {domain ? (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[160] bg-black/82"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.99 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-[161] flex items-center justify-center px-4 py-6"
                    >
                        <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#0d1016] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_90px_rgba(0,0,0,0.65)]">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <div className="soft-label mb-2">Delete domain</div>
                                    <h3 className="text-xl font-semibold text-white">
                                        Remove {domain.hostname}?
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-white/60">
                                        This will remove the domain from your workspace.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close delete dialog"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="rounded-[1.1rem] border border-danger/15 bg-danger/8 px-4 py-3 text-sm leading-6 text-white/72">
                                This action cannot be undone.
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="btn-secondary-premium disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => onConfirm(domain)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/15 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Trash2 size={16} />
                                    {loading ? "Deleting..." : "Delete domain"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            ) : null}
        </AnimatePresence>
    );
}

export default function DeleteDomainModal(props) {
    if (typeof document === "undefined") return null;
    return createPortal(<DeleteDomainModalContent {...props} />, document.body);
}