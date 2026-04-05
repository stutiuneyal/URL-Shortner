const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8091";

export async function unlockProtectedLink(slug, password) {
    const response = await fetch(`${API_BASE}/r/${slug}/unlock`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            password,
            userAgent: navigator.userAgent,
            referer: document.referrer || "Direct"
        })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data?.error || "Failed to unlock link");
        error.status = response.status;
        throw error;
    }

    return data;
}