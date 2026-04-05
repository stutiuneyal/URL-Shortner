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

export default function LinkRecentClicksList({ items = [] }) {
    return (
        <div className="panel-soft p-5">
            <div className="soft-label mb-2">Recent Clicks</div>
            <h4 className="text-lg font-semibold text-foreground">
                Latest activity
            </h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The most recent click events for this short link.
            </p>

            <div className="mt-5 space-y-3">
                {items.length ? (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-border bg-white/[0.03] p-4"
                        >
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="font-medium text-foreground">
                                    {formatDateTime(item.createdAt)}
                                </span>
                                <span className="text-muted-foreground">
                                    Referrer: {item.referer || "Direct"}
                                </span>
                                <span className="text-muted-foreground">
                                    Browser: {item.browser || "Unknown"}
                                </span>
                                <span className="text-muted-foreground">
                                    Device: {item.deviceType || "Unknown"}
                                </span>
                                <span className="text-muted-foreground">
                                    Country: {item.country || "Unknown"}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-border bg-white/[0.03] p-4 text-sm text-muted-foreground">
                        No click events recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
}