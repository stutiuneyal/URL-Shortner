import { AnimatePresence, motion } from "framer-motion";
import {
    Archive,
    Copy,
    Download,
    ExternalLink,
    PauseCircle,
    PlayCircle,
    ShieldCheck,
    X
} from "lucide-react";
import { useUiStore } from "../../store/ui.store";
import LinkAnalyticsPanel from "./LinkAnalyticsPanel";
import LinkRecentClicksList from "./LinkRecentClicksList";
import LinkQrPanel from "./LinkQRPanel";

function formatDateTime(value) {
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

function statusClass(status) {
    if (status === "Live") return "border-success/20 bg-success/10 text-success";
    if (status === "Paused") return "border-white/10 bg-white/[0.06] text-muted-foreground";
    if (status === "Expired") return "border-danger/20 bg-danger/10 text-danger";
    if (status === "Archived") return "border-warning/20 bg-warning/10 text-warning";
    return "border-white/10 bg-white/[0.06] text-muted-foreground";
}

export default function LinkDetailsDrawer({
    open,
    onClose,
    analytics,
    shortUrl,
    onPause,
    onResume,
    onArchive,
    onUnarchive,
    onExportCsv,
    actionLoading
}) {
    const pushToast = useUiStore((s) => s.pushToast);
    const link = analytics?.link;
    const summary = analytics?.summary;

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 40, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="absolute right-0 top-0 h-full w-full max-w-[980px] border-l border-border bg-background shadow-2xl"
                >
                    <div className="premium-scrollbar h-full overflow-auto">
                        <div className="sticky top-0 z-10 border-b border-border bg-background/90 px-5 py-4 backdrop-blur-xl sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="soft-label mb-2">Link Details</div>
                                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                        /{link?.slug}
                                    </h3>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Deep-dive control center for this short link — analytics, QR, settings, lifecycle, and recent activity.
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
                        </div>

                        <div className="space-y-6 px-5 py-5 sm:px-6">
                            <section className="panel-soft p-5">
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-foreground">
                                                {shortUrl}
                                            </div>

                                            <div className={`rounded-2xl border px-3 py-1.5 text-xs font-medium ${statusClass(link?.status)}`}>
                                                {link?.status || "—"}
                                            </div>

                                            {link?.protectedLink ? (
                                                <div className="rounded-2xl border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                                                    Protected
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="mt-4 break-all text-sm text-muted-foreground">
                                            {link?.target}
                                        </div>

                                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                            <MetricCard label="Total Clicks" value={summary?.totalClicks ?? 0} />
                                            <MetricCard label="Last Clicked" value={formatDateTime(summary?.lastClickedAt)} />
                                            <MetricCard label="Expires" value={formatDateTime(summary?.expiresAt)} />
                                            <MetricCard label="Click Limit" value={summary?.clickLimit ?? "—"} />
                                        </div>

                                        {!!link?.tags?.length && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {link.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 xl:w-[280px] xl:justify-end">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                await navigator.clipboard.writeText(shortUrl);
                                                pushToast({
                                                    type: "success",
                                                    title: "Short URL copied",
                                                    description: shortUrl
                                                });
                                            }}
                                            className="btn-secondary-premium"
                                        >
                                            <Copy size={16} />
                                            Copy
                                        </button>

                                        <a
                                            href={shortUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-secondary-premium"
                                        >
                                            <ExternalLink size={16} />
                                            Open
                                        </a>

                                        <button
                                            type="button"
                                            onClick={onExportCsv}
                                            className="btn-secondary-premium"
                                        >
                                            <Download size={16} />
                                            CSV
                                        </button>

                                        {link?.status === "Live" ? (
                                            <button
                                                type="button"
                                                onClick={onPause}
                                                disabled={actionLoading}
                                                className="btn-secondary-premium disabled:opacity-60"
                                            >
                                                <PauseCircle size={16} />
                                                Pause
                                            </button>
                                        ) : null}

                                        {link?.status === "Paused" ? (
                                            <button
                                                type="button"
                                                onClick={onResume}
                                                disabled={actionLoading}
                                                className="btn-secondary-premium disabled:opacity-60"
                                            >
                                                <PlayCircle size={16} />
                                                Resume
                                            </button>
                                        ) : null}

                                        {link?.status !== "Archived" ? (
                                            <button
                                                type="button"
                                                onClick={onArchive}
                                                disabled={actionLoading}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-2.5 text-sm font-medium text-warning transition hover:bg-warning/15 disabled:opacity-60"
                                            >
                                                <Archive size={16} />
                                                Archive
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={onUnarchive}
                                                disabled={actionLoading}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-success/20 bg-success/10 px-4 py-2.5 text-sm font-medium text-success transition hover:bg-success/15 disabled:opacity-60"
                                            >
                                                <ShieldCheck size={16} />
                                                Unarchive
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <LinkAnalyticsPanel analytics={analytics} />

                            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                <LinkRecentClicksList items={analytics?.recentClicks || []} />
                                <LinkQrPanel shortUrl={shortUrl} slug={link?.slug} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function MetricCard({ label, value }) {
    return (
        <div className="panel-muted px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {label}
            </div>
            <div className="mt-2 text-sm font-semibold text-foreground">
                {value}
            </div>
        </div>
    );
}