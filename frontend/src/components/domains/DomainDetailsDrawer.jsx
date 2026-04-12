import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
    CheckCircle2,
    CircleAlert,
    Copy,
    ExternalLink,
    LoaderCircle,
    ShieldCheck,
    Trash2,
    X
} from "lucide-react";
import DnsRecordsTable from "./DnsRecordsTable";
import {
    formatDate,
    getDomainStatus,
    getDomainStatusTone
} from "../../routes/Domains";

function getStatusClasses(domain) {
    const tone = getDomainStatusTone(domain);

    if (tone === "success") {
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    }

    if (tone === "danger") {
        return "border-red-500/20 bg-red-500/10 text-red-300";
    }

    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
}

function getStatusIcon(domain) {
    const tone = getDomainStatusTone(domain);

    if (tone === "success") {
        return <CheckCircle2 size={14} />;
    }

    return <CircleAlert size={14} />;
}

function DomainDetailsModalContent({
    domain,
    open,
    verifying,
    onClose,
    onVerify,
    onDelete,
    onCopy
}) {
    return (
        <AnimatePresence>
            {open && domain ? (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[140] bg-black/80"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-[141] overflow-y-auto bg-[#07090d]"
                    >
                        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.10),transparent_20%),linear-gradient(180deg,#07090d_0%,#0a0d12_100%)]">
                            <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8">
                                <div className="mb-8 flex items-start justify-between gap-6">
                                    <div className="min-w-0">
                                        <div className="soft-label mb-3">Domain details</div>
                                        <h2 className="break-all text-[2.4rem] font-semibold tracking-tight text-white sm:text-[3rem]">
                                            {domain.hostname}
                                        </h2>
                                        <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">
                                            {domain?.verifiedAt
                                                ? "This domain is verified and ready to use."
                                                : "Add these DNS records in your provider, then verify once propagation completes."}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close domain details"
                                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/75 transition hover:bg-white/[0.07] hover:text-white"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="mb-8 flex flex-wrap items-center gap-3">
                                    <div
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-medium ${getStatusClasses(
                                            domain
                                        )}`}
                                    >
                                        {getStatusIcon(domain)}
                                        {getDomainStatus(domain)}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onCopy(domain.hostname, "Hostname copied")}
                                        className="btn-secondary-premium"
                                    >
                                        <Copy size={16} />
                                        Copy hostname
                                    </button>

                                    <a
                                        href={`https://${domain.hostname}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-secondary-premium"
                                    >
                                        <ExternalLink size={16} />
                                        Open domain
                                    </a>

                                    {!domain?.verifiedAt ? (
                                        <button
                                            data-tour="domain-verify-button"
                                            type="button"
                                            disabled={verifying}
                                            onClick={() => onVerify(domain)}
                                            className="btn-primary-premium disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {verifying ? (
                                                <LoaderCircle size={16} className="animate-spin" />
                                            ) : (
                                                <ShieldCheck size={16} />
                                            )}
                                            Verify DNS
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={() => onDelete(domain)}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <InfoCard
                                        label="Verification status"
                                        value={
                                            domain?.verifiedAt
                                                ? "Verified"
                                                : domain.verificationStatus || "Pending DNS"
                                        }
                                    />
                                    <InfoCard label="Created" value={formatDate(domain.createdAt)} />
                                    <InfoCard
                                        label="Last checked"
                                        value={formatDate(domain.lastCheckedAt)}
                                    />
                                    <InfoCard
                                        label="Verified at"
                                        value={formatDate(domain.verifiedAt)}
                                    />
                                </div>

                                <div className="mt-6">
                                    {!domain?.verifiedAt ? (
                                        <section className="rounded-[1.4rem] border border-amber-500/20 bg-[#2a1d10] px-5 py-4 text-sm leading-6 text-amber-100">
                                            DNS records may take time to propagate. If verification fails
                                            right after adding records, wait a little and try again.
                                        </section>
                                    ) : (
                                        <section className="rounded-[1.4rem] border border-emerald-500/20 bg-[#10271f] px-5 py-4 text-sm leading-6 text-emerald-100">
                                            This domain has been verified successfully and is ready to
                                            use.
                                        </section>
                                    )}
                                </div>

                                {!domain?.verifiedAt ? (
                                    <section className="mt-8 rounded-[1.8rem] border border-white/8 bg-[#11151d] p-6 sm:p-7">
                                        <div className="mb-6">
                                            <div className="soft-label mb-2">DNS records</div>
                                            <h3 className="text-2xl font-semibold text-white">
                                                Add these records to your DNS provider
                                            </h3>
                                            <p className="mt-2 max-w-4xl text-sm leading-6 text-white/60">
                                                Use these exact values. Some DNS providers may expect
                                                relative host names instead of full host names.
                                            </p>
                                        </div>

                                        <DnsRecordsTable
                                            records={domain.requiredDnsRecords || []}
                                            onCopy={onCopy}
                                        />
                                    </section>
                                ) : null}

                                <section data-tour="domain-dns-records" className="mt-8 rounded-[1.8rem] border border-white/8 bg-[#0f131b] p-6 sm:p-7">
                                    <div className="mb-5">
                                        <div className="soft-label mb-2">DNS tips</div>
                                        <h3 className="text-2xl font-semibold text-white">
                                            Helpful setup notes
                                        </h3>
                                    </div>

                                    <div className="grid gap-3">
                                        <TipRow>
                                            Use subdomains like <code>links.example.com</code> instead
                                            of apex domains when possible.
                                        </TipRow>

                                        <TipRow>
                                            Some providers expect host names like <code>links</code> or{" "}
                                            <code>_verify.links</code> instead of the full domain.
                                        </TipRow>

                                        <TipRow>
                                            After updating DNS, wait for propagation before clicking
                                            verify again.
                                        </TipRow>
                                    </div>
                                </section>

                                <div className="h-10" />
                            </div>
                        </div>
                    </motion.div>
                </>
            ) : null}
        </AnimatePresence>
    );
}

export default function DomainDetailsDrawer(props) {
    if (typeof document === "undefined") return null;
    return createPortal(<DomainDetailsModalContent {...props} />, document.body);
}

function InfoCard({ label, value }) {
    return (
        <div className="rounded-[1.2rem] border border-white/8 bg-[#141923] px-5 py-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                {label}
            </div>
            <div className="mt-2 text-sm font-medium leading-6 text-white">{value}</div>
        </div>
    );
}

function TipRow({ children }) {
    return (
        <div className="rounded-[1.1rem] border border-white/6 bg-[#171c25] px-4 py-4 text-sm leading-6 text-white/72">
            {children}
        </div>
    );
}