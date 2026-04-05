import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useUiStore } from "../../store/ui.store";

function downloadSvg(svgElement, filename) {
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

export default function LinkQrPanel({ shortUrl, slug }) {
    const pushToast = useUiStore((s) => s.pushToast);
    const svgWrapRef = useRef(null);

    const handleDownloadSvg = () => {
        const svg = svgWrapRef.current?.querySelector("svg");
        if (!svg) return;
        downloadSvg(svg, `${slug || "link"}-qr.svg`);
    };

    return (
        <div className="panel-soft p-5">
            <div className="soft-label mb-2">Branded QR</div>
            <h4 className="text-lg font-semibold text-foreground">
                Share-ready QR asset
            </h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use this branded QR for print, presentations, campaigns, or quick sharing.
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-border bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold text-foreground">/{slug}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            Premium share card
                        </div>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-accent">
                        <ImageIcon size={18} />
                    </div>
                </div>

                <div className="rounded-[1.75rem] bg-white p-5 shadow-soft" ref={svgWrapRef}>
                    <QRCodeSVG
                        value={shortUrl}
                        size={220}
                        bgColor="#ffffff"
                        fgColor="#111214"
                        includeMargin
                    />
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-black/20 px-4 py-3 text-sm text-muted-foreground break-all">
                    {shortUrl}
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={async () => {
                        await navigator.clipboard.writeText(shortUrl);
                        pushToast({
                            type: "success",
                            title: "Short URL copied",
                            description: shortUrl
                        });
                    }}
                    className="btn-secondary-premium"
                >
                    <Copy size={16} />
                    Copy URL
                </button>

                <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="btn-secondary-premium"
                >
                    <Download size={16} />
                    Download SVG
                </button>

                <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary-premium"
                >
                    <ExternalLink size={16} />
                    Open Link
                </a>
            </div>
        </div>
    );
}