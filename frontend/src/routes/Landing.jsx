import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ExternalLink,
    Link2,
    LockKeyhole,
    QrCode,
    ShieldCheck,
    Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.45, ease: "easeOut" }
};

const navItems = [
    { id: "features", label: "Features" },
    { id: "workflow", label: "Workflow" },
    { id: "analytics", label: "Analytics" }
];

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

function ProductPill({ children }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_rgba(167,139,250,0.8)]" />
            {children}
        </div>
    );
}

function SectionHeader({ eyebrow, title, description, centered = false }) {
    return (
        <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
            <div className="soft-label mb-3">{eyebrow}</div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
                {title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                {description}
            </p>
        </div>
    );
}

function NavLinkButton({ href, label, active }) {
    return (
        <a
            href={href}
            className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                active
                    ? "bg-white/[0.08] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_8px_22px_rgba(0,0,0,0.16)]"
                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
            )}
        >
            {label}
        </a>
    );
}

function NavBar({ isAuthed, activeSection, scrolled }) {
    return (
        <header
            className={cn(
                "sticky top-0 z-50 transition-all duration-300",
                scrolled
                    ? "border-b border-white/10 bg-[rgba(8,10,16,0.72)] shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
                    : "border-b border-white/5 bg-[rgba(8,10,16,0.38)] backdrop-blur-xl"
            )}
        >
            <div
                className={cn(
                    "mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 sm:px-6 lg:px-8 transition-all duration-300",
                    scrolled ? "py-3" : "py-4"
                )}
            >
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-insetLine">
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
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            Link Management Platform
                        </div>
                    </div>
                </Link>

                <div className="hidden items-center gap-2 md:flex">
                    {navItems.map((item) => (
                        <NavLinkButton
                            key={item.id}
                            href={`#${item.id}`}
                            label={item.label}
                            active={activeSection === item.id}
                        />
                    ))}
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    {isAuthed ? (
                        <Link to="/dashboard" className="btn-primary-premium">
                            Go to Dashboard
                            <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn-secondary-premium">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary-premium">
                                Get Started
                                <ArrowRight size={16} />
                            </Link>
                        </>
                    )}
                </div>

                <div className="md:hidden">
                    {isAuthed ? (
                        <Link to="/dashboard" className="btn-primary-premium">
                            Dashboard
                        </Link>
                    ) : (
                        <Link to="/register" className="btn-primary-premium">
                            Get Started
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

function Hero({ isAuthed }) {
    return (
        <section className="relative overflow-hidden">
            <div className="mx-auto grid w-full max-w-[1440px] gap-14 px-5 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28 lg:pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col justify-center"
                >
                    <ProductPill>Built for campaigns, teams, and smarter sharing</ProductPill>

                    <h1 className="mt-6 max-w-5xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[4.2rem] lg:leading-[1.02]">
                        Manage short links with
                        <span className="mt-2 block bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
                            clarity, analytics, and control.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                        Create short links, organize workspaces, protect destinations, export QR codes, and understand performance through a product built for real use.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        {isAuthed ? (
                            <>
                                <Link to="/dashboard" className="btn-primary-premium">
                                    Open Dashboard
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/links" className="btn-secondary-premium">
                                    View Links
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary-premium">
                                    Create account
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/login" className="btn-secondary-premium">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Analytics"
                            value="Live"
                            helper="Track clicks, devices, browsers, and traffic sources in one place."
                        />
                        <StatCard
                            label="Security"
                            value="Built-in"
                            helper="Protect selected links with password-based access."
                        />
                        <StatCard
                            label="Operations"
                            value="Complete"
                            helper="Inspect, export, pause, resume, and archive links with ease."
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="panel overflow-hidden p-4 sm:p-5">
                        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4 shadow-soft sm:p-5">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold text-foreground sm:text-lg">
                                            Campaign analytics overview
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            Shorten, measure, protect, and manage from one place.
                                        </div>
                                    </div>

                                    <div className="inline-flex items-center rounded-2xl border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                                        Live
                                    </div>
                                </div>

                                <div className="rounded-[1.45rem] border border-border bg-white/[0.03] p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="text-base font-semibold text-foreground">
                                                /spring-launch
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                https://yourbrand.com/launch
                                            </div>
                                        </div>

                                        <div className="inline-flex items-center rounded-2xl border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                                            Protected
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <MiniPreviewCard label="Clicks" value="12.4K" />
                                        <MiniPreviewCard label="Top Source" value="Google" />
                                        <MiniPreviewCard label="Status" value="Active" />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
                                    <div className="rounded-[1.45rem] border border-border bg-white/[0.03] p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-foreground">
                                                Click trend
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Last 7 days
                                            </div>
                                        </div>

                                        <div className="mt-5 flex h-40 items-end gap-2">
                                            {[24, 36, 31, 46, 58, 51, 69].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 rounded-t-2xl bg-gradient-to-t from-accent/80 to-accent/30"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-[1.45rem] border border-border bg-white/[0.03] p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-foreground">
                                                Device mix
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Audience split
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <PreviewBreakdown label="Mobile" value="62%" />
                                            <PreviewBreakdown label="Desktop" value="31%" />
                                            <PreviewBreakdown label="Tablet" value="7%" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <InlineInfoPill text="Branded QR generation" />
                                    <InlineInfoPill text="CSV analytics export" />
                                    <InlineInfoPill text="Per-link detail view" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function FeatureCard({ icon: Icon, title, description }) {
    return (
        <motion.div {...fadeUp} className="panel-soft h-full p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-accent">
                <Icon size={20} />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </motion.div>
    );
}

function StatCard({ label, value, helper }) {
    return (
        <div className="panel-muted p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {label}
            </div>
            <div className="mt-3 text-2xl font-semibold text-foreground">{value}</div>
            <div className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</div>
        </div>
    );
}

function MiniPreviewCard({ label, value }) {
    return (
        <div className="panel-muted px-3 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
            </div>
            <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
        </div>
    );
}

function PreviewBreakdown({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-black/20 px-3 py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    );
}

function InlineInfoPill({ text }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-muted-foreground">
            {text}
        </div>
    );
}

function FeaturesSection() {
    return (
        <section
            id="features"
            className="mx-auto scroll-mt-28 w-full max-w-[1440px] px-5 py-18 sm:px-6 lg:px-8 lg:py-28"
        >
            <SectionHeader
                eyebrow="Capabilities"
                title="More than shortening. Designed for real link operations."
                description="Everything is shaped to feel complete rather than superficial — from structured creation to analytics, protection, branded assets, and lifecycle control."
                centered
            />

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <FeatureCard
                    icon={Link2}
                    title="Structured link creation"
                    description="Create clean short URLs with custom slugs, custom domains, expiry rules, click limits, and meaningful metadata."
                />
                <FeatureCard
                    icon={BarChart3}
                    title="Actionable analytics"
                    description="Track trends, referrers, devices, browsers, and recent activity so performance is easy to understand."
                />
                <FeatureCard
                    icon={LockKeyhole}
                    title="Protected access"
                    description="Gate sensitive destinations behind passwords and deliver a smoother branded access experience."
                />
                <FeatureCard
                    icon={QrCode}
                    title="Branded QR assets"
                    description="Generate QR codes ready for campaigns, presentations, print material, and premium sharing workflows."
                />
                <FeatureCard
                    icon={ShieldCheck}
                    title="Lifecycle management"
                    description="Pause, resume, inspect, and archive links so the product feels operationally mature."
                />
                <FeatureCard
                    icon={Users}
                    title="Workspace organization"
                    description="Keep links and analytics scoped cleanly by workspace for better structure and future collaboration."
                />
            </div>
        </section>
    );
}

function WorkflowSection() {
    return (
        <section
            id="workflow"
            className="mx-auto scroll-mt-28 w-full max-w-[1440px] px-5 py-18 sm:px-6 lg:px-8 lg:py-28"
        >
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <motion.div {...fadeUp}>
                    <SectionHeader
                        eyebrow="Workflow"
                        title="A smoother end-to-end product journey"
                        description="Create a link, brand it, inspect performance, export what you need, and manage its lifecycle over time through one coherent interface."
                    />

                    <div className="mt-8 rounded-[2rem] border border-border bg-white/[0.03] p-6">
                        <div className="space-y-4">
                            <ChecklistRow text="Create branded links with custom slugs" />
                            <ChecklistRow text="Open detailed insights in a polished side panel" />
                            <ChecklistRow text="Generate QR codes for sharing" />
                            <ChecklistRow text="Protect selected links with password access" />
                            <ChecklistRow text="Export analytics for reporting" />
                            <ChecklistRow text="Pause or archive inactive links cleanly" />
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-4 md:grid-cols-3">
                    <StepCard
                        step="1"
                        title="Create"
                        description="Choose the destination, set a memorable slug, assign a domain, and configure optional rules like expiry or limits."
                    />
                    <StepCard
                        step="2"
                        title="Measure"
                        description="Understand performance with trend data, referrers, browser breakdowns, and audience behavior."
                    />
                    <StepCard
                        step="3"
                        title="Control"
                        description="Use exports, protection, pause, resume, and archive actions to keep links manageable over time."
                    />
                </div>
            </div>
        </section>
    );
}

function StepCard({ step, title, description }) {
    return (
        <motion.div {...fadeUp} className="panel-soft h-full p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-semibold text-accent">
                {step}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </motion.div>
    );
}

function ChecklistRow({ text }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-black/20 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 text-success" />
            <span className="text-sm leading-6 text-muted-foreground">{text}</span>
        </div>
    );
}

function AnalyticsStorySection() {
    return (
        <section
            id="analytics"
            className="mx-auto scroll-mt-28 w-full max-w-[1440px] px-5 py-18 sm:px-6 lg:px-8 lg:py-28"
        >
            <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
                <motion.div {...fadeUp} className="lg:sticky lg:top-28">
                    <div className="panel-soft p-6 sm:p-8">
                        <div className="soft-label mb-3">Why it feels stronger</div>
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            This feels like a real product, not a basic demo.
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground">
                            The combination of workspace structure, analytics depth, protected links,
                            branded sharing, and lifecycle controls gives the product a much stronger
                            story for demos, portfolios, and real usage.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <StoryCard
                                title="For marketing teams"
                                description="Track campaign links, export reports, manage branded URLs, and share QR assets across channels."
                            />
                            <StoryCard
                                title="For internal operations"
                                description="Protect sensitive destinations, organize by workspace, and keep analytics visible and tidy."
                            />
                            <StoryCard
                                title="For creators and founders"
                                description="Use memorable branded links and understand where traffic is coming from."
                            />
                            <StoryCard
                                title="For portfolios and demos"
                                description="Show a richer SaaS workflow than a simple shorten-and-redirect project."
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <StoryPanel
                        eyebrow="Clearer storytelling"
                        title="Better product communication"
                        description="A strong landing page explains what the product does, who it serves, and why its experience feels dependable and mature."
                    />
                    <StoryPanel
                        eyebrow="Designed to grow"
                        title="A foundation for future features"
                        description="Country analytics, branded domains, experiments, collaboration, and richer reporting can all grow naturally from this structure."
                    />
                    <StoryPanel
                        eyebrow="Public and private surfaces"
                        title="A more complete SaaS shape"
                        description="Landing page, authentication, protected unlock flow, and dashboard now work together as one coherent product experience."
                    />
                </div>
            </div>
        </section>
    );
}

function StoryCard({ title, description }) {
    return (
        <div className="rounded-[1.35rem] border border-border bg-white/[0.03] p-4">
            <div className="text-base font-semibold text-foreground">{title}</div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div>
        </div>
    );
}

function StoryPanel({ eyebrow, title, description }) {
    return (
        <motion.div {...fadeUp} className="panel-soft p-5 sm:p-6">
            <div className="soft-label mb-2">{eyebrow}</div>
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        </motion.div>
    );
}

function FinalCTA({ isAuthed }) {
    return (
        <section className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="panel overflow-hidden p-0">
                <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-r from-white/[0.05] via-white/[0.03] to-accent/[0.08] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
                    <div className="absolute right-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="soft-label mb-3">Start now</div>
                            <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Build, track, protect, and manage your links beautifully.
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                                A cleaner product story, a stronger user experience, and a far more
                                polished interface for link management.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {isAuthed ? (
                                <>
                                    <Link to="/dashboard" className="btn-primary-premium">
                                        Open Dashboard
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link to="/links" className="btn-secondary-premium">
                                        Manage Links
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/register" className="btn-primary-premium">
                                        Create Account
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link to="/login" className="btn-secondary-premium">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer({ isAuthed }) {
    return (
        <footer className="border-t border-white/5">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div>
                    <div className="text-lg font-semibold tracking-tight text-foreground">
                        URL Shortener
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                        Premium short-link management with analytics, protection, workspaces, and
                        cleaner operations.
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {isAuthed ? (
                        <>
                            <Link to="/dashboard" className="btn-secondary-premium">
                                Dashboard
                            </Link>
                            <Link to="/links" className="btn-primary-premium">
                                Manage Links
                                <ExternalLink size={16} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-secondary-premium">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary-premium">
                                Create Account
                                <ArrowRight size={16} />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </footer>
    );
}

export default function Landing() {
    const token = useAuthStore((s) => s.token);
    const isAuthed = Boolean(token);
    const [activeSection, setActiveSection] = useState("features");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 24);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const sections = navItems
            .map((item) => document.getElementById(item.id))
            .filter(Boolean);

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible.length > 0) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                root: null,
                rootMargin: "-20% 0px -55% 0px",
                threshold: [0.15, 0.3, 0.5, 0.7]
            }
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground [scroll-behavior:smooth]">
            <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute inset-0 bg-premium-grid bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.88),transparent)]" />
                <div className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-accent/12 blur-3xl" />
                <div className="absolute bottom-[-12rem] right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-white/[0.05] blur-3xl" />
            </div>

            <div className="relative">
                <NavBar
                    isAuthed={isAuthed}
                    activeSection={activeSection}
                    scrolled={scrolled}
                />
                <Hero isAuthed={isAuthed} />
                <FeaturesSection />
                <WorkflowSection />
                <AnalyticsStorySection />
                <FinalCTA isAuthed={isAuthed} />
                <Footer isAuthed={isAuthed} />
            </div>
        </div>
    );
}