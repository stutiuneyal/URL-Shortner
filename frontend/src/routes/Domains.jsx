import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  Globe2,
  LoaderCircle,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  X,
  Sparkles
} from "lucide-react";
import { useWsStore } from "../store/ws.store";
import { useUiStore } from "../store/ui.store";
import {
  createDomain,
  deleteDomain,
  listDomains,
  verifyDomain
} from "../api/domains.api";

function formatDate(value) {
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

function getDomainStatus(domain) {
  if (domain?.verifiedAt) return "Verified";
  return domain?.verificationStatus || "Pending";
}

function getDomainStatusClasses(domain) {
  if (domain?.verifiedAt) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  const status = (domain?.verificationStatus || "").toLowerCase();

  if (
    status.includes("missing") ||
    status.includes("incorrect") ||
    status.includes("failed") ||
    status.includes("not found")
  ) {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-300";
}

function getDomainStatusIcon(domain) {
  if (domain?.verifiedAt) {
    return <CheckCircle2 size={14} />;
  }
  return <CircleAlert size={14} />;
}

function StepCard({ number, title, description, active }) {
  return (
    <div
      className={`rounded-[1.5rem] border p-4 transition ${active
          ? "border-accent/30 bg-accent/10"
          : "border-border bg-white/[0.03]"
        }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold ${active
              ? "bg-accent text-white"
              : "border border-white/10 bg-white/[0.05] text-muted-foreground"
            }`}
        >
          {number}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="mt-1 text-xs leading-6 text-muted-foreground">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

function DnsRow({ type, name, value, ttl = "Automatic", onCopy }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-white/[0.03] p-4">
      <div className="grid gap-4 lg:grid-cols-[110px_1fr_1fr_110px_auto] lg:items-start">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Type
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">{type}</div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Name / Host
          </div>
          <div className="mt-2 break-all text-sm font-medium text-foreground">
            {name}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Value / Target
          </div>
          <div className="mt-2 break-all text-sm font-medium text-foreground">
            {value}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            TTL
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">{ttl}</div>
        </div>

        <div className="lg:pt-6">
          <button
            type="button"
            onClick={() => onCopy?.(`${type} | ${name} | ${value}`)}
            className="btn-secondary-premium"
          >
            <Copy size={16} />
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateDomainModal({ open, onClose, onSubmit, loading }) {
  const [hostname, setHostname] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setHostname("");
      setErrors({});
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    const trimmed = hostname.trim().toLowerCase();

    if (!trimmed) {
      nextErrors.hostname = "Hostname is required.";
    } else {
      const valid = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(trimmed);
      if (!valid) {
        nextErrors.hostname = "Enter a valid domain like links.example.com";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await onSubmit({ hostname: trimmed });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="panel w-full max-w-xl p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="soft-label mb-2">Add Domain</div>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  Connect a branded domain
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Add a subdomain you control. We will generate the DNS records
                  needed to verify it.
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

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Hostname
                </label>
                <input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="links.example.com"
                  className="input-premium"
                  autoFocus
                />
                {errors.hostname ? (
                  <div className="mt-2 text-sm text-danger">{errors.hostname}</div>
                ) : (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Recommended: use a subdomain like links.example.com or go.example.com
                  </div>
                )}
              </div>

              <div className="panel-muted px-4 py-4 text-sm text-muted-foreground">
                After adding the domain, copy the generated TXT and CNAME records
                into your DNS provider, wait for propagation, then click verify.
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary-premium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-premium disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Adding..." : "Add Domain"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DeleteDomainModal({ domain, onClose, onConfirm, loading }) {
  return (
    <AnimatePresence>
      {domain ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="panel w-full max-w-md p-6"
          >
            <div className="soft-label mb-2">Delete Domain</div>
            <h3 className="text-xl font-semibold text-foreground">
              Remove {domain.hostname}?
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This will remove the domain from your workspace.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary-premium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => onConfirm(domain)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/15 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
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

  const showToast = (type, title, description) => {
    pushToast({ type, title, description });
  };

  const showErrorToast = (title, error, fallback) => {
    showToast(
      "error",
      title,
      error?.response?.data?.message || error?.message || fallback
    );
  };

  const copyText = async (text, successTitle = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", successTitle, text);
    } catch {
      showToast("error", "Copy failed", "Could not copy to clipboard.");
    }
  };

  const loadDomains = async () => {
    if (!ws?.id) {
      setDomains([]);
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

  const verifiedCount = useMemo(
    () => domains.filter((item) => !!item.verifiedAt).length,
    [domains]
  );

  const selectedDomain = useMemo(() => {
    if (!domains.length) return null;
    return domains.find((item) => item.id === selectedDomainId) || domains[0];
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
        `${hostname} has been added. Now add the DNS records and verify it.`
      );
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
    setDeleting(true);
    try {
      await deleteDomain(domain.id);

      setDomains((prev) => {
        const next = prev.filter((item) => item.id !== domain.id);
        setSelectedDomainId((current) =>
          current === domain.id ? next[0]?.id || null : current
        );
        return next;
      });

      setDeleteTarget(null);

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
          Select a workspace first so the domain library and verification details
          can load for the correct workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-soft overflow-hidden"
      >
        <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr] lg:px-6">
          <div>
            <div className="soft-label mb-2">Domains</div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Connect branded domains to your short links
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Add a subdomain, verify it once, and then manage it as a clean branded asset for your workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Total Domains
              </div>
              <div className="mt-3 text-2xl font-semibold text-foreground">
                {domains.length}
              </div>
            </div>

            <div className="panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Verified
              </div>
              <div className="mt-3 text-2xl font-semibold text-foreground">
                {verifiedCount}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <div className="panel-soft p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="soft-label mb-2">Setup Flow</div>
                <h3 className="text-lg font-semibold text-foreground">
                  How domain verification works
                </h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-accent">
                <Sparkles size={18} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <StepCard
                number="1"
                title="Add a domain"
                description="Create a branded subdomain inside this workspace."
                active={!selectedDomain}
              />
              <StepCard
                number="2"
                title="Add DNS records"
                description="Copy the TXT and CNAME records into your DNS provider."
                active={!!selectedDomain && !selectedDomain?.verifiedAt}
              />
              <StepCard
                number="3"
                title="Verified"
                description="Once verified, the domain is ready to use."
                active={!!selectedDomain && !!selectedDomain?.verifiedAt}
              />
            </div>
          </div>

          <div className="panel-soft overflow-hidden">
            <div className="border-b border-border px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="soft-label mb-2">Workspace Domain Library</div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Custom domains
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Select a domain to view its current state and management details.
                  </p>
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
                    Add Domain
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {loading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-[1.5rem] border border-border bg-white/[0.03] p-5"
                    >
                      <div className="h-5 w-44 rounded-full bg-white/[0.06]" />
                      <div className="mt-4 h-4 w-3/4 rounded-full bg-white/[0.05]" />
                      <div className="mt-3 h-4 w-1/2 rounded-full bg-white/[0.05]" />
                    </div>
                  ))}
                </div>
              ) : domains.length ? (
                <div className="grid gap-4">
                  {domains.map((domain) => {
                    const isSelected = selectedDomain?.id === domain.id;

                    return (
                      <motion.button
                        key={domain.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedDomainId(domain.id)}
                        className={`w-full rounded-[1.5rem] border p-5 text-left transition ${isSelected
                            ? "border-accent/40 bg-accent/10 ring-1 ring-accent/20"
                            : "border-border bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.045]"
                          }`}
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-foreground break-all">
                                {domain.hostname}
                              </div>

                              <div
                                className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-medium ${getDomainStatusClasses(
                                  domain
                                )}`}
                              >
                                {getDomainStatusIcon(domain)}
                                {getDomainStatus(domain)}
                              </div>
                            </div>

                            <div className="mt-3 text-sm leading-6 text-muted-foreground">
                              {domain?.verifiedAt
                                ? "This domain has already been verified and is ready to use."
                                : domain?.verificationStatus || "Waiting for DNS configuration."}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              <div className="panel-muted px-4 py-3">
                                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                  Created
                                </div>
                                <div className="mt-2 text-sm font-medium text-foreground">
                                  {formatDate(domain.createdAt)}
                                </div>
                              </div>

                              <div className="panel-muted px-4 py-3">
                                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                  Verified At
                                </div>
                                <div className="mt-2 text-sm font-medium text-foreground">
                                  {formatDate(domain.verifiedAt)}
                                </div>
                              </div>

                              <div className="panel-muted px-4 py-3">
                                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                  Last Checked
                                </div>
                                <div className="mt-2 text-sm font-medium text-foreground">
                                  {formatDate(domain.lastCheckedAt)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2 xl:w-[220px] xl:justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyText(domain.hostname, "Hostname copied");
                              }}
                              className="btn-secondary-premium"
                            >
                              <Copy size={16} />
                              Copy
                            </button>

                            <a
                              href={`https://${domain.hostname}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="btn-secondary-premium"
                            >
                              <ExternalLink size={16} />
                              Open
                            </a>

                            {!domain?.verifiedAt ? (
                              <button
                                type="button"
                                disabled={verifyingId === domain.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerify(domain);
                                }}
                                className="btn-secondary-premium disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {verifyingId === domain.id ? (
                                  <LoaderCircle size={16} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={16} />
                                )}
                                Verify
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(domain);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
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
                    Add your first branded domain to generate DNS records and start verification.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="btn-primary-premium mt-6"
                  >
                    <Plus size={16} />
                    Add Domain
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-soft p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="soft-label mb-2">Selected Domain</div>
                <h3 className="text-xl font-semibold text-foreground break-all">
                  {selectedDomain ? selectedDomain.hostname : "No domain selected"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedDomain
                    ? selectedDomain?.verifiedAt
                      ? "This domain is verified and now lives here as a managed asset."
                      : "Use these exact DNS values in your provider, then verify once propagation completes."
                    : "Choose a domain from the left to see its details."}
                </p>
              </div>

              {selectedDomain ? (
                <div
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${getDomainStatusClasses(
                    selectedDomain
                  )}`}
                >
                  {getDomainStatusIcon(selectedDomain)}
                  {getDomainStatus(selectedDomain)}
                </div>
              ) : null}
            </div>

            {selectedDomain ? (
              selectedDomain?.verifiedAt ? (
                <>
                  <div className="mb-5 rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    This domain has been verified successfully and is ready for use.
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="panel-muted px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Verification Status
                      </div>
                      <div className="mt-2 text-sm font-medium text-foreground">
                        Verified
                      </div>
                    </div>

                    <div className="panel-muted px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Last Checked
                      </div>
                      <div className="mt-2 text-sm font-medium text-foreground">
                        {formatDate(selectedDomain.lastCheckedAt)}
                      </div>
                    </div>

                    <div className="panel-muted px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Verified At
                      </div>
                      <div className="mt-2 text-sm font-medium text-foreground">
                        {formatDate(selectedDomain.verifiedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => copyText(selectedDomain.hostname, "Hostname copied")}
                      className="btn-secondary-premium"
                    >
                      <Copy size={16} />
                      Copy Hostname
                    </button>

                    <a
                      href={`https://${selectedDomain.hostname}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary-premium"
                    >
                      <ExternalLink size={16} />
                      Open Domain
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5 rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                    DNS records may take time to propagate. If verification fails immediately after adding records, wait a little and try again.
                  </div>

                  <div className="space-y-3">
                    {(selectedDomain.requiredDnsRecords || []).map((record, index) => (
                      <DnsRow
                        key={`${record.type}-${record.name}-${index}`}
                        type={record.type}
                        name={record.name}
                        value={record.value}
                        onCopy={(text) => copyText(text, "DNS record copied")}
                      />
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={verifyingId === selectedDomain.id}
                      onClick={() => handleVerify(selectedDomain)}
                      className="btn-primary-premium disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {verifyingId === selectedDomain.id ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                      Verify DNS
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          (selectedDomain.requiredDnsRecords || [])
                            .map(
                              (record) =>
                                `${record.type} | ${record.name} | ${record.value}`
                            )
                            .join("\n"),
                          "All DNS records copied"
                        )
                      }
                      className="btn-secondary-premium"
                    >
                      <Copy size={16} />
                      Copy All Records
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="panel-muted px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Verification Status
                      </div>
                      <div className="mt-2 text-sm font-medium text-foreground">
                        {selectedDomain.verificationStatus || "Pending"}
                      </div>
                    </div>

                    <div className="panel-muted px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Last Checked
                      </div>
                      <div className="mt-2 text-sm font-medium text-foreground">
                        {formatDate(selectedDomain.lastCheckedAt)}
                      </div>
                    </div>

                    <div className="panel-muted px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Verified At
                      </div>
                      <div className="mt-2 text-sm font-medium text-foreground">
                        {formatDate(selectedDomain.verifiedAt)}
                      </div>
                    </div>
                  </div>
                </>
              )
            ) : (
              <div className="rounded-[1.25rem] border border-border bg-white/[0.03] px-5 py-10 text-center text-sm text-muted-foreground">
                Select a domain from the left to view its details.
              </div>
            )}
          </div>

          <div className="panel-soft p-5">
            <div className="soft-label mb-2">Helpful Notes</div>
            <h4 className="text-lg font-semibold text-foreground">
              DNS setup tips
            </h4>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-3">
                Use subdomains like <code>links.example.com</code> instead of apex domains when possible.
              </div>
              <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-3">
                Some providers expect relative host names like <code>links</code> or <code>_verify.links</code>.
              </div>
              <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-3">
                Once a domain is verified, DNS setup instructions are hidden to keep the view clean.
              </div>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  );
}