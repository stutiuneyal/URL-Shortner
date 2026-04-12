import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe2,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { useWsStore } from "../store/ws.store";
import { useUiStore } from "../store/ui.store";
import {
  createDomain,
  deleteDomain,
  listDomains,
  verifyDomain
} from "../api/domains.api";
import DomainListItem from "../components/domains/DomainListItem";
import DomainDetailsDrawer from "../components/domains/DomainDetailsDrawer";
import CreateDomainModal from "../components/domains/CreateDomainModal";
import DeleteDomainModal from "../components/domains/DeleteDomainModal";
import { useOnboardingStore } from "../store/onboarding.store";
import { waitForElement } from "../tours/tourUtils";

export function formatDate(value) {
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

export function getDomainStatus(domain) {
  if (domain?.verifiedAt) return "Verified";

  const status = String(domain?.verificationStatus || "").toLowerCase();

  if (
    status.includes("missing") ||
    status.includes("incorrect") ||
    status.includes("failed") ||
    status.includes("not found")
  ) {
    return "DNS issue";
  }

  if (status.includes("pending")) return "Pending DNS";

  return domain?.verificationStatus || "Pending DNS";
}

export function getDomainStatusTone(domain) {
  if (domain?.verifiedAt) {
    return "success";
  }

  const status = String(domain?.verificationStatus || "").toLowerCase();

  if (
    status.includes("missing") ||
    status.includes("incorrect") ||
    status.includes("failed") ||
    status.includes("not found")
  ) {
    return "danger";
  }

  return "warning";
}

export default function Domains() {
  const ws = useWsStore((s) => s.current);
  const pushToast = useUiStore((s) => s.pushToast);

  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedDomainId, setSelectedDomainId] = useState(null);

  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const hasSeenDomainTour = useOnboardingStore((s) => s.hasSeenDomainTour);
  const startTour = useOnboardingStore((s) => s.startTour);

  const showToast = (type, title, description) => {
    pushToast({ type, title, description });
  };

  const showErrorToast = (title, error, fallback) => {
    showToast(
      "error",
      title,
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      fallback
    );
  };

  const copyText = async (text, successTitle = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", successTitle, "Copied to clipboard.");
    } catch {
      showToast("error", "Copy failed", "Could not copy to clipboard.");
    }
  };

  const loadDomains = async () => {
    if (!ws?.id) {
      setDomains([]);
      setSelectedDomainId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await listDomains(ws.id);
      const nextDomains = Array.isArray(data) ? data : [];
      setDomains(nextDomains);

      setSelectedDomainId((prev) => {
        if (!nextDomains.length) return null;
        return nextDomains.some((item) => item.id === prev)
          ? prev
          : nextDomains[0].id;
      });
    } catch (error) {
      console.error("Failed to load domains", error);
      showErrorToast(
        "Failed to load domains",
        error,
        "Something went wrong while loading domains."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [ws?.id]);

  const filteredDomains = useMemo(() => {
    const q = search.trim().toLowerCase();

    return domains.filter((domain) => {
      const matchesSearch = !q || domain.hostname?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "verified") return !!domain.verifiedAt;
      if (statusFilter === "pending") return !domain.verifiedAt;
      if (statusFilter === "issues") {
        const tone = getDomainStatusTone(domain);
        return tone === "danger";
      }

      return true;
    });
  }, [domains, search, statusFilter]);

  const totalCount = domains.length;
  const verifiedCount = useMemo(
    () => domains.filter((item) => !!item.verifiedAt).length,
    [domains]
  );
  const pendingCount = totalCount - verifiedCount;

  const selectedDomain = useMemo(() => {
    if (!domains.length) return null;
    return domains.find((item) => item.id === selectedDomainId) || null;
  }, [domains, selectedDomainId]);

  const handleCreate = async ({ hostname }) => {
    if (!ws?.id) return;

    setCreating(true);
    try {
      const created = await createDomain({
        workspaceId: ws.id,
        hostname
      });

      setDomains((prev) => [created, ...prev]);
      setSelectedDomainId(created?.id || null);
      setCreateOpen(false);

      showToast(
        "success",
        "Domain added",
        `${hostname} has been added. Add the DNS records and then verify it.`
      );

      if (!hasSeenDomainTour && created?.id) {
        setTimeout(async () => {
          setSelectedDomainId(created.id);

          const ready = await waitForElement('[data-tour="domain-dns-records"]', 4000);

          if (ready) {
            startTour("domain");
          }
        }, 350);
      }
    } catch (error) {
      showErrorToast(
        "Failed to add domain",
        error,
        "Something went wrong while adding the domain."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (domain) => {
    if (!domain?.id) return;

    setVerifyingId(domain.id);
    try {
      const updated = await verifyDomain(domain.id);

      setDomains((prev) =>
        prev.map((item) => (item.id === domain.id ? updated : item))
      );

      if (updated?.verifiedAt) {
        showToast(
          "success",
          "Domain verified",
          `${domain.hostname} is now verified and ready to use.`
        );
      } else {
        showToast(
          "warning",
          "DNS not ready yet",
          updated?.verificationStatus || "DNS records are not ready yet."
        );
      }
    } catch (error) {
      showErrorToast(
        "Failed to verify domain",
        error,
        "Something went wrong while verifying the domain."
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (domain) => {
    if (!domain?.id) return;

    setDeleting(true);
    try {
      await deleteDomain(domain.id);

      setDomains((prev) => {
        const next = prev.filter((item) => item.id !== domain.id);
        return next;
      });

      setDeleteTarget(null);
      setSelectedDomainId(null);

      showToast(
        "success",
        "Domain removed",
        `${domain.hostname} has been removed.`
      );
    } catch (error) {
      showErrorToast(
        "Failed to delete domain",
        error,
        "Something went wrong while deleting the domain."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!ws?.id) {
    return (
      <div className="panel-soft p-8">
        <div className="soft-label mb-2">Domains</div>
        <h2 className="text-xl font-semibold text-foreground">
          No workspace selected
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Select a workspace first so the domain library can load for the
          correct workspace.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-soft p-5 sm:p-6"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="soft-label mb-2">Domains</div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Custom domains
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Manage branded domains for this workspace and verify them when
                DNS is ready.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <CompactStat label="Total" value={totalCount} />
                <CompactStat label="Verified" value={verifiedCount} />
                <CompactStat label="Pending" value={pendingCount} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadDomains}
                className="btn-secondary-premium"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="btn-primary-premium"
              >
                <Plus size={16} />
                Add domain
              </button>
            </div>
          </div>
        </motion.section>

        <section className="panel-soft overflow-hidden">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="soft-label mb-2">Domain library</div>
                <h2 className="text-xl font-semibold text-foreground">
                  Workspace domains
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Select a domain to open its details, copy DNS records, or
                  verify configuration.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-[260px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search hostname"
                    className="input-premium pl-10"
                  />
                </div>

                <div className="relative min-w-[190px]">
                  <SlidersHorizontal
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-premium appearance-none pl-10 pr-10"
                  >
                    <option value="all">All statuses</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending DNS</option>
                    <option value="issues">DNS issues</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-[1.25rem] border border-border bg-white/[0.03] p-5"
                  >
                    <div className="h-5 w-56 rounded-full bg-white/[0.06]" />
                    <div className="mt-3 h-4 w-3/4 rounded-full bg-white/[0.05]" />
                    <div className="mt-4 h-9 w-40 rounded-2xl bg-white/[0.05]" />
                  </div>
                ))}
              </div>
            ) : filteredDomains.length ? (
              <div data-tour="domains-list" className="grid gap-3">
                {filteredDomains.map((domain, index) => (
                  <DomainListItem
                    key={domain.id}
                    domain={domain}
                    selected={selectedDomain?.id === domain.id}
                    onSelect={() => setSelectedDomainId(domain.id)}
                    onCopy={copyText}
                    onOpenDetails={() => setSelectedDomainId(domain.id)}
                    dataTour={index === 0 ? "domain-row-first" : undefined}
                  />
                ))}
              </div>
            ) : domains.length ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-accent">
                  <Search size={22} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  No matching domains
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Try changing your search or filter to see more results.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-accent">
                  <Globe2 size={24} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  No custom domains yet
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Add your first branded domain to generate DNS records and
                  start verification.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="btn-primary-premium mt-6"
                >
                  <Plus size={16} />
                  Add domain
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <DomainDetailsDrawer
        domain={selectedDomain}
        open={!!selectedDomain}
        verifying={verifyingId === selectedDomain?.id}
        onClose={() => setSelectedDomainId(null)}
        onVerify={handleVerify}
        onDelete={(domain) => setDeleteTarget(domain)}
        onCopy={copyText}
      />

      <CreateDomainModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />

      <DeleteDomainModal
        domain={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}

function CompactStat({ label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}