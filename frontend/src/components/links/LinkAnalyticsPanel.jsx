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

function BreakdownCard({ title, items = [] }) {
    return (
        <div className="panel-soft p-5">
            <div className="soft-label mb-2">{title}</div>
            <div className="space-y-3">
                {items.length ? (
                    items.map((item) => (
                        <div
                            key={item.label}
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

export default function LinkAnalyticsPanel({ analytics }) {
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
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="rgba(167,139,250,0.85)" />
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