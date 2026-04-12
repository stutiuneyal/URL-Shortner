import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function CreateDomainModal({
    open,
    onClose,
    onSubmit,
    loading
}) {
    const [hostname, setHostname] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setHostname("");
            setErrors({});
        }
    }, [open]);

    const submit = async (e) => {
        e.preventDefault();

        const nextErrors = {};
        const trimmed = hostname.trim().toLowerCase();

        if (!trimmed) {
            nextErrors.hostname = "Hostname is required.";
        } else {
            const valid = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(trimmed);
            if (!valid) {
                nextErrors.hostname = "Enter a valid domain like links.example.com";
            }
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        await onSubmit({ hostname: trimmed });
    };

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="panel w-full max-w-xl p-6"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <div className="soft-label mb-2">Add domain</div>
                                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                    Connect a branded domain
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Add a subdomain you control. We will generate the DNS records
                                    needed to verify it.
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

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Hostname
                                </label>
                                <input
                                    type="text"
                                    value={hostname}
                                    onChange={(e) => setHostname(e.target.value)}
                                    placeholder="links.example.com"
                                    className="input-premium"
                                    autoFocus
                                />
                                {errors.hostname ? (
                                    <div className="mt-2 text-sm text-danger">{errors.hostname}</div>
                                ) : (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Recommended: use a subdomain like links.example.com or
                                        go.example.com
                                    </div>
                                )}
                            </div>

                            <div className="panel-muted px-4 py-4 text-sm text-muted-foreground">
                                After adding the domain, copy the generated TXT and CNAME
                                records into your DNS provider, wait for propagation, and then
                                click verify.
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn-secondary-premium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary-premium disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Adding..." : "Add domain"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}