import { motion } from "framer-motion";
import {
    Activity,
    Link2,
    MousePointerClick,
    ShieldCheck,
    TimerReset
} from "lucide-react";

function formatNumber(value) {
    return new Intl.NumberFormat("en-IN").format(value || 0);
}

function StatCard({ label, value, helper, icon: Icon }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-soft p-5"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                        {typeof value === "number" ? formatNumber(value) : value}
                    </div>
                    <div className="mt-2 text-xs leading-5 text-muted-foreground">
                        {helper}
                    </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-accent">
                    <Icon size={20} />
                </div>
            </div>
        </motion.div>
    );
}

export default function SummaryCards({ data = {} }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
                label="Total Links"
                value={data.total || 0}
                helper="All short links created in this workspace"
                icon={Link2}
            />
            <StatCard
                label="Active Links"
                value={data.active || 0}
                helper="Links currently redirecting successfully"
                icon={Activity}
            />
            <StatCard
                label="Total Clicks"
                value={data.clicks || 0}
                helper="Combined traffic across every link"
                icon={MousePointerClick}
            />
            <StatCard
                label="Expiring Soon"
                value={data.expiringSoon || 0}
                helper="Links reaching expiry within 7 days"
                icon={TimerReset}
            />
            <StatCard
                label="Protected"
                value={data.protectedLinks || 0}
                helper="Password-protected links in this workspace"
                icon={ShieldCheck}
            />
        </div>
    );
}