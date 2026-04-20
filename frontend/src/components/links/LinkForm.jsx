import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    CalendarClock,
    Check,
    Globe2,
    Hash,
    Lightbulb,
    LockKeyhole,
    Plus,
    Settings2,
    Sparkles,
    Tag,
    X
} from "lucide-react";
import AppSelect from "../ui/AppSelect";
import FormField from "../ui/FormField";
import { getSlugSuggestions } from "../../api/links.api";

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

function styleToneClass(style) {
    switch ((style || "").toLowerCase()) {
        case "seo":
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
        case "brandable":
            return "border-violet-400/20 bg-violet-400/10 text-violet-200";
        case "technical":
            return "border-sky-400/20 bg-sky-400/10 text-sky-200";
        case "clean":
            return "border-white/10 bg-white/[0.06] text-zinc-200";
        default:
            return "border-white/10 bg-white/[0.06] text-zinc-200";
    }
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
    const [slugSuggestions, setSlugSuggestions] = useState([]);
    const [slugLoading, setSlugLoading] = useState(false);
    const [slugError, setSlugError] = useState("");

    useEffect(() => {
        setForm(buildInitialState(initialValues));
        setTagsInput((initialValues?.tags || []).join(", "));
        setShowAdvanced(Boolean(initialValues));
        setErrors({});
        setSlugSuggestions([]);
        setSlugLoading(false);
        setSlugError("");
    }, [initialValues, open]);

    const fieldSlugError = useMemo(() => validateSlug(form.slug), [form.slug]);

    const selectedSuggestion = useMemo(
        () => slugSuggestions.find((item) => item.slug === form.slug),
        [slugSuggestions, form.slug]
    );

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

        if (key === "slug") {
            setErrors((prev) => ({
                ...prev,
                slug: ""
            }));
        }
    };

    const handleSelectSuggestedSlug = (slug) => {
        handleChange("slug", slug);
        setSlugError("");
    };

    const handleSuggestSlugs = async () => {
        setSlugError("");
        setSlugSuggestions([]);

        if (!form.target.trim()) {
            setSlugError("Enter a target URL first.");
            return;
        }

        try {
            const url = new URL(form.target.trim());
            if (!/^https?:$/.test(url.protocol)) {
                setSlugError("Only http and https URLs are supported.");
                return;
            }
        } catch {
            setSlugError("Enter a valid target URL first.");
            return;
        }

        try {
            setSlugLoading(true);

            const response = await getSlugSuggestions({
                workspaceId,
                domainId: form.domainId || undefined,
                target: form.target.trim(),
                brandHint: "apurv"
            });

            const suggestions = Array.isArray(response?.suggestions)
                ? response.suggestions
                : [];

            setSlugSuggestions(suggestions);

            if (!suggestions.length) {
                setSlugError("No suggestions were generated for this URL.");
            }
        } catch (error) {
            setSlugError(
                error?.response?.data?.message ||
                    error?.message ||
                    "Could not generate slug suggestions right now."
            );
        } finally {
            setSlugLoading(false);
        }
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

        if (fieldSlugError) {
            nextErrors.slug = fieldSlugError;
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
            expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
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
                        className="panel premium-scrollbar relative isolate max-h-[92vh] w-full max-w-4xl overflow-auto"
                    >
                        <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b10]/95 px-5 py-5 backdrop-blur-2xl sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="soft-label mb-2">
                                        {initialValues ? "Edit Link" : "Create Link"}
                                    </div>
                                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                        {initialValues ? "Refine your short link" : "Create a new short link"}
                                    </h3>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Set where your link goes and shape how it looks. Use AI to generate
                                        clearer, more memorable slug options before publishing.
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

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[#0b0b10]/85" />
                        </div>

                        <form onSubmit={submit} className="space-y-6 px-5 pb-6 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                            <section className="panel-soft relative z-20 p-5">
                                <div className="mb-5">
                                    <div className="soft-label mb-2">Primary Details</div>
                                    <h4 className="text-lg font-semibold text-foreground">
                                        Destination and slug
                                    </h4>
                                </div>

                                <div className="grid gap-6">
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

                                    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
                                        <div className="space-y-4">
                                            <FormField
                                                label="Custom slug"
                                                hint={
                                                    errors.slug
                                                        ? errors.slug
                                                        : "Optional. Leave empty to auto-generate or use AI suggestions below."
                                                }
                                            >
                                                <div className="flex flex-col gap-3 lg:flex-row">
                                                    <div className="relative flex-1">
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

                                                    <button
                                                        type="button"
                                                        onClick={handleSuggestSlugs}
                                                        disabled={slugLoading}
                                                        className="btn-secondary-premium inline-flex min-w-[170px] items-center justify-center gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <Sparkles size={15} />
                                                        {slugLoading ? "Generating..." : "Suggest Slugs"}
                                                    </button>
                                                </div>

                                                {errors.slug ? (
                                                    <div className="mt-2 text-sm text-danger">{errors.slug}</div>
                                                ) : null}
                                            </FormField>

                                            {selectedSuggestion ? (
                                                <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20 text-accent">
                                                            <Check size={15} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-medium text-foreground">
                                                                Selected AI slug: {selectedSuggestion.slug}
                                                            </div>
                                                            {selectedSuggestion.reason ? (
                                                                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                                                                    {selectedSuggestion.reason}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

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

                                    {(slugError || slugSuggestions.length > 0) && (
                                        <div className="rounded-[1.5rem] border border-border bg-white/[0.025] p-4 sm:p-5">
                                            <div className="mb-4 flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                                        <Sparkles size={13} />
                                                        AI Suggestions
                                                    </div>
                                                    <div className="mt-2 text-sm text-muted-foreground">
                                                        Pick one suggestion to fill the slug automatically.
                                                    </div>
                                                </div>

                                                {slugSuggestions.length > 0 ? (
                                                    <div className="rounded-full border border-border bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground">
                                                        {slugSuggestions.length} options
                                                    </div>
                                                ) : null}
                                            </div>

                                            {slugError ? (
                                                <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                                                    {slugError}
                                                </div>
                                            ) : null}

                                            {slugSuggestions.length > 0 ? (
                                                <div className="grid gap-3">
                                                    {slugSuggestions.map((item) => {
                                                        const active = form.slug === item.slug;

                                                        return (
                                                            <button
                                                                key={item.slug}
                                                                type="button"
                                                                onClick={() => handleSelectSuggestedSlug(item.slug)}
                                                                className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
                                                                    active
                                                                        ? "border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(167,139,250,0.18)]"
                                                                        : "border-border bg-white/[0.03] hover:bg-white/[0.05]"
                                                                }`}
                                                            >
                                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                                                                    active
                                                                                        ? "border-accent bg-accent text-black"
                                                                                        : "border-white/20"
                                                                                }`}
                                                                            >
                                                                                {active ? <Check size={12} /> : null}
                                                                            </div>

                                                                            <div className="truncate text-base font-semibold text-foreground">
                                                                                {item.slug}
                                                                            </div>
                                                                        </div>

                                                                        {item.reason ? (
                                                                            <div className="mt-3 pl-7 text-sm leading-6 text-muted-foreground">
                                                                                {item.reason}
                                                                            </div>
                                                                        ) : null}
                                                                    </div>

                                                                    {item.style ? (
                                                                        <div
                                                                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${styleToneClass(
                                                                                item.style
                                                                            )}`}
                                                                        >
                                                                            {item.style}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}

                                            {slugSuggestions.length > 0 ? (
                                                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 text-sm text-muted-foreground">
                                                    <Lightbulb size={15} className="mt-0.5 shrink-0" />
                                                    Click any suggestion to use it, or keep editing the slug manually.
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="panel-soft relative z-10 p-5">
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
                                                    className={`relative h-7 w-12 rounded-full transition ${
                                                        form.utmStrip ? "bg-accent" : "bg-white/[0.1]"
                                                    }`}
                                                >
                                                    <span
                                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                                                            form.utmStrip ? "left-6" : "left-1"
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
                                    Workspace ID will be attached automatically. AI suggestions help with slug ideas,
                                    but the final slug is still validated by the backend before save.
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="btn-secondary-premium"
                                    >
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