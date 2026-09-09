"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, BarChart3, CalendarRange, Building2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTanggal, TUJUAN_MAP, STATUS_MAP } from "@/lib/lps";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";

const STATUS_BAR_COLOR = {
  baru_dicetak: "bg-slate-400",
  menunggu_ttd_kepala_layanan: "bg-amber-500",
  menunggu_ttd_hc_ga: "bg-amber-500",
  selesai: "bg-emerald-500",
};

const TUJUAN_BAR_COLOR = {
  kepala_layanan: "bg-navy-700",
  hc_ga: "bg-amber-500",
};

export default function LaporanPage() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [records, setRecords] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({ from: "", to: "", tujuan: "" });

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("lps_records")
        .select("*")
        .order("tanggal_cetak", { ascending: false });
      if (error) {
        showToast("Gagal memuat data: " + error.message, "error");
        return;
      }
      setRecords(data);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      const matchFrom = !appliedFilter.from || r.tanggal_cetak >= appliedFilter.from;
      const matchTo = !appliedFilter.to || r.tanggal_cetak <= appliedFilter.to;
      const matchTujuan = !appliedFilter.tujuan || r.bagian_tujuan === appliedFilter.tujuan;
      return matchFrom && matchTo && matchTujuan;
    });
  }, [records, appliedFilter]);

  const counts = { total: 0, baru_dicetak: 0, menunggu: 0, selesai: 0 };
  const tujuanCounts = {};
  const statusCounts = {};
  filtered.forEach((r) => {
    counts.total++;
    if (r.status === "baru_dicetak") counts.baru_dicetak++;
    else if (r.status === "selesai") counts.selesai++;
    else counts.menunggu++;
    tujuanCounts[r.bagian_tujuan] = (tujuanCounts[r.bagian_tujuan] || 0) + 1;
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  const maxTujuan = Math.max(1, ...Object.values(tujuanCounts));
  const maxStatus = Math.max(1, ...Object.values(statusCounts));

  const cards = [
    { label: "Total LPS", value: counts.total, icon: FileText },
    { label: "Baru Dicetak", value: counts.baru_dicetak, icon: FileText },
    { label: "Menunggu TTD", value: counts.menunggu, icon: FileText },
    { label: "Selesai", value: counts.selesai, icon: FileText },
  ];

  const periodText =
    appliedFilter.from || appliedFilter.to
      ? `Periode: ${appliedFilter.from ? formatTanggal(appliedFilter.from) : "awal"} — ${
          appliedFilter.to ? formatTanggal(appliedFilter.to) : "sekarang"
        }`
      : "Periode: Seluruh data";

  function applyFilter() {
    setAppliedFilter({ from: fromDate, to: toDate, tujuan });
  }

  function resetFilter() {
    setFromDate("");
    setToDate("");
    setTujuan("");
    setAppliedFilter({ from: "", to: "", tujuan: "" });
  }

  return (
    <div className="pt-4 md:pt-2 print:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-navy-800 dark:bg-amber-500/15 text-white dark:text-amber-400 flex items-center justify-center shrink-0">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Laporan</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Rekapitulasi Lembar Pengantar Surat berdasarkan periode.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 btn-primary text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-fit"
        >
          <Printer size={15} /> Cetak / Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-end print:hidden">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Dari Tanggal</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-base w-auto" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Sampai Tanggal</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-base w-auto" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Bagian Tujuan</label>
          <select value={tujuan} onChange={(e) => setTujuan(e.target.value)} className="input-base w-auto">
            <option value="">Semua</option>
            <option value="kepala_layanan">Services & Membership Section Head</option>
            <option value="hc_ga">HC & GA Section Head</option>
          </select>
        </div>
        <button
          onClick={applyFilter}
          className="btn-amber text-sm font-semibold px-4 py-2.5 rounded-lg hover:-translate-y-0.5 transition-all"
        >
          Terapkan
        </button>
        <button onClick={resetFilter} className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2 py-2.5">
          Reset
        </button>
      </div>

      {/* Print-only header */}
      <div className="hidden print:flex items-center gap-3 mb-4">
        <img src="/logo-taspen.png" alt="" className="h-8 w-auto" />
        <div>
          <h1 className="font-display text-xl font-bold text-slate-800">Laporan Rekap LPS — PT Taspen</h1>
          <p className="text-sm text-slate-500">{periodText}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {cards.map((c, idx) => (
          <div
            key={c.label}
            className={`rounded-2xl p-4 border border-slate-200/60 dark:border-white/10 shadow-sm ${
              idx === 0
                ? "bg-gradient-to-br from-navy-700 to-navy-900 text-white"
                : "bg-white dark:bg-navy-800/40"
            }`}
          >
            <div className={`text-2xl font-bold font-display ${idx === 0 ? "text-white" : "text-slate-800 dark:text-white"}`}>
              {c.value}
            </div>
            <div className={`text-xs font-medium mt-0.5 ${idx === 0 ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recap bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card p-5">
          <h3 className="font-display font-bold text-slate-800 dark:text-white mb-4 text-sm flex items-center gap-2">
            <Building2 size={15} className="text-slate-400" /> Rekap per Bagian Tujuan
          </h3>
          <div className="space-y-4">
            {Object.entries(TUJUAN_MAP).map(([key, label]) => {
              const value = tujuanCounts[key] || 0;
              const pct = Math.round((value / maxTujuan) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300">{label}</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${TUJUAN_BAR_COLOR[key]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-bold text-slate-800 dark:text-white mb-4 text-sm flex items-center gap-2">
            <CalendarRange size={15} className="text-slate-400" /> Rekap per Status
          </h3>
          <div className="space-y-4">
            {Object.entries(STATUS_MAP).map(([key, v]) => {
              const value = statusCounts[key] || 0;
              const pct = Math.round((value / maxStatus) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300">{v.label}</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLOR[key]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 print:hidden">
          <h2 className="font-display font-bold text-slate-800 dark:text-white text-sm">Rincian Data</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/10">
                <th className="text-left px-5 py-3">No</th>
                <th className="text-left px-5 py-3">Nomor LPS</th>
                <th className="text-left px-5 py-3">Tanggal</th>
                <th className="text-left px-5 py-3">Pemohon</th>
                <th className="text-left px-5 py-3">Tujuan</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records === null && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              )}
              {records && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data pada periode ini.
                  </td>
                </tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-b border-slate-50 dark:border-white/5">
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{r.nomor_lps}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatTanggal(r.tanggal_cetak)}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{r.nama_pemohon}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{TUJUAN_MAP[r.bagian_tujuan]}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list (hidden on print) */}
      <div className="md:hidden print:hidden space-y-3">
        {records === null && <div className="card p-8 text-center text-slate-400 text-sm">Memuat data...</div>}
        {records && filtered.length === 0 && (
          <div className="card p-8 text-center text-slate-400 text-sm">Tidak ada data pada periode ini.</div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="font-semibold text-sm text-slate-800 dark:text-white">{r.nomor_lps}</div>
              <StatusBadge status={r.status} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {r.nama_pemohon} · {TUJUAN_MAP[r.bagian_tujuan]}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatTanggal(r.tanggal_cetak)}</div>
          </div>
        ))}
      </div>

      {/* Print-only simple list (keeps print output clean & compact) */}
      <div className="hidden print:block mt-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="text-left py-2">No</th>
              <th className="text-left py-2">Nomor LPS</th>
              <th className="text-left py-2">Tanggal</th>
              <th className="text-left py-2">Pemohon</th>
              <th className="text-left py-2">Tujuan</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-1.5">{i + 1}</td>
                <td className="py-1.5">{r.nomor_lps}</td>
                <td className="py-1.5">{formatTanggal(r.tanggal_cetak)}</td>
                <td className="py-1.5">{r.nama_pemohon}</td>
                <td className="py-1.5">{TUJUAN_MAP[r.bagian_tujuan]}</td>
                <td className="py-1.5">{STATUS_MAP[r.status]?.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}