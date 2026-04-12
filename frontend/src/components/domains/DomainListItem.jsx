import { motion } from "framer-motion";
import {
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Copy,
    ExternalLink
} from "lucide-react";
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

export default function DomainListItem({
    domain,
    selected,
    onSelect,
    onCopy,
    onOpenDetails,
    dataTour
}) {
    return (
        <motion.div
            data-tour={dataTour}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[1.25rem] border p-4 transition ${selected
                ? "border-accent/40 bg-accent/10 ring-1 ring-accent/20"
                : "border-border bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.045]"
                }`}
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <button
                    type="button"
                    onClick={onSelect}
                    className="min-w-0 flex-1 text-left"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-0 break-all text-base font-semibold text-foreground">
                            {domain.hostname}
                        </div>

                        <div
                            className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                                domain
                            )}`}
                        >
                            {getStatusIcon(domain)}
                            {getDomainStatus(domain)}
                        </div>
                    </div>

                    <div className="mt-2 text-sm leading-6 text-muted-foreground">
                        {domain?.verifiedAt
                            ? "Verified and ready to use."
                            : domain?.verificationStatus || "Waiting for DNS configuration."}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>
                            Created <span className="text-foreground">{formatDate(domain.createdAt)}</span>
                        </span>
                        <span>
                            Last checked{" "}
                            <span className="text-foreground">{formatDate(domain.lastCheckedAt)}</span>
                        </span>
                        <span>
                            Verified{" "}
                            <span className="text-foreground">{formatDate(domain.verifiedAt)}</span>
                        </span>
                    </div>
                </button>

                <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => onCopy(domain.hostname, "Hostname copied")}
                        className="btn-secondary-premium"
                    >
                        <Copy size={16} />
                        Copy
                    </button>

                    <a
                        href={`https://${domain.hostname}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary-premium"
                    >
                        <ExternalLink size={16} />
                        Open
                    </a>

                    <button
                        type="button"
                        onClick={onOpenDetails}
                        className="btn-primary-premium"
                    >
                        Details
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}