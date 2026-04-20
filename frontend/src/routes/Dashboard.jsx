import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    CalendarClock,
    LockKeyhole,
    Sparkles,
    TimerReset
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import SummaryCards from "../components/analytics/SummaryCards.jsx";
import { getDashboardAnalytics } from "../api/analytics.api";
import { useWsStore } from "../store/ws.store";
import { useOnboardingStore } from "../store/onboarding.store";
import { waitForElement } from "../tours/tourUtils";
import { connectRealtime, subscribeTopic, unsubscribeTopic } from "../lib/realtime";

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}

function formatTimelineLabel(label) {
    if (!label) return "";
    const date = new Date(label);
    if (Number.isNaN(date.getTime())) return label;

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short"
    }).format(date);
}

function statusPillClass(status) {
    if (status === "Live") return "border-success/20 bg-success/10 text-success";
    if (status === "Expired") return "border-danger/20 bg-danger/10 text-danger";
    if (status === "Protected") return "border-accent/20 bg-accent/10 text-accent";
    return "border-white/10 bg-white/[0.06] text-muted-foreground";
}

function getLinkStatus(row) {
    if (!row?.active) return "Paused";
    if (row?.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) return "Expired";
    return "Live";
}

function EmptyWorkspaceState() {
    return (
        <div className="panel-soft p-8">
            <div className="soft-label mb-2">Dashboard</div>
            <h2 className="text-xl font-semibold text-foreground">
                No workspace selected
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Select a workspace to view analytics, top links, recent activity, and link performance.
            </p>
        </div>
    );
}

function MiniInsight({ title, value, icon: Icon, helper }) {
    return (
        <div className="panel-muted p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {title}
                    </div>
                    <div className="mt-3 text-xl font-semibold text-foreground">
                        {value}
                    </div>
                    <div className="mt-2 text-xs leading-5 text-muted-foreground">
                        {helper}
                    </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-accent">
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
}

function DashboardEmpty({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-accent">
                <Icon size={22} />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-foreground">{title}</h4>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function DashboardListLoading() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-[1.25rem] border border-border bg-white/[0.03] p-4"
                >
                    <div className="h-4 w-32 rounded-full bg-white/[0.06]" />
                    <div className="mt-3 h-3 w-4/5 rounded-full bg-white/[0.05]" />
                    <div className="mt-3 h-3 w-2/5 rounded-full bg-white/[0.05]" />
                </div>
            ))}
        </div>
    );
}

function BreakdownList({ items = [], emptyText }) {
    if (!items.length) {
        return (
            <div className="text-sm text-muted-foreground">{emptyText}</div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-border bg-white/[0.03] px-4 py-3"
                >
                    <div className="truncate text-sm text-foreground">{item.label}</div>
                    <div className="text-sm font-semibold text-foreground">{item.value}</div>
                </div>
            ))}
        </div>
    );
}

export default function Dashboard() {
    const ws = useWsStore((s) => s.current);

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    const hasSeenDashboardTour = useOnboardingStore((s) => s.hasSeenDashboardTour);
    const startTour = useOnboardingStore((s) => s.startTour);

    const dashboardRefreshTimeoutRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            if (!ws?.id) {
                setDashboard(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await getDashboardAnalytics(ws.id);
                if (!mounted) return;
                setDashboard(data || {});
            } catch (error) {
                console.error("Failed to load dashboard analytics", error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [ws?.id]);

    useEffect(() => {
        if (!ws?.id) return undefined;

        connectRealtime();

        const topicKey = `workspace-dashboard-${ws.id}`;
        subscribeTopic(
            topicKey,
            `/topic/workspaces/${ws.id}/dashboard`,
            async (event) => {
                if (event?.type !== "DASHBOARD_REFRESH_REQUIRED") return;

                if (dashboardRefreshTimeoutRef.current) {
                    clearTimeout(dashboardRefreshTimeoutRef.current);
                }

                dashboardRefreshTimeoutRef.current = setTimeout(async () => {
                    try {
                        const data = await getDashboardAnalytics(ws.id);
                        setDashboard(data || {});
                    } catch (error) {
                        console.error("Failed to refresh dashboard from realtime event", error);
                    }
                }, 800);
            }
        );

        return () => {
            unsubscribeTopic(topicKey);
            if (dashboardRefreshTimeoutRef.current) {
                clearTimeout(dashboardRefreshTimeoutRef.current);
            }
        };
    }, [ws?.id]);

    const summary = dashboard?.summary || {};
    const statusBreakdown = dashboard?.statusBreakdown || {};
    const recentLinks = dashboard?.recentLinks || [];
    const topLinks = dashboard?.topLinks || [];
    const expiringSoon = dashboard?.expiringSoon || [];
    const clicksTimeline = dashboard?.clicksTimeline || [];
    const referrerBreakdown = dashboard?.referrerBreakdown || [];
    const deviceBreakdown = dashboard?.deviceBreakdown || [];
    const browserBreakdown = dashboard?.browserBreakdown || [];

    useEffect(() => {
        if (loading) return;
        if (hasSeenDashboardTour) return;

        const hasRealData =
            (summary?.totalLinks || 0) > 0 ||
            (topLinks?.length || 0) > 0 ||
            (recentLinks?.length || 0) > 0;

        if (!hasRealData) return;

        const run = async () => {
            const ready = await waitForElement('[data-tour="dashboard-summary"]', 4000);

            if (ready) {
                startTour("dashboard");
            }
        };

        const id = setTimeout(run, 500);
        return () => clearTimeout(id);
    }, [
        loading,
        hasSeenDashboardTour,
        summary?.totalLinks,
        topLinks?.length,
        recentLinks?.length,
        startTour
    ]);

    const avgClicksPerLink = useMemo(() => {
        const value = summary?.averageClicksPerLink || 0;
        return Number(value).toFixed(1);
    }, [summary?.averageClicksPerLink]);

    const timelineData = useMemo(() => {
        return clicksTimeline.map((item) => ({
            ...item,
            shortLabel: formatTimelineLabel(item.label)
        }));
    }, [clicksTimeline]);

    const topLinksChartData = useMemo(() => {
        return topLinks.slice(0, 6).map((item) => ({
            slug: item.slug,
            clicks: item.clicks || 0
        }));
    }, [topLinks]);

    if (!ws?.id) {
        return <EmptyWorkspaceState />;
    }

    return (
        <div className="space-y-6">
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel-soft overflow-hidden"
                data-tour="dashboard-summary"
            >
                <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.4fr_0.9fr] lg:px-6">
                    <div>
                        <div className="soft-label mb-2">Overview</div>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                            Workspace analytics overview
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                            This dashboard now uses real click-event data for time-series traffic,
                            referrers, devices, browsers, and stronger operational insights.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <MiniInsight
                            title="Average Clicks"
                            value={avgClicksPerLink}
                            helper="Average clicks per link in this workspace"
                            icon={Sparkles}
                        />
                        <MiniInsight
                            title="Protected Links"
                            value={summary.protectedLinks || 0}
                            helper="Links currently protected by password"
                            icon={LockKeyhole}
                        />
                        <MiniInsight
                            title="Live Links"
                            value={statusBreakdown.live || 0}
                            helper="Links that are active and not expired"
                            icon={Activity}
                        />
                        <MiniInsight
                            title="Expiring Soon"
                            value={summary.expiringSoon || 0}
                            helper="Links expiring within the next 7 days"
                            icon={CalendarClock}
                        />
                    </div>
                </div>
            </motion.section>

            <SummaryCards data={summary} />

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="panel-soft overflow-hidden">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="soft-label mb-2">Traffic Timeline</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Clicks over the last 7 days
                        </h3>
                    </div>

                    <div className="p-4 sm:p-5">
                        {loading ? (
                            <div className="h-[320px] animate-pulse rounded-[1.25rem] border border-border bg-white/[0.03]" />
                        ) : timelineData.length ? (
                            <div className="h-[320px] rounded-[1.25rem] border border-border bg-white/[0.03] p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timelineData}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                        <XAxis
                                            dataKey="shortLabel"
                                            stroke="rgba(255,255,255,0.55)"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.55)"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: "rgba(17,18,20,0.95)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                borderRadius: "16px",
                                                color: "#f5f5f6"
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="clicks"
                                            stroke="rgba(167,139,250,0.95)"
                                            fill="rgba(167,139,250,0.2)"
                                            strokeWidth={2.5}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <DashboardEmpty
                                icon={Activity}
                                title="No click history yet"
                                description="Once users start opening links, the time-series chart will appear here."
                            />
                        )}
                    </div>
                </section>

                <section className="panel-soft overflow-hidden">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="soft-label mb-2">Status Breakdown</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Link health snapshot
                        </h3>
                    </div>

                    <div className="grid gap-3 p-4 sm:p-5">
                        <div className="panel-muted p-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Live
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-foreground">
                                {statusBreakdown.live || 0}
                            </div>
                        </div>
                        <div className="panel-muted p-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Paused
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-foreground">
                                {statusBreakdown.paused || 0}
                            </div>
                        </div>
                        <div className="panel-muted p-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Expired
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-foreground">
                                {statusBreakdown.expired || 0}
                            </div>
                        </div>
                        <div className="panel-muted p-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Protected
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-foreground">
                                {statusBreakdown.protectedCount || 0}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <section data-tour="dashboard-top-links" className="panel-soft overflow-hidden">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="soft-label mb-2">Top Performance</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Top links by clicks
                        </h3>
                    </div>

                    <div className="p-4 sm:p-5">
                        {loading ? (
                            <div className="h-[300px] animate-pulse rounded-[1.25rem] border border-border bg-white/[0.03]" />
                        ) : topLinksChartData.length ? (
                            <div className="h-[300px] rounded-[1.25rem] border border-border bg-white/[0.03] p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topLinksChartData}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                        <XAxis
                                            dataKey="slug"
                                            stroke="rgba(255,255,255,0.55)"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.55)"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: "rgba(17,18,20,0.95)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                borderRadius: "16px",
                                                color: "#f5f5f6"
                                            }}
                                        />
                                        <Bar dataKey="clicks" radius={[10, 10, 0, 0]} fill="rgba(167,139,250,0.85)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <DashboardEmpty
                                icon={Activity}
                                title="No ranking data yet"
                                description="Top-performing links will appear here once traffic starts flowing."
                            />
                        )}
                    </div>
                </section>

                <section className="panel-soft overflow-hidden">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="soft-label mb-2">Traffic Sources</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Referrer breakdown
                        </h3>
                    </div>

                    <div className="p-4 sm:p-5">
                        <BreakdownList
                            items={referrerBreakdown}
                            emptyText="No referrer data yet."
                        />
                    </div>
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <section className="panel-soft overflow-hidden">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="soft-label mb-2">Devices</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Device breakdown
                        </h3>
                    </div>

                    <div className="p-4 sm:p-5">
                        <BreakdownList
                            items={deviceBreakdown}
                            emptyText="No device data yet."
                        />
                    </div>
                </section>

                <section className="panel-soft overflow-hidden">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="soft-label mb-2">Browsers</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Browser breakdown
                        </h3>
                    </div>

                    <div className="p-4 sm:p-5">
                        <BreakdownList
                            items={browserBreakdown}
                            emptyText="No browser data yet."
                        />
                    </div>
                </section>

                <section className="panel-soft overflow-hidden">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="soft-label mb-2">Expiry Watch</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Links expiring soon
                        </h3>
                    </div>

                    <div className="p-4 sm:p-5">
                        {loading ? (
                            <DashboardListLoading />
                        ) : expiringSoon.length ? (
                            <div className="space-y-3">
                                {expiringSoon.map((row) => (
                                    <div
                                        key={row.id}
                                        className="rounded-[1.25rem] border border-border bg-white/[0.03] p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-foreground">
                                                    /{row.slug}
                                                </div>
                                                <div className="mt-1 truncate text-sm text-muted-foreground">
                                                    {row.target}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-warning/20 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
                                                <TimerReset size={14} className="mr-1 inline" />
                                                Soon
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            <span>Expires: {formatDate(row.expiresAt)}</span>
                                            <span>Clicks: {row.clicks || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <DashboardEmpty
                                icon={TimerReset}
                                title="Nothing expiring soon"
                                description="Links that are close to expiry will appear here for quick action."
                            />
                        )}
                    </div>
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols">
                <section data-tour="dashboard-recent-activity" className="panel-soft overflow-hidden">
                    <div className="border-b border-border px-5 py-4 sm:px-6">
                        <div className="soft-label mb-2">Recent Activity</div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Recently created links
                        </h3>
                    </div>

                    <div className="p-4 sm:p-5">
                        {loading ? (
                            <DashboardListLoading />
                        ) : recentLinks.length ? (
                            <div className="space-y-3">
                                {recentLinks.map((row) => (
                                    <div
                                        key={row.id}
                                        className="rounded-[1.25rem] border border-border bg-white/[0.03] p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-foreground">
                                                    /{row.slug}
                                                </div>
                                                <div className="mt-1 truncate text-sm text-muted-foreground">
                                                    {row.target}
                                                </div>
                                            </div>

                                            <div
                                                className={`rounded-2xl border px-3 py-1.5 text-xs font-medium ${statusPillClass(
                                                    getLinkStatus(row)
                                                )}`}
                                            >
                                                {getLinkStatus(row)}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            <span>Created: {formatDate(row.createdAt)}</span>
                                            <span>Clicks: {row.clicks || 0}</span>
                                            <span>Expires: {formatDate(row.expiresAt)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <DashboardEmpty
                                icon={Sparkles}
                                title="No links created yet"
                                description="Once you create links, the latest entries will show up here."
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}