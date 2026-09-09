export const BUCKET_NAME = "lps-pdf";

export const STATUS_MAP = {
  baru_dicetak: {
    label: "Baru Dicetak",
    className:
      "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
  },
  menunggu_ttd_kepala_layanan: {
    label: "Menunggu TTD Services & Membership Section Head",
    className:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40",
  },
  menunggu_ttd_hc_ga: {
    label: "Menunggu TTD HC & GA Section Head",
    className:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40",
  },
  selesai: {
    label: "Selesai",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40",
  },
};

export const TUJUAN_MAP = {
  kepala_layanan: "Services & Membership Section Head",
  hc_ga: "HC & GA Section Head",
};

export function formatTanggal(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export function statusMenungguFor(tujuan) {
  return tujuan === "kepala_layanan" ? "menunggu_ttd_kepala_layanan" : "menunggu_ttd_hc_ga";
}