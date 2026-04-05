import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Link2,
    LockKeyhole,
    ShieldCheck
} from "lucide-react";
import { unlockProtectedLink } from "../api/redirect.api";

export default function UnlockLink() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorText, setErrorText] = useState("");

    const shortPath = useMemo(() => `/r/${slug}`, [slug]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorText("");

        if (!password.trim()) {
            setErrorText("Password is required.");
            return;
        }

        setSubmitting(true);
        try {
            const result = await unlockProtectedLink(slug, password);
            window.location.href = result.target;
        } catch (error) {
            if (error?.status === 401) {
                setErrorText("Invalid password.");
            } else if (error?.status === 404) {
                setErrorText("This link could not be found.");
            } else if (error?.status === 410) {
                setErrorText("This link has expired.");
            } else if (error?.status === 429) {
                setErrorText("This link has reached its click limit.");
            } else {
                setErrorText(error?.message || "Unable to unlock the link.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute inset-0 bg-premium-grid bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.75),transparent)]" />
                <div className="absolute left-[-10rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-accent/12 blur-3xl" />
                <div className="absolute bottom-[-10rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-white/[0.05] blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-screen w-full max-w-[1320px] items-center justify-center px-5 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                    className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]"
                >
                    <div className="panel-soft p-8">
                        <div className="soft-label mb-3">Protected Link</div>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            This short link is locked
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground">
                            Enter the password to continue to the destination. This keeps
                            sensitive campaign or internal links private while still using the
                            short-link workflow.
                        </p>

                        <div className="mt-8 space-y-4">
                            <FeatureRow
                                icon={ShieldCheck}
                                title="Protected redirect"
                                description="Only users with the correct password can proceed."
                            />
                            <FeatureRow
                                icon={Link2}
                                title="Original short path"
                                description={shortPath}
                            />
                        </div>
                    </div>

                    <div className="panel p-8">
                        <div className="soft-label mb-2">Unlock</div>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                            Continue to destination
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Enter the password shared with you for this short link.
                        </p>

                        <form onSubmit={onSubmit} className="mt-8 space-y-5">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                    <LockKeyhole size={15} />
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter link password"
                                        className="input-premium pr-12"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>

                                {errorText ? (
                                    <div className="mt-2 text-sm text-danger">{errorText}</div>
                                ) : (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        The destination opens immediately after successful verification.
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary-premium w-full disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Unlocking..." : "Unlock Link"}
                                {!submitting ? <ArrowRight size={16} /> : null}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="btn-secondary-premium w-full"
                            >
                                Back to app
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function FeatureRow({ icon: Icon, title, description }) {
    return (
        <div className="rounded-[1.35rem] border border-border bg-white/[0.03] p-4">
            <div className="flex items-start gap-4">
                <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-accent">
                    <Icon size={18} />
                </div>
                <div>
                    <div className="text-base font-semibold text-foreground">{title}</div>
                    <div className="mt-1 break-all text-sm leading-6 text-muted-foreground">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    );
}