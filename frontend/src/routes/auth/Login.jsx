import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Link2,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useUiStore } from "../../store/ui.store";
import { login as apiLogin } from "../../api/auth.api";

export default function Login() {
    const nav = useNavigate();
    const location = useLocation();

    const authLogin = useAuthStore((s) => s.login);
    const pushToast = useUiStore((s) => s.pushToast);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const redirectTo = useMemo(() => {
        return location?.state?.from?.pathname || "/dashboard";
    }, [location?.state?.from?.pathname]);

    const handleChange = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const validate = () => {
        const nextErrors = {};

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
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await apiLogin({
                email: form.email.trim(),
                password: form.password
            });

            authLogin(res);

            pushToast({
                type: "success",
                title: "Welcome back",
                description: "You have signed in successfully."
            });

            nav(redirectTo, { replace: true });
        } catch (error) {
            console.error("Login failed", error);
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

            <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:flex-row">
                <div className="flex w-full items-center justify-center px-5 py-10 lg:w-[52%] lg:px-10">
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
                                    Premium Access
                                </div>
                            </div>
                        </div>

                        <div className="soft-label mb-2">Sign In</div>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Welcome back
                        </h1>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                            Sign in to manage branded links, track performance, and keep your
                            workspace organized in one premium control room.
                        </p>

                        <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
                                        placeholder="Enter your password"
                                        className="input-premium pr-12"
                                        autoComplete="current-password"
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
                                ) : null}
                            </div>

                            <div className="panel-muted flex items-start gap-3 px-4 py-3 text-sm text-muted-foreground">
                                <ShieldCheck size={16} className="mt-0.5 text-success" />
                                Sessions are handled through your stored access token and protected routes.
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary-premium w-full disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Signing in..." : "Sign In"}
                                {!submitting ? <ArrowRight size={16} /> : null}
                            </button>

                            <p className="text-sm text-muted-foreground">
                                No account yet?{" "}
                                <Link
                                    to="/register"
                                    className="font-medium text-foreground transition hover:text-accent"
                                >
                                    Create one
                                </Link>
                            </p>
                        </form>
                    </motion.div>
                </div>

                <div className="hidden w-[48%] items-center justify-center px-10 py-10 lg:flex">
                    <motion.div
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.32 }}
                        className="w-full max-w-xl"
                    >
                        <div className="panel-soft p-8">
                            <div className="soft-label mb-3">Why this feels different</div>
                            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                                A sharper workspace for modern link management
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                This experience is now built around a matte-black, premium shell
                                instead of a stock admin template. It gives your project a much
                                stronger product identity.
                            </p>

                            <div className="mt-8 grid gap-4">
                                <FeatureRow
                                    icon={Link2}
                                    title="Cleaner link workflows"
                                    description="Create, edit, filter, and track links in a much more polished flow."
                                />
                                <FeatureRow
                                    icon={Sparkles}
                                    title="Premium visual language"
                                    description="Dark surfaces, better spacing, softer borders, and smoother motion."
                                />
                                <FeatureRow
                                    icon={ShieldCheck}
                                    title="Ready for stronger features"
                                    description="This shell sets you up for domains, analytics, QR sharing, and access control."
                                />
                            </div>
                        </div>
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