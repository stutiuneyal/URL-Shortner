import {
    AreaChart,
    Area,
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar
} from "recharts";
import {
    AlertCircle,
    AlertTriangle,
    Brain,
    Lightbulb,
    RefreshCw,
    Sparkles,
    Wand2
} from "lucide-react";

function BreakdownCard({ title, items = [] }) {
    return (
        <div className="panel-soft p-5">
            <div className="soft-label mb-2">{title}</div>
            <div className="space-y-3">
                {items.length ? (
                    items.map((item) => (
                        <div
                            key={`${title}-${item.label}`}
                            className="flex items-center justify-between rounded-2xl border border-border bg-white/[0.03] px-4 py-3"
                        >
                            <div className="truncate text-sm text-foreground">{item.label}</div>
                            <div className="text-sm font-semibold text-foreground">{item.value}</div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                        No data yet.
                    </div>
                )}
            </div>
        </div>
    );
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

function formatDateTime(value) {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function insightToneClass(priority) {
    switch ((priority || "").toLowerCase()) {
        case "high":
            return "border-amber-400/20 bg-amber-400/10 text-amber-200";
        case "medium":
            return "border-sky-400/20 bg-sky-400/10 text-sky-200";
        case "low":
            return "border-white/10 bg-white/[0.06] text-zinc-200";
        default:
            return "border-white/10 bg-white/[0.06] text-zinc-200";
    }
}

function insightCategoryLabel(category) {
    if (!category) return "Insight";
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function AiInsightsLoadingCard() {
    return (
        <div className="panel-soft p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="soft-label mb-2">AI Analysis</div>
                    <h4 className="text-lg font-semibold text-foreground">
                        Generating insights
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        We are analyzing link performance, traffic mix, geography, device behavior, and referrers.
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                    <RefreshCw size={18} className="animate-spin" />
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="rounded-2xl border border-border bg-white/[0.03] p-4"
                    >
                        <div className="h-4 w-32 animate-pulse rounded bg-white/[0.08]" />
                        <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/[0.06]" />
                        <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-white/[0.06]" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function AiInsightsErrorCard({ message, onRetry }) {
    return (
        <div className="panel-soft p-5">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
                    <AlertCircle size={18} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="soft-label mb-2">AI Analysis</div>
                    <h4 className="text-lg font-semibold text-foreground">
                        Insights are temporarily unavailable
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {message || "We could not generate insights for this link right now."}
                    </p>

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={onRetry}
                            className="btn-secondary-premium inline-flex items-center gap-2"
                        >
                            <RefreshCw size={15} />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AiInsightsEmptyCard({ onRetry }) {
    return (
        <div className="panel-soft p-5">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-200">
                    <Brain size={18} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="soft-label mb-2">AI Analysis</div>
                    <h4 className="text-lg font-semibold text-foreground">
                        No AI insights yet
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        This link does not have enough interpreted insight data yet, or the AI response was empty.
                    </p>

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={onRetry}
                            className="btn-secondary-premium inline-flex items-center gap-2"
                        >
                            <Sparkles size={15} />
                            Generate Insights
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AiInsightsCard({
    aiInsights,
    aiInsightsLoading,
    aiInsightsError,
    onRetryAiInsights,
    onOpenAiChat
}) {
    if (aiInsightsLoading) {
        return <AiInsightsLoadingCard />;
    }

    if (aiInsightsError) {
        return (
            <AiInsightsErrorCard
                message={aiInsightsError}
                onRetry={onRetryAiInsights}
            />
        );
    }

    if (!aiInsights || !aiInsights.summary) {
        return <AiInsightsEmptyCard onRetry={onRetryAiInsights} />;
    }

    const insights = Array.isArray(aiInsights.insights) ? aiInsights.insights : [];

    return (
        <div className="panel-soft p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="soft-label mb-2">AI Analysis</div>
                    <h4 className="text-lg font-semibold text-foreground">
                        What the traffic is telling you
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {aiInsights.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {aiInsights.model ? (
                            <div className="rounded-full border border-border bg-white/[0.04] px-2.5 py-1">
                                Model: {aiInsights.model}
                            </div>
                        ) : null}

                        {aiInsights.generatedAt ? (
                            <div className="rounded-full border border-border bg-white/[0.04] px-2.5 py-1">
                                Generated: {formatDateTime(aiInsights.generatedAt)}
                            </div>
                        ) : null}

                        {aiInsights.cached !== undefined ? (
                            <div className="rounded-full border border-border bg-white/[0.04] px-2.5 py-1">
                                {aiInsights.cached ? "Cached" : "Fresh"}
                            </div>
                        ) : null}

                        {aiInsights.basedOnTotalClicks !== undefined && aiInsights.basedOnTotalClicks !== null ? (
                            <div className="rounded-full border border-border bg-white/[0.04] px-2.5 py-1">
                                Based on {aiInsights.basedOnTotalClicks} clicks
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onRetryAiInsights}
                        className="btn-secondary-premium inline-flex items-center gap-2"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>

                    {onOpenAiChat ? (
                        <button
                            type="button"
                            onClick={onOpenAiChat}
                            className="btn-primary-premium inline-flex items-center gap-2"
                        >
                            <Wand2 size={15} />
                            Ask AI
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="mt-5 grid gap-3">
                {insights.length ? (
                    insights.map((item, index) => (
                        <div
                            key={`${item.title}-${index}`}
                            className="rounded-2xl border border-border bg-white/[0.03] p-4"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                                            {item.priority === "high" ? (
                                                <AlertTriangle size={16} />
                                            ) : item.category === "action" ? (
                                                <Lightbulb size={16} />
                                            ) : (
                                                <Brain size={16} />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-foreground">
                                                {item.title}
                                            </div>
                                            <div className="mt-1 text-sm leading-6 text-muted-foreground">
                                                {item.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-2 pl-12 sm:pl-0">
                                    {item.priority ? (
                                        <div
                                            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${insightToneClass(
                                                item.priority
                                            )}`}
                                        >
                                            {item.priority}
                                        </div>
                                    ) : null}

                                    {item.category ? (
                                        <div className="rounded-full border border-border bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                            {insightCategoryLabel(item.category)}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                        No detailed insight items were returned for this link yet.
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LinkAnalyticsPanel({
    analytics,
    aiInsights,
    aiInsightsLoading = false,
    aiInsightsError = "",
    onRetryAiInsights,
    onOpenAiChat
}) {
    const timeline = (analytics?.timeline || []).map((item) => ({
        ...item,
        shortLabel: formatTimelineLabel(item.label)
    }));

    const referrers = analytics?.referrers || [];
    const devices = analytics?.devices || [];
    const browsers = analytics?.browsers || [];
    const countries = analytics?.countries || [];

    return (
        <div className="space-y-6">
            <AiInsightsCard
                aiInsights={aiInsights}
                aiInsightsLoading={aiInsightsLoading}
                aiInsightsError={aiInsightsError}
                onRetryAiInsights={onRetryAiInsights}
                onOpenAiChat={onOpenAiChat}
            />

            <div className="panel-soft p-5">
                <div className="soft-label mb-2">Clicks Timeline</div>
                <h4 className="text-lg font-semibold text-foreground">
                    Last 7 days
                </h4>

                <div className="mt-5 h-[280px] rounded-[1.25rem] border border-border bg-white/[0.03] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeline}>
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
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <BreakdownCard title="Referrers" items={referrers} />
                <BreakdownCard title="Devices" items={devices} />
                <BreakdownCard title="Browsers" items={browsers} />

                <div className="panel-soft p-5">
                    <div className="soft-label mb-2">Countries</div>
                    <div className="h-[240px] rounded-[1.25rem] border border-border bg-white/[0.03] p-4">
                        {countries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={countries}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                    <XAxis
                                        dataKey="label"
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
                                    <Bar
                                        dataKey="value"
                                        radius={[10, 10, 0, 0]}
                                        fill="rgba(167,139,250,0.85)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No country data yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}