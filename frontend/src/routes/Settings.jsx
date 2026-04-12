import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  LockKeyhole,
  Mail,
  Palette,
  ShieldCheck,
  Sparkles,
  User2
} from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useUiStore } from "../store/ui.store";
import { useWsStore } from "../store/ws.store";

function SettingCard({ icon: Icon, title, description, children }) {
  return (
    <div className="panel-soft p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-accent">
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>

          {children ? <div className="mt-5">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

function RowItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const pushToast = useUiStore((s) => s.pushToast);
  const workspace = useWsStore((s) => s.current);

  const profileName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  }, [user]);

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-soft overflow-hidden"
      >
        <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.4fr_0.9fr] lg:px-6">
          <div>
            <div className="soft-label mb-2">Settings</div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Account and workspace settings
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage your account details, workspace context, and product preferences from one place.
            </p>
          </div>

          <div className="panel-muted flex items-start gap-3 p-4">
            <Sparkles size={18} className="mt-0.5 text-accent" />
            <div>
              <div className="text-sm font-medium text-foreground">
                Settings
              </div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                Theme toggles, API keys, and notification rules can be added
                cleanly here in the next phase.
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingCard
          icon={User2}
          title="Profile"
          description="Your current signed-in identity and basic account information."
        >
          <div className="space-y-3">
            <RowItem label="Display Name" value={profileName} />
            <RowItem label="Email" value={user?.email || "—"} />
            <RowItem
              label="Current Workspace"
              value={workspace?.name || "No workspace selected"}
            />
          </div>
        </SettingCard>

        <SettingCard
          icon={ShieldCheck}
          title="Security"
          description="Current authentication status and future-ready security controls."
        >
          <div className="space-y-3">
            <RowItem label="Session Status" value={user ? "Authenticated" : "Signed out"} />
            <RowItem label="Password Change" value="Planned for next backend phase" />
            <RowItem label="Multi-session Management" value="Not implemented yet" />

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  pushToast({
                    type: "success",
                    title: "Logged out",
                    description: "You have been signed out successfully."
                  });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15"
              >
                <LockKeyhole size={16} />
                Logout
              </button>
            </div>
          </div>
        </SettingCard>

        <SettingCard
          icon={Palette}
          title="Appearance"
          description="Current theme and appearance preferences."
        >
          <div className="space-y-3">
            <RowItem label="Current Theme" value="Dark workspace theme" />
            <RowItem label="Theme Toggle" value="Can be added next" />
            <RowItem label="Compact / Spacious Mode" value="Can be added next" />
          </div>
        </SettingCard>

        <SettingCard
          icon={Bell}
          title="Notifications"
          description="Manage alerts, product updates, and email preferences here."
        >
          <div className="space-y-3">
            <RowItem label="Toast Notifications" value="Enabled in-app" />
            <RowItem label="Email Alerts" value="Not implemented yet" />
            <RowItem label="Expiry Reminders" value="Good next feature candidate" />
          </div>
        </SettingCard>

        <div className="xl:col-span-2">
          <SettingCard
            icon={Mail}
            title="What we can add next"
            description="This area is ready for more account and product controls as features expand."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <RowItem label="Profile editing" value="Next phase" />
              <RowItem label="Password reset" value="Next phase" />
              <RowItem label="Theme switcher" value="Next phase" />
              <RowItem label="API keys" value="Future expansion" />
            </div>
          </SettingCard>
        </div>
      </div>
    </div>
  );
}