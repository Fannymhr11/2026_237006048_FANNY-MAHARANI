"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileSignature,
  Type,
  CalendarDays,
  Building2,
  UserRound,
  BadgeCheck,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";

export default function TambahLpsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nomor_lps: "",
    perihal: "",
    tanggal_cetak: new Date().toISOString().slice(0, 10),
    bagian_tujuan: "",
    nama_pemohon: "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("lps_records").insert({
      ...form,
      status: "baru_dicetak",
    });

    setLoading(false);

    if (error) {
      showToast("Gagal menyimpan LPS: " + error.message, "error");
      return;
    }

    showToast("LPS berhasil disimpan.");
    router.push("/data-lps");
  }

  return (
    <div className="pt-4 md:pt-2 max-w-3xl mx-auto lg:mx-0">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/data-lps"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-3 transition"
        >
          <ArrowLeft size={14} /> Kembali ke Data LPS
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-navy-800 dark:bg-amber-500/15 text-white dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileSignature size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Tambah LPS</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Catat Lembar Pengantar Surat baru ke dalam sistem.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
        {/* Nomor LPS + Perihal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              <FileSignature size={14} className="text-slate-400" />
              Nomor LPS
            </label>
            <input
              type="text"
              required
              placeholder="001/LPS/VIII/2026"
              value={form.nomor_lps}
              onChange={(e) => update("nomor_lps", e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              <Type size={14} className="text-slate-400" />
              Perihal
            </label>
            <input
              type="text"
              required
              placeholder="Perihal surat"
              value={form.perihal}
              onChange={(e) => update("perihal", e.target.value)}
              className="input-base"
            />
          </div>
        </div>

        {/* Tanggal + Tujuan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              <CalendarDays size={14} className="text-slate-400" />
              Tanggal Cetak
            </label>
            <input
              type="date"
              required
              value={form.tanggal_cetak}
              onChange={(e) => update("tanggal_cetak", e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              <Building2 size={14} className="text-slate-400" />
              Bagian Tujuan
            </label>
            <select
              required
              value={form.bagian_tujuan}
              onChange={(e) => update("bagian_tujuan", e.target.value)}
              className="input-base"
            >
              <option value="" disabled>
                Pilih tujuan
              </option>
              <option value="kepala_layanan">Services & Membership Section Head</option>
              <option value="hc_ga">HC & GA Section Head</option>
            </select>
          </div>
        </div>

        {/* Nama pemohon */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <UserRound size={14} className="text-slate-400" />
            Nama Pemohon
          </label>
          <input
            type="text"
            required
            placeholder="Nama lengkap pemohon"
            value={form.nama_pemohon}
            onChange={(e) => update("nama_pemohon", e.target.value)}
            className="input-base"
          />
        </div>

        {/* Status awal */}
        <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5">
          <BadgeCheck size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status Awal</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600">
                Baru Dicetak
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Otomatis terisi saat LPS pertama kali dibuat, dapat diperbarui nanti dari halaman Data LPS.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/data-lps"
            className="w-full sm:w-auto text-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-5 py-2.5 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto btn-primary text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0"
          >
            {loading ? "Menyimpan..." : "Simpan LPS"}
          </button>
        </div>
      </form>
    </div>
  );
}