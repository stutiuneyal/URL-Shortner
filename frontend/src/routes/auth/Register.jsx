import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Sparkles,
    User2,
    WandSparkles
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useUiStore } from "../../store/ui.store";
import { register as apiRegister } from "../../api/auth.api";

export default function Register() {
    const nav = useNavigate();

    const authLogin = useAuthStore((s) => s.login);
    const pushToast = useUiStore((s) => s.pushToast);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const passwordStrength = useMemo(() => {
        const value = form.password || "";
        if (value.length >= 12) return "Strong";
        if (value.length >= 8) return "Good";
        if (value.length >= 4) return "Weak";
        return "Very weak";
    }, [form.password]);

    const handleChange = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.name.trim()) {
            nextErrors.name = "Name is required.";
        }

        if (!form.email.trim()) {
            nextErrors.email = "Email is required.";
        } else {
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
            if (!isValidEmail) {
                nextErrors.email = "Enter a valid email address.";
            }
        }

        if (!form.password) {
            nextErrors.password = "Password is required.";
        } else if (form.password.length < 8) {
            nextErrors.password = "Password must be at least 8 characters.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await apiRegister({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password
            });

            authLogin(res);

            pushToast({
                type: "success",
                title: "Account created",
                description: "Your workspace is ready."
            });

            nav("/dashboard", { replace: true });
        } catch (error) {
            console.error("Register failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute inset-0 bg-premium-grid bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.75),transparent)]" />
                <div className="absolute right-[-10rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-accent/12 blur-3xl" />
                <div className="absolute bottom-[-10rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-white/[0.05] blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:flex-row">
                <div className="hidden w-[46%] items-center justify-center px-10 py-10 lg:flex">
                    <motion.div
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.32 }}
                        className="w-full max-w-xl"
                    >
                        <div className="panel-soft p-8">
                            <div className="soft-label mb-3">Start Strong</div>
                            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                                Create a workspace that already feels like a real product
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                This isn’t just a basic form anymore. The auth experience now
                                matches the premium dashboard direction and gives your project a
                                far stronger first impression.
                            </p>

                            <div className="mt-8 grid gap-4">
                                <FeatureRow
                                    icon={WandSparkles}
                                    title="Better project identity"
                                    description="Your product now feels intentional instead of template-based."
                                />
                                <FeatureRow
                                    icon={Sparkles}
                                    title="Consistent premium shell"
                                    description="Auth, dashboard, links, workspaces, and settings now share one design language."
                                />
                                <FeatureRow
                                    icon={LockKeyhole}
                                    title="Ready for secure expansion"
                                    description="This screen can cleanly grow into reset password, email verification, and session settings."
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex w-full items-center justify-center px-5 py-10 lg:w-[54%] lg:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28 }}
                        className="panel w-full max-w-xl p-6 sm:p-8"
                    >
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                                <div className="flex items-center gap-[3px]">
                                    <span className="h-4 w-[6px] rounded-full bg-accent" />
                                    <span className="h-6 w-[6px] rounded-full bg-white/80" />
                                    <span className="h-3 w-[6px] rounded-full bg-white/40" />
                                </div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold tracking-tight text-foreground">
                                    URL Shortener
                                </div>
                                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Create Account
                                </div>
                            </div>
                        </div>

                        <div className="soft-label mb-2">Register</div>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Create your account
                        </h1>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                            Start building short links, organizing workspaces, and preparing
                            for domains and richer analytics from one polished dashboard.
                        </p>

                        <form onSubmit={onSubmit} className="mt-8 space-y-5">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                    <User2 size={15} />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Your name"
                                    className="input-premium"
                                    autoComplete="name"
                                />
                                {errors.name ? (
                                    <div className="mt-2 text-sm text-danger">{errors.name}</div>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Mail size={15} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-premium"
                                    autoComplete="email"
                                />
                                {errors.email ? (
                                    <div className="mt-2 text-sm text-danger">{errors.email}</div>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                    <LockKeyhole size={15} />
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        placeholder="At least 8 characters"
                                        className="input-premium pr-12"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>

                                {errors.password ? (
                                    <div className="mt-2 text-sm text-danger">{errors.password}</div>
                                ) : (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Password strength:{" "}
                                        <span className="font-medium text-foreground">
                                            {passwordStrength}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="panel-muted px-4 py-3 text-sm text-muted-foreground">
                                You can add email verification, password reset, and profile settings
                                later without redesigning this flow again.
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary-premium w-full disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Creating account..." : "Create Account"}
                                {!submitting ? <ArrowRight size={16} /> : null}
                            </button>

                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-foreground transition hover:text-accent"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </motion.div>
                </div>
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
                    <div className="mt-1 text-sm leading-6 text-muted-foreground">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    );
}