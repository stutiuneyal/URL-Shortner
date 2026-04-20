import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link2, MousePointerClick, Activity, ShieldCheck } from "lucide-react";
import { useWsStore } from "../store/ws.store";
import { useUiStore } from "../store/ui.store";
import {
    listLinks,
    createLink,
    updateLink,
    deleteLink,
    pauseLink,
    resumeLink,
    archiveLink,
    unarchiveLink
} from "../api/links.api";
import { listDomains } from "../api/domains.api";
import { exportLinkAnalyticsCsv, getLinkAnalytics } from "../api/analytics.api";
import LinkTable from "../components/links/LinkTable";
import LinkForm from "../components/links/LinkForm";
import LinkDetailsDrawer from "../components/links/LinkDetailsDrawer";
import { useOnboardingStore } from "../store/onboarding.store";
import { waitForElement } from "../tours/tourUtils";
import { connectRealtime, subscribeTopic, unsubscribeTopic } from "../lib/realtime";

function formatNumber(value) {
    return new Intl.NumberFormat("en-IN").format(value || 0);
}

function calculateStats(items) {
    const totalLinks = items.length;
    const activeLinks = items.filter((item) => item.active && !item.archived).length;
    const totalClicks = items.reduce((sum, item) => sum + (item.clicks || 0), 0);
    const protectedLinks = items.filter((item) => !!item.passwordHash).length;

    return {
        totalLinks,
        activeLinks,
        totalClicks,
        protectedLinks
    };
}

function StatCard({ label, value, icon: Icon, subtle }) {
    return (
        <div className="panel-soft p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                        {value}
                    </div>
                    {subtle ? (
                        <div className="mt-2 text-xs text-muted-foreground">{subtle}</div>
                    ) : null}
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-accent">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

export default function Links() {
    const ws = useWsStore((s) => s.current);
    const pushToast = useUiStore((s) => s.pushToast);

    const [items, setItems] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsActionLoading, setDetailsActionLoading] = useState(false);
    const [selectedAnalytics, setSelectedAnalytics] = useState(null);
    const detailsRefreshTimeoutRef = useRef(null);

    const hasSeenLinkTour = useOnboardingStore((s) => s.hasSeenLinkTour);
    const startTour = useOnboardingStore((s) => s.startTour);

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8091";

    useEffect(() => {
        if (!ws?.id) return undefined;

        connectRealtime();

        const workspaceTopicKey = `workspace-links-${ws.id}`;
        subscribeTopic(
            workspaceTopicKey,
            `/topic/workspaces/${ws.id}/links`,
            (event) => {
                if (!event?.linkId) return;

                setItems((prev) =>
                    prev.map((item) =>
                        item.id === event.linkId
                            ? {
                                ...item,
                                clicks: event.clicks ?? item.clicks,
                                lastClickedAt: event.lastClickedAt ?? item.lastClickedAt
                            }
                            : item
                    )
                );

                setSelectedLink((prev) =>
                    prev?.id === event.linkId
                        ? {
                            ...prev,
                            clicks: event.clicks ?? prev.clicks,
                            lastClickedAt: event.lastClickedAt ?? prev.lastClickedAt
                        }
                        : prev
                );

                setSelectedAnalytics((prev) => {
                    if (!prev || prev?.link?.id !== event.linkId) return prev;

                    const nextRecentClicks = [
                        {
                            id: `rt-${event.createdAt || Date.now()}`,
                            createdAt: event.createdAt,
                            referer: event.referer || "Direct",
                            browser: event.browser || "Unknown",
                            deviceType: event.deviceType || "Unknown",
                            country: event.country || "Unknown"
                        },
                        ...(prev.recentClicks || [])
                    ].slice(0, 15);

                    return {
                        ...prev,
                        link: {
                            ...prev.link,
                            clicks: event.clicks ?? prev.link?.clicks,
                            lastClickedAt: event.lastClickedAt ?? prev.link?.lastClickedAt
                        },
                        summary: {
                            ...prev.summary,
                            totalClicks: event.clicks ?? prev.summary?.totalClicks,
                            lastClickedAt: event.lastClickedAt ?? prev.summary?.lastClickedAt
                        },
                        recentClicks: nextRecentClicks
                    };
                });

                if (selectedLink?.id === event.linkId) {
                    if (detailsRefreshTimeoutRef.current) {
                        clearTimeout(detailsRefreshTimeoutRef.current);
                    }

                    detailsRefreshTimeoutRef.current = setTimeout(async () => {
                        try {
                            const fresh = await getLinkAnalytics(event.linkId);
                            setSelectedAnalytics(fresh);
                        } catch (error) {
                            console.error("Failed to refresh detailed analytics after realtime event", error);
                        }
                    }, 1200);
                }
            }
        );

        return () => {
            unsubscribeTopic(workspaceTopicKey);
            if (detailsRefreshTimeoutRef.current) {
                clearTimeout(detailsRefreshTimeoutRef.current);
            }
        };
    }, [ws?.id, selectedLink?.id]);

    const load = useCallback(async () => {
        if (!ws?.id) {
            setItems([]);
            setDomains([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const [links, linkedDomains] = await Promise.all([
                listLinks(ws.id),
                listDomains(ws.id)
            ]);

            setItems(Array.isArray(links) ? links : []);
            setDomains(Array.isArray(linkedDomains) ? linkedDomains : []);
        } catch (error) {
            console.error("Failed to load links", error);
        } finally {
            setLoading(false);
        }
    }, [ws?.id]);

    useEffect(() => {
        load();
    }, [load]);

    const stats = useMemo(() => calculateStats(items), [items]);

    const handleCreateOpen = () => {
        setEditing(null);
        setOpenForm(true);
    };

    const handleEditOpen = (row) => {
        setEditing(row);
        setOpenForm(true);
    };

    const handleSubmit = async (payload) => {
        setSubmitting(true);

        try {
            const isEditing = Boolean(editing?.id);

            if (isEditing) {
                await updateLink(editing.id, payload);
                pushToast({
                    type: "success",
                    title: "Link updated",
                    description: `“${payload.slug || editing.slug}” has been updated successfully.`
                });
            } else {
                await createLink(payload);
                pushToast({
                    type: "success",
                    title: "Link created",
                    description: "Your short link is now ready to use."
                });
            }

            setOpenForm(false);
            setEditing(null);
            await load();

            if (!isEditing && !hasSeenLinkTour) {
                setTimeout(async () => {
                    const rowReady = await waitForElement('[data-tour="link-row-first"]', 4000);

                    if (!rowReady) return;

                    const firstRow = document.querySelector('[data-tour="link-row-first"]');
                    firstRow?.scrollIntoView({ behavior: "smooth", block: "center" });

                    setTimeout(() => {
                        document.body.classList.add("tour-active");
                        startTour("link");
                    }, 350);
                }, 250);
            }
        } catch (error) {
            console.error("Failed to save link", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (row) => {
        try {
            await deleteLink(row.id);
            pushToast({
                type: "success",
                title: "Link deleted",
                description: `“${row.slug}” has been removed.`
            });

            if (selectedLink?.id === row.id) {
                setDetailsOpen(false);
                setSelectedLink(null);
                setSelectedAnalytics(null);
            }

            await load();
        } catch (error) {
            console.error("Failed to delete link", error);
        }
    };

    const openDetails = async (row) => {
        setSelectedLink(row);
        setDetailsOpen(true);
        setDetailsLoading(true);

        try {
            const analytics = await getLinkAnalytics(row.id);
            setSelectedAnalytics(analytics);
        } catch (error) {
            console.error("Failed to load link analytics", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const reloadDetails = async () => {
        if (!selectedLink?.id) return;
        const analytics = await getLinkAnalytics(selectedLink.id);
        setSelectedAnalytics(analytics);
    };

    const runLifecycleAction = async (fn, successTitle, successDescription) => {
        if (!selectedLink?.id) return;
        setDetailsActionLoading(true);

        try {
            await fn(selectedLink.id);
            pushToast({
                type: "success",
                title: successTitle,
                description: successDescription
            });
            await Promise.all([load(), reloadDetails()]);
        } catch (error) {
            console.error("Lifecycle action failed", error);
        } finally {
            setDetailsActionLoading(false);
        }
    };

    const handleExportCsv = async () => {
        if (!selectedLink?.id) return;

        try {
            const blob = await exportLinkAnalyticsCsv(selectedLink.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `link-analytics-${selectedLink.slug}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            pushToast({
                type: "success",
                title: "CSV export ready",
                description: `Analytics for ${selectedLink.slug} downloaded.`
            });
        } catch (error) {
            console.error("Failed to export CSV", error);
        }
    };

    if (!ws?.id) {
        return (
            <div className="panel-soft p-8">
                <div className="soft-label mb-2">Links</div>
                <h2 className="text-xl font-semibold text-foreground">
                    No workspace selected
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Select a workspace first so we can show its short links, analytics, and domain options.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <motion.section
                    data-tour="links-page-overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel-soft overflow-hidden"
                >
                    <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.4fr_0.9fr] lg:px-6">
                        <div>
                            <div className="soft-label mb-2">Link Management</div>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                Build, organize, and track every short link
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Now upgraded with per-link details, lifecycle controls, CSV export, and branded QR support.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <StatCard
                                label="Total links"
                                value={formatNumber(stats.totalLinks)}
                                icon={Link2}
                                subtle="All links in this workspace"
                            />
                            <StatCard
                                label="Total clicks"
                                value={formatNumber(stats.totalClicks)}
                                icon={MousePointerClick}
                                subtle="Accumulated traffic so far"
                            />
                            <StatCard
                                label="Active links"
                                value={formatNumber(stats.activeLinks)}
                                icon={Activity}
                                subtle="Currently redirecting"
                            />
                            <StatCard
                                label="Protected links"
                                value={formatNumber(stats.protectedLinks)}
                                icon={ShieldCheck}
                                subtle="Password-enabled links"
                            />
                        </div>
                    </div>
                </motion.section>

                <LinkTable
                    data={items}
                    loading={loading}
                    baseUrl={baseUrl}
                    domains={domains}
                    onCreate={handleCreateOpen}
                    onEdit={handleEditOpen}
                    onDelete={handleDelete}
                    onViewDetails={openDetails}
                    tableTourAttr="links-table"
                />

                <LinkForm
                    open={openForm}
                    loading={submitting}
                    onCancel={() => {
                        setOpenForm(false);
                        setEditing(null);
                    }}
                    onSubmit={handleSubmit}
                    initialValues={editing}
                    workspaceId={ws.id}
                    domains={domains}
                />
            </div>

            <LinkDetailsDrawer
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                analytics={selectedAnalytics}
                shortUrl={selectedAnalytics?.link?.slug ? `${baseUrl}/r/${selectedAnalytics.link.slug}` : ""}
                actionLoading={detailsActionLoading || detailsLoading}
                onPause={() =>
                    runLifecycleAction(
                        pauseLink,
                        "Link paused",
                        `${selectedAnalytics?.link?.slug || "Link"} has been paused.`
                    )
                }
                onResume={() =>
                    runLifecycleAction(
                        resumeLink,
                        "Link resumed",
                        `${selectedAnalytics?.link?.slug || "Link"} is live again.`
                    )
                }
                onArchive={() =>
                    runLifecycleAction(
                        archiveLink,
                        "Link archived",
                        `${selectedAnalytics?.link?.slug || "Link"} has been archived.`
                    )
                }
                onUnarchive={() =>
                    runLifecycleAction(
                        unarchiveLink,
                        "Link unarchived",
                        `${selectedAnalytics?.link?.slug || "Link"} is available again.`
                    )
                }
                onExportCsv={handleExportCsv}
            />
        </>
    );
}