import { STATUS_MAP } from "@/lib/lps";

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || {
    label: status,
    className: "bg-slate-100 text-slate-700 border-slate-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${s.className}`}>
      {s.label}
    </span>
  );
}
