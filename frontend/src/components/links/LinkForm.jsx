import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    CalendarClock,
    Globe2,
    Hash,
    LockKeyhole,
    Plus,
    Settings2,
    Tag,
    X
} from "lucide-react";
import AppSelect from "../ui/AppSelect";
import FormField from "../ui/FormField";

function toDateTimeLocalValue(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const yyyy = date.getFullYear();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    const hh = `${date.getHours()}`.padStart(2, "0");
    const min = `${date.getMinutes()}`.padStart(2, "0");

    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function buildInitialState(initialValues) {
    return {
        target: initialValues?.target || "",
        slug: initialValues?.slug || "",
        domainId: initialValues?.domainId || "",
        expiresAt: toDateTimeLocalValue(initialValues?.expiresAt),
        clickLimit: initialValues?.clickLimit || "",
        password: "",
        utmStrip: Boolean(initialValues?.utmStrip),
        tags: Array.isArray(initialValues?.tags) ? initialValues.tags : []
    };
}

function parseTags(raw) {
    return raw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

function validateSlug(slug) {
    if (!slug) return "";
    const valid = /^[a-zA-Z0-9_-]{4,32}$/.test(slug);
    return valid
        ? ""
        : "Slug must be 4–32 characters and use only letters, numbers, underscore, or hyphen.";
}

export default function LinkForm({
    open,
    loading,
    onCancel,
    onSubmit,
    initialValues,
    workspaceId,
    domains
}) {
    const [form, setForm] = useState(buildInitialState(initialValues));
    const [tagsInput, setTagsInput] = useState((initialValues?.tags || []).join(", "));
    const [showAdvanced, setShowAdvanced] = useState(Boolean(initialValues));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm(buildInitialState(initialValues));
        setTagsInput((initialValues?.tags || []).join(", "));
        setShowAdvanced(Boolean(initialValues));
        setErrors({});
    }, [initialValues, open]);

    const slugError = useMemo(() => validateSlug(form.slug), [form.slug]);

    const domainOptions = useMemo(() => {
        const base = [{ value: "", label: "Default domain" }];
        const custom =
            Array.isArray(domains) && domains.length
                ? domains.map((domain) => ({
                    value: String(domain.id),
                    label: domain.hostname
                }))
                : [];

        return [...base, ...custom];
    }, [domains]);

    const handleChange = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const submit = async (e) => {
        e.preventDefault();

        const nextErrors = {};

        if (!form.target.trim()) {
            nextErrors.target = "Target URL is required.";
        } else {
            try {
                const url = new URL(form.target);
                if (!/^https?:$/.test(url.protocol)) {
                    nextErrors.target = "Only http and https URLs are supported.";
                }
            } catch {
                nextErrors.target = "Enter a valid target URL.";
            }
        }

        if (slugError) {
            nextErrors.slug = slugError;
        }

        if (form.clickLimit && Number(form.clickLimit) < 1) {
            nextErrors.clickLimit = "Click limit must be at least 1.";
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length) return;

        const payload = {
            workspaceId,
            target: form.target.trim(),
            slug: form.slug.trim() || undefined,
            domainId: form.domainId || undefined,
            expiresAt: form.expiresAt
                ? new Date(form.expiresAt).toISOString()
                : undefined,
            clickLimit: form.clickLimit ? Number(form.clickLimit) : undefined,
            password: form.password.trim() || undefined,
            utmStrip: Boolean(form.utmStrip),
            tags: parseTags(tagsInput)
        };

        await onSubmit(payload);
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
                        className="panel premium-scrollbar max-h-[92vh] w-full max-w-3xl overflow-auto"
                    >
                        <div className="sticky top-0 z-10 border-b border-border bg-panel/85 px-5 py-5 backdrop-blur-xl sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="soft-label mb-2">
                                        {initialValues ? "Edit Link" : "Create Link"}
                                    </div>
                                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                        {initialValues ? "Refine your short link" : "Create a new short link"}
                                    </h3>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        A cleaner form with better grouping for URL setup, branding,
                                        expiry, protection, and tagging.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="btn-ghost-premium h-10 w-10 rounded-2xl p-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
                            <section className="panel-soft p-5">
                                <div className="mb-4">
                                    <div className="soft-label mb-2">Primary Details</div>
                                    <h4 className="text-lg font-semibold text-foreground">
                                        Destination and slug
                                    </h4>
                                </div>

                                <div className="grid gap-5">
                                    <FormField
                                        label="Target URL"
                                        hint={
                                            errors.target
                                                ? errors.target
                                                : "The destination users will be redirected to."
                                        }
                                    >
                                        <input
                                            type="url"
                                            value={form.target}
                                            onChange={(e) => handleChange("target", e.target.value)}
                                            placeholder="https://example.com/landing-page"
                                            className="input-premium"
                                        />
                                        {errors.target ? (
                                            <div className="mt-2 text-sm text-danger">{errors.target}</div>
                                        ) : null}
                                    </FormField>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <FormField
                                            label="Custom slug"
                                            hint={
                                                errors.slug
                                                    ? errors.slug
                                                    : "Optional. Leave empty to auto-generate."
                                            }
                                        >
                                            <div className="relative">
                                                <Hash
                                                    size={15}
                                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                />
                                                <input
                                                    value={form.slug}
                                                    onChange={(e) => handleChange("slug", e.target.value)}
                                                    placeholder="my-campaign"
                                                    className="input-premium pl-11"
                                                />
                                            </div>
                                            {errors.slug ? (
                                                <div className="mt-2 text-sm text-danger">{errors.slug}</div>
                                            ) : null}
                                        </FormField>

                                        <FormField
                                            label="Domain"
                                            hint={
                                                Array.isArray(domains) && domains.length
                                                    ? "Choose a verified custom domain or use the default."
                                                    : "No custom domains available yet. Verified domains will appear here."
                                            }
                                        >
                                            <AppSelect
                                                value={String(form.domainId || "")}
                                                onValueChange={(value) => handleChange("domainId", value)}
                                                placeholder="Default domain"
                                                icon={Globe2}
                                                options={domainOptions}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            </section>

                            <section className="panel-soft p-5">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced((v) => !v)}
                                    className="flex w-full items-center justify-between rounded-2xl border border-border bg-white/[0.02] px-4 py-3 text-left transition hover:bg-white/[0.04]"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Settings2 size={16} />
                                            Advanced options
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Expiry, click limit, password protection, tracking behavior, and tags
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {showAdvanced ? "Hide" : "Show"}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {showAdvanced ? (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: -4 }}
                                            animate={{ opacity: 1, height: "auto", y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: -4 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-5 grid gap-5 md:grid-cols-2">
                                                <FormField
                                                    label="Expires at"
                                                    hint="After this time, the link should stop redirecting."
                                                >
                                                    <div className="relative">
                                                        <CalendarClock
                                                            size={15}
                                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                        />
                                                        <input
                                                            type="datetime-local"
                                                            value={form.expiresAt}
                                                            onChange={(e) => handleChange("expiresAt", e.target.value)}
                                                            className="input-premium pl-11"
                                                        />
                                                    </div>
                                                </FormField>

                                                <FormField
                                                    label="Click limit"
                                                    hint={
                                                        errors.clickLimit
                                                            ? errors.clickLimit
                                                            : "Stop redirecting after a specific number of visits."
                                                    }
                                                >
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={form.clickLimit}
                                                        onChange={(e) => handleChange("clickLimit", e.target.value)}
                                                        placeholder="e.g. 1000"
                                                        className="input-premium"
                                                    />
                                                    {errors.clickLimit ? (
                                                        <div className="mt-2 text-sm text-danger">
                                                            {errors.clickLimit}
                                                        </div>
                                                    ) : null}
                                                </FormField>

                                                <FormField
                                                    label="Password"
                                                    hint="Useful for private campaign or temporary access links."
                                                >
                                                    <div className="relative">
                                                        <LockKeyhole
                                                            size={15}
                                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                        />
                                                        <input
                                                            type="password"
                                                            value={form.password}
                                                            onChange={(e) => handleChange("password", e.target.value)}
                                                            placeholder={
                                                                initialValues
                                                                    ? "Leave blank to keep unchanged"
                                                                    : "Optional password protection"
                                                            }
                                                            className="input-premium pl-11"
                                                        />
                                                    </div>
                                                </FormField>

                                                <FormField
                                                    label="Tags"
                                                    hint="Comma-separated tags help grouping and analytics later."
                                                >
                                                    <div className="relative">
                                                        <Tag
                                                            size={15}
                                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                        />
                                                        <input
                                                            value={tagsInput}
                                                            onChange={(e) => setTagsInput(e.target.value)}
                                                            placeholder="marketing, april-launch, newsletter"
                                                            className="input-premium pl-11"
                                                        />
                                                    </div>
                                                </FormField>
                                            </div>

                                            <div className="mt-5 panel-muted flex items-center justify-between gap-4 px-4 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        Strip UTM parameters
                                                    </div>
                                                    <div className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        Remove tracking parameters before redirecting.
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleChange("utmStrip", !form.utmStrip)}
                                                    className={`relative h-7 w-12 rounded-full transition ${form.utmStrip ? "bg-accent" : "bg-white/[0.1]"
                                                        }`}
                                                >
                                                    <span
                                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${form.utmStrip ? "left-6" : "left-1"
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </section>

                            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs leading-5 text-muted-foreground">
                                    Workspace ID will be attached automatically. Rules-based routing
                                    can be added later as an advanced enhancement.
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <button type="button" onClick={onCancel} className="btn-secondary-premium">
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary-premium disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Plus size={16} />
                                        {loading
                                            ? initialValues
                                                ? "Saving..."
                                                : "Creating..."
                                            : initialValues
                                                ? "Save Changes"
                                                : "Create Link"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}