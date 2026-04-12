import { Copy } from "lucide-react";

export default function DnsRecordsTable({ records = [], onCopy }) {
    const copyAll = () => {
        const text = records
            .map((record) => `${record.type} | ${record.name} | ${record.value}`)
            .join("\n");

        onCopy?.(text, "All DNS records copied");
    };

    if (!records.length) {
        return (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-[#0c1016] px-4 py-12 text-center">
                <div className="text-sm font-medium text-white">
                    No DNS records available yet
                </div>
                <div className="mt-2 text-sm leading-6 text-white/55">
                    DNS records will appear here after the domain is created successfully.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0d1117]">
                <div className="overflow-x-auto">
                    <table className="min-w-[980px] w-full border-collapse">
                        <thead className="bg-[#1a202a]">
                            <tr className="text-left">
                                <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-white/45">
                                    Type
                                </th>
                                <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-white/45">
                                    Name / Host
                                </th>
                                <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-white/45">
                                    Value / Target
                                </th>
                                <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-white/45">
                                    TTL
                                </th>
                                <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-white/45">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.map((record, index) => (
                                <tr
                                    key={`${record.type}-${record.name}-${index}`}
                                    className="border-t border-white/8 align-top"
                                >
                                    <td className="px-5 py-5 text-sm font-semibold text-white">
                                        {record.type}
                                    </td>

                                    <td className="px-5 py-5 text-sm leading-6 text-white/88 break-all">
                                        {record.name}
                                    </td>

                                    <td className="px-5 py-5 text-sm leading-6 text-white/82 break-all">
                                        {record.value}
                                    </td>

                                    <td className="px-5 py-5 text-sm text-white/72">
                                        Automatic
                                    </td>

                                    <td className="px-5 py-5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onCopy?.(
                                                    `${record.type} | ${record.name} | ${record.value}`,
                                                    "DNS record copied"
                                                )
                                            }
                                            className="btn-secondary-premium"
                                        >
                                            <Copy size={16} />
                                            Copy
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={copyAll}
                    className="btn-secondary-premium"
                >
                    <Copy size={16} />
                    Copy all records
                </button>
            </div>
        </div>
    );
}