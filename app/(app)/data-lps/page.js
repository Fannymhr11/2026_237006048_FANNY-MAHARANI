"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  X,
  Search,
  Table2,
  UploadCloud,
  FileCheck2,
  Download,
  CalendarDays,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTanggal, TUJUAN_MAP, STATUS_MAP, BUCKET_NAME } from "@/lib/lps";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";

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

export default function DataLpsPage() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [records, setRecords] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [editTarget, setEditTarget] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [viewPdfUrl, setViewPdfUrl] = useState(null);

  async function loadData() {
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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!records) return [];
    const s = search.toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        !s || r.nomor_lps.toLowerCase().includes(s) || r.nama_pemohon.toLowerCase().includes(s);
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [records, search, filterStatus]);

  function openEdit(record) {
    setEditTarget(record);
    setEditStatus(record.status);
    setEditFile(null);
  }

  function closeEdit() {
    setEditTarget(null);
    setEditFile(null);
  }

  async function saveEdit() {
    if (!editTarget) return;

    if (editStatus === "selesai" && !editFile && !editTarget.pdf_url) {
      showToast("Status 'Selesai' wajib disertai upload scan PDF LPS yang sudah ditandatangani.", "error");
      return;
    }

    setSavingEdit(true);
    try {
      const updatePayload = { status: editStatus };

      if (editFile) {
        const filePath = `${editTarget.nomor_lps.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, editFile, { contentType: "application/pdf", upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        updatePayload.pdf_url = publicUrlData.publicUrl;
        updatePayload.pdf_uploaded_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("lps_records")
        .update(updatePayload)
        .eq("id", editTarget.id);
      if (updateError) throw updateError;

      showToast("Status LPS berhasil diperbarui.");
      closeEdit();
      loadData();
    } catch (err) {
      showToast("Gagal menyimpan: " + err.message, "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(record) {
    if (!confirm(`Yakin ingin menghapus LPS "${record.nomor_lps}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    const { error } = await supabase.from("lps_records").delete().eq("id", record.id);
    if (error) {
      showToast("Gagal menghapus: " + error.message, "error");
      return;
    }
    showToast("LPS berhasil dihapus.");
    loadData();
  }

  function ActionButtons({ r, compact }) {
    return (
      <div className={`flex items-center gap-2 ${compact ? "" : ""}`}>
        <button
          title="Lihat PDF"
          disabled={!r.pdf_url}
          onClick={() => setViewPdfUrl(r.pdf_url)}
          className={`p-1.5 rounded-lg border transition ${
            r.pdf_url
              ? "border-navy-800 text-navy-800 dark:border-amber-400 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-white/5"
              : "border-slate-200 dark:border-white/10 text-slate-300 dark:text-slate-600 cursor-not-allowed"
          }`}
        >
          <Eye size={14} />
        </button>
        <button
          title="Edit status"
          onClick={() => openEdit(r)}
          className="p-1.5 rounded-lg border border-amber-400 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition"
        >
          <Pencil size={14} />
        </button>
        <button
          title="Hapus"
          onClick={() => handleDelete(r)}
          className="p-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="pt-4 md:pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-navy-800 dark:bg-amber-500/15 text-white dark:text-amber-400 flex items-center justify-center shrink-0">
            <Table2 size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Data LPS</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {records === null ? "Memuat data..." : `${filtered.length} dari ${records.length} LPS ditampilkan`}
            </p>
          </div>
        </div>
        <Link
          href="/tambah-lps"
          className="inline-flex items-center justify-center gap-1.5 btn-primary text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-fit"
        >
          + Tambah LPS
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor LPS / nama pemohon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-base sm:w-64"
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_MAP).map(([key, v]) => (
            <option key={key} value={key}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="data-table w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/10">
                <th className="text-left px-5 py-3 w-10">No</th>
                <th className="text-left px-5 py-3">LPS &amp; Pemohon</th>
                <th className="text-left px-5 py-3">Tanggal</th>
                <th className="text-left px-5 py-3">Tujuan</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {records === null &&
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-white/5">
                    <td className="px-5 py-3.5" colSpan={6}>
                      <div className="h-4 w-full max-w-md rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
                    </td>
                  </tr>
                ))}
              {records && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-b border-slate-50 dark:border-white/5">
                  <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500">{i + 1}</td>
                  <td className="px-5 py-3.5">
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
                          {r.nama_pemohon}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatTanggal(r.tanggal_cetak)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{TUJUAN_MAP[r.bagian_tujuan]}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ActionButtons r={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {records === null &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 h-24 animate-pulse bg-slate-50 dark:bg-white/5" />
          ))}
        {records && filtered.length === 0 && (
          <div className="card p-8 text-center text-slate-400 text-sm">Tidak ada data yang cocok.</div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
                    r.nama_pemohon
                  )}`}
                >
                  {initials(r.nama_pemohon)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                    {r.nomor_lps}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{r.nama_pemohon}</div>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} /> {formatTanggal(r.tanggal_cetak)}
              </span>
              <span className="flex items-center gap-1">
                <Building2 size={12} /> {TUJUAN_MAP[r.bagian_tujuan]}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-white/10">
              <ActionButtons r={r} compact />
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-[2px] flex items-center justify-center z-40 p-4">
          <div className="card bg-white dark:bg-navy-800 w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">Edit Status LPS</h3>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Nomor: <span className="font-semibold text-slate-700 dark:text-slate-200">{editTarget.nomor_lps}</span>
            </p>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="input-base mb-4">
              {Object.entries(STATUS_MAP).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label}
                </option>
              ))}
            </select>

            {editStatus === "selesai" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Upload Scan LPS (PDF, sudah ditandatangani)
                </label>
                <label
                  htmlFor="edit-pdf-input"
                  className="flex flex-col items-center justify-center gap-2 text-center border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl px-4 py-6 cursor-pointer hover:border-navy-800 dark:hover:border-amber-400 transition"
                >
                  {editFile ? (
                    <>
                      <FileCheck2 size={22} className="text-emerald-600" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-full">
                        {editFile.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={22} className="text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Klik untuk pilih file PDF
                      </span>
                    </>
                  )}
                  <input
                    id="edit-pdf-input"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {editTarget.pdf_url && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    PDF sudah pernah diupload sebelumnya. Upload file baru untuk menggantinya, atau biarkan kosong
                    untuk mempertahankan file lama.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="btn-primary text-sm font-semibold px-4 py-2.5 rounded-xl flex-1 disabled:opacity-60"
              >
                {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button onClick={closeEdit} className="text-sm font-medium text-slate-500 dark:text-slate-400 px-4 py-2.5">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View PDF modal */}
      {viewPdfUrl && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-[2px] flex items-center justify-center z-40 p-4">
          <div className="card bg-white dark:bg-navy-800 w-full max-w-3xl h-[85vh] p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">Detail PDF LPS</h3>
              <div className="flex items-center gap-3">
                <a
                  href={viewPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1.5 text-xs font-semibold text-navy-800 dark:text-amber-400 hover:underline"
                >
                  <Download size={14} /> Unduh
                </a>
                <button onClick={() => setViewPdfUrl(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe src={viewPdfUrl} className="flex-1 w-full rounded-lg border border-slate-200 dark:border-white/10" />
          </div>
        </div>
      )}
    </div>
  );
}