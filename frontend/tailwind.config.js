/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                panel: "hsl(var(--panel))",
                "panel-2": "hsl(var(--panel-2))",
                border: "hsl(var(--border))",
                muted: "hsl(var(--muted))",
                "muted-foreground": "hsl(var(--muted-foreground))",
                accent: "hsl(var(--accent))",
                "accent-foreground": "hsl(var(--accent-foreground))",
                ring: "hsl(var(--ring))",
                success: "hsl(var(--success))",
                warning: "hsl(var(--warning))",
                danger: "hsl(var(--danger))"
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
                "3xl": "1.75rem"
            },
            boxShadow: {
                premium: "0 10px 40px rgba(0,0,0,0.32)",
                soft: "0 6px 20px rgba(0,0,0,0.2)",
                insetLine: "inset 0 1px 0 rgba(255,255,255,0.04)"
            },
            backgroundImage: {
                "premium-grid":
                    "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)"
            }
        }
    },
    plugins: []
}