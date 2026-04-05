import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Copy,
    ExternalLink,
    Eye,
    Pencil,
    Plus,
    Search,
    Trash2,
    Link2,
    CalendarClock,
    Tag as TagIcon,
    Filter,
    ArrowUpDown
} from "lucide-react";
import { useUiStore } from "../../store/ui.store";
import AppSelect from "../ui/AppSelect";

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

function getStatus(row) {
    if (row.archived) return "Archived";
    if (!row.active) return "Paused";
    if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) return "Expired";
    return "Live";
}

function getStatusClasses(row) {
    const status = getStatus(row);
    if (status === "Archived") return "border-warning/20 bg-warning/10 text-warning";
    if (status === "Paused") return "border-white/10 bg-white/[0.06] text-muted-foreground";
    if (status === "Expired") return "border-danger/20 bg-danger/10 text-danger";
    return "border-success/20 bg-success/10 text-success";
}

function sortItems(items, sortBy) {
    const cloned = [...items];

    switch (sortBy) {
        case "clicks-desc":
            return cloned.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
        case "clicks-asc":
            return cloned.sort((a, b) => (a.clicks || 0) - (b.clicks || 0));
        case "slug-asc":
            return cloned.sort((a, b) => (a.slug || "").localeCompare(b.slug || ""));
        case "slug-desc":
            return cloned.sort((a, b) => (b.slug || "").localeCompare(a.slug || ""));
        case "created-desc":
            return cloned.sort(
                (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
        case "created-asc":
            return cloned.sort(
                (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            );
        default:
            return cloned;
    }
}

function DeleteModal({ row, onClose, onConfirm }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 px-4 backdrop-blur-md"
            >
                <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="panel w-full max-w-md p-6"
                >
                    <div className="soft-label mb-2">Delete Link</div>
                    <h3 className="text-xl font-semibold text-foreground">
                        Remove “{row.slug}”?
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        This action cannot be undone. The short link will stop being available once deleted.
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary-premium">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onConfirm(row)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/15 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function EmptyState({ onCreate }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-accent">
                <Link2 size={26} />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-foreground">
                No links yet
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Start with your first short link. Add a target URL, custom slug, optional expiry, and tags.
            </p>
            <button type="button" onClick={onCreate} className="btn-primary-premium mt-6">
                <Plus size={16} />
                Create Your First Link
            </button>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-3xl border border-border bg-white/[0.03] p-5"
                >
                    <div className="mb-3 h-5 w-40 rounded-full bg-white/[0.06]" />
                    <div className="mb-2 h-4 w-3/4 rounded-full bg-white/[0.04]" />
                    <div className="h-4 w-1/2 rounded-full bg-white/[0.04]" />
                </div>
            ))}
        </div>
    );
}

export default function LinkTable({
    data,
    loading,
    baseUrl,
    domains,
    onCreate,
    onEdit,
    onDelete,
    onViewDetails
}) {
    const pushToast = useUiStore((s) => s.pushToast);

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("created-desc");
    const [deleteRow, setDeleteRow] = useState(null);

    const domainMap = useMemo(() => {
        const map = new Map();
        (domains || []).forEach((domain) => {
            map.set(domain.id, domain.hostname);
        });
        return map;
    }, [domains]);

    const statusOptions = [
        { value: "all", label: "All statuses" },
        { value: "live", label: "Live" },
        { value: "paused", label: "Paused" },
        { value: "expired", label: "Expired" },
        { value: "archived", label: "Archived" },
        { value: "protected", label: "Protected only" }
    ];

    const sortOptions = [
        { value: "created-desc", label: "Newest first" },
        { value: "created-asc", label: "Oldest first" },
        { value: "clicks-desc", label: "Most clicks" },
        { value: "clicks-asc", label: "Least clicks" },
        { value: "slug-asc", label: "Slug A → Z" },
        { value: "slug-desc", label: "Slug Z → A" }
    ];

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        const result = data.filter((row) => {
            const matchesQuery =
                !q ||
                row.slug?.toLowerCase().includes(q) ||
                row.target?.toLowerCase().includes(q) ||
                (row.tags || []).some((tag) => tag.toLowerCase().includes(q));

            const rowStatus = getStatus(row);
            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "protected"
                        ? !!row.passwordHash
                        : rowStatus.toLowerCase() === statusFilter;

            return matchesQuery && matchesStatus;
        });

        return sortItems(result, sortBy);
    }, [data, query, statusFilter, sortBy]);

    return (
        <>
            <section className="panel-soft overflow-hidden">
                <div className="border-b border-border px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="soft-label mb-2">Library</div>
                            <h3 className="text-xl font-semibold text-foreground">
                                All workspace links
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Search, filter, manage lifecycle, and open per-link detail drawers.
                            </p>
                        </div>

                        <button type="button" onClick={onCreate} className="btn-primary-premium self-start">
                            <Plus size={16} />
                            Create Link
                        </button>
                    </div>

                    <div className="mt-5 grid gap-3 xl:grid-cols-[1.2fr_220px_220px]">
                        <div className="relative">
                            <Search
                                size={16}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by slug, target, or tags"
                                className="input-premium pl-11"
                            />
                        </div>

                        <AppSelect
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                            options={statusOptions}
                            placeholder="Filter status"
                            icon={Filter}
                        />

                        <AppSelect
                            value={sortBy}
                            onValueChange={setSortBy}
                            options={sortOptions}
                            placeholder="Sort links"
                            icon={ArrowUpDown}
                        />
                    </div>
                </div>

                <div className="p-4 sm:p-5">
                    {loading ? (
                        <LoadingState />
                    ) : !filtered.length ? (
                        <EmptyState onCreate={onCreate} />
                    ) : (
                        <div className="grid gap-4">
                            {filtered.map((row) => {
                                const shortUrl = `${baseUrl}/r/${row.slug}`;
                                const domainLabel = row.domainId ? domainMap.get(row.domainId) : null;

                                return (
                                    <motion.div
                                        key={row.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-[1.6rem] border border-border bg-white/[0.03] p-5 transition hover:border-white/10 hover:bg-white/[0.045]"
                                    >
                                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-foreground">
                                                        /{row.slug}
                                                    </div>

                                                    <div
                                                        className={`rounded-2xl border px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                                                            row
                                                        )}`}
                                                    >
                                                        {getStatus(row)}
                                                    </div>

                                                    {row.passwordHash ? (
                                                        <div className="rounded-2xl border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                                                            Protected
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="mt-4 flex flex-col gap-3">
                                                    <div>
                                                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                            Short URL
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                                            <a
                                                                href={shortUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-sm font-medium text-foreground transition hover:text-accent"
                                                            >
                                                                {shortUrl}
                                                            </a>
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
                                                                className="btn-ghost-premium rounded-xl px-2 py-1.5"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                            Target
                                                        </div>
                                                        <div className="mt-1 break-all text-sm leading-6 text-muted-foreground">
                                                            {row.target}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                                                    <MetricRow label="Clicks" value={row.clicks || 0} icon={<ClickIcon />} />
                                                    <MetricRow label="Expires" value={formatDate(row.expiresAt)} icon={<CalendarClock size={15} />} />
                                                    <MetricRow label="Limit" value={row.clickLimit ?? "—"} icon={<TagIcon size={15} />} />
                                                    <MetricRow label="Domain" value={domainLabel || "Default"} icon={<Link2 size={15} />} />
                                                </div>

                                                {!!row.tags?.length && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {row.tags.map((tag) => (
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

                                            <div className="flex shrink-0 flex-wrap gap-2 xl:w-[260px] xl:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => onViewDetails(row)}
                                                    className="btn-secondary-premium"
                                                >
                                                    <Eye size={16} />
                                                    Details
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(row)}
                                                    className="btn-secondary-premium"
                                                >
                                                    <Pencil size={16} />
                                                    Edit
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
                                                    onClick={() => setDeleteRow(row)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {deleteRow ? (
                <DeleteModal
                    row={deleteRow}
                    onClose={() => setDeleteRow(null)}
                    onConfirm={async (row) => {
                        await onDelete(row);
                        setDeleteRow(null);
                    }}
                />
            ) : null}
        </>
    );
}

function MetricRow({ label, value, icon }) {
    return (
        <div className="panel-muted flex items-center gap-2 px-3 py-2.5">
            {icon}
            <span>
                {label}: <span className="font-medium text-foreground">{value}</span>
            </span>
        </div>
    );
}

function ClickIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            className="text-muted-foreground"
            aria-hidden="true"
        >
            <path
                d="M7 4.5L17.5 15L12.5 15.5L10.5 20L8.5 19L10.5 14.5L7 4.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
        </svg>
    );
}