"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Printer, Clock, CheckCircle2, ArrowUpRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTanggal, TUJUAN_MAP } from "@/lib/lps";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";

const GREETINGS = [
  { before: 5, text: "Selamat malam" },
  { before: 11, text: "Selamat pagi" },
  { before: 15, text: "Selamat siang" },
  { before: 19, text: "Selamat sore" },
  { before: 24, text: "Selamat malam" },
];

function getGreeting() {
  const hour = new Date().getHours();
  return GREETINGS.find((g) => hour < g.before)?.text ?? "Halo";
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
];

function avatarColor(name) {
  const idx = (name || "").length % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function DashboardPage() {
  const [records, setRecords] = useState(null);
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("lps_records")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        showToast("Gagal memuat data: " + error.message, "error");
        return;
      }
      setRecords(data);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = { total: 0, baru_dicetak: 0, menunggu: 0, selesai: 0 };
  (records || []).forEach((r) => {
    counts.total++;
    if (r.status === "baru_dicetak") counts.baru_dicetak++;
    else if (r.status === "selesai") counts.selesai++;
    else counts.menunggu++;
  });

  const cards = [
    {
      label: "Total LPS",
      value: counts.total,
      icon: FileText,
      grad: "from-navy-700 to-navy-900",
      iconBg: "bg-white/15 text-white",
      textColor: "text-white",
      subColor: "text-white/70",
    },
    {
      label: "Baru Dicetak",
      value: counts.baru_dicetak,
      icon: Printer,
      grad: "from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/0",
      iconBg: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-200",
      textColor: "text-slate-800 dark:text-white",
      subColor: "text-slate-500 dark:text-slate-400",
    },
    {
      label: "Menunggu TTD",
      value: counts.menunggu,
      icon: Clock,
      grad: "from-amber-50 to-amber-100/60 dark:from-amber-500/10 dark:to-amber-500/0",
      iconBg: "bg-amber-200/70 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
      textColor: "text-slate-800 dark:text-white",
      subColor: "text-slate-500 dark:text-slate-400",
    },
    {
      label: "Selesai",
      value: counts.selesai,
      icon: CheckCircle2,
      grad: "from-emerald-50 to-emerald-100/60 dark:from-emerald-500/10 dark:to-emerald-500/0",
      iconBg: "bg-emerald-200/70 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
      textColor: "text-slate-800 dark:text-white",
      subColor: "text-slate-500 dark:text-slate-400",
    },
  ];

  // Donut chart segments (CSS conic-gradient, no extra dependency needed)
  const donutStyle = useMemo(() => {
    const total = counts.total || 1;
    const segments = [
      { value: counts.selesai, color: "#10b981" },
      { value: counts.menunggu, color: "#f59e0b" },
      { value: counts.baru_dicetak, color: "#94a3b8" },
    ];
    let acc = 0;
    const stops = segments
      .map((s) => {
        const start = (acc / total) * 360;
        acc += s.value;
        const end = (acc / total) * 360;
        return `${s.color} ${start}deg ${end}deg`;
      })
      .join(", ");
    return { background: counts.total ? `conic-gradient(${stops})` : "#e2e8f0" };
  }, [counts.total, counts.selesai, counts.menunggu, counts.baru_dicetak]);

  const donutLegend = [
    { label: "Selesai", value: counts.selesai, color: "bg-emerald-500" },
    { label: "Menunggu TTD", value: counts.menunggu, color: "bg-amber-500" },
    { label: "Baru Dicetak", value: counts.baru_dicetak, color: "bg-slate-400" },
  ];

  return (
    <div className="pt-4 md:pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">
            <Sparkles size={13} />
            {getGreeting()}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ringkasan status Lembar Pengantar Surat secara real-time.
          </p>
        </div>
        <Link
          href="/tambah-lps"
          className="inline-flex items-center justify-center gap-1.5 btn-primary text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-fit"
        >
          + Tambah LPS
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${c.grad} border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.iconBg}`}>
              <c.icon size={19} />
            </div>
            <div className={`text-3xl font-bold font-display ${c.textColor}`}>
              {records === null ? (
                <span className="inline-block w-10 h-7 rounded bg-current/10 animate-pulse" />
              ) : (
                c.value
              )}
            </div>
            <div className={`text-xs font-medium mt-1 ${c.subColor}`}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Donut + recent table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Donut summary */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h2 className="font-display font-bold text-slate-800 dark:text-white text-sm self-start mb-5">
            Proporsi Status
          </h2>
          <div className="relative w-36 h-36 rounded-full" style={donutStyle}>
            <div className="absolute inset-3 rounded-full bg-white dark:bg-navy-800 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-display text-slate-800 dark:text-white">
                {counts.total}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Total LPS</span>
            </div>
          </div>
          <div className="w-full mt-6 space-y-2.5">
            {donutLegend.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                  {d.label}
                </span>
                <span className="font-semibold text-slate-800 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent table */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 dark:border-white/10">
            <h2 className="font-display font-bold text-slate-800 dark:text-white text-sm">LPS Terbaru</h2>
            <Link
              href="/data-lps"
              className="inline-flex items-center gap-1 text-xs font-semibold text-navy-800 dark:text-amber-400 hover:gap-1.5 transition-all"
            >
              Lihat semua <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full text-sm">
              <tbody>
                {records === null &&
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-white/5">
                      <td className="px-5 md:px-6 py-3.5" colSpan={4}>
                        <div className="h-4 w-full max-w-xs rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
                      </td>
                    </tr>
                  ))}
                {records && records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                      Belum ada data LPS.
                    </td>
                  </tr>
                )}
                {records &&
                  records.slice(0, 6).map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 dark:border-white/5">
                      <td className="px-5 md:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(
                              r.nama_pemohon
                            )}`}
                          >
                            {initials(r.nama_pemohon)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-700 dark:text-slate-200 truncate">
                              {r.nomor_lps}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                              {r.nama_pemohon} · {TUJUAN_MAP[r.bagian_tujuan]}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap hidden sm:table-cell">
                        {formatTanggal(r.tanggal_cetak)}
                      </td>
                      <td className="px-5 md:px-6 py-3.5 text-right">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}