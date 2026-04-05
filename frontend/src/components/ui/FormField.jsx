export default function FormField({ label, hint, children, className = "" }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label ? (
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    {label}
                </label>
            ) : null}

            {children}

            {hint ? <p className="text-xs text-white/40">{hint}</p> : null}
        </div>
    );
}