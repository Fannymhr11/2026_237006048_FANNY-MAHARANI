-- =========================================================
-- SISTEM MONITORING LEMBAR PENGANTAR SURAT (LPS) - PT TASPEN
-- Versi dengan login (Supabase Auth, 1 akun)
-- Jalankan seluruh isi file ini di Supabase SQL Editor
-- =========================================================

-- 1. Tabel utama LPS
create table if not exists public.lps_records (
  id uuid primary key default gen_random_uuid(),
  nomor_lps text not null,
  perihal text not null,
  tanggal_cetak date not null default current_date,
  bagian_tujuan text not null check (bagian_tujuan in ('kepala_layanan', 'hc_ga')),
  nama_pemohon text not null,
  status text not null default 'baru_dicetak'
    check (status in ('baru_dicetak', 'menunggu_ttd_kepala_layanan', 'menunggu_ttd_hc_ga', 'selesai')),
  pdf_url text,
  pdf_uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lps_status on public.lps_records (status);
create index if not exists idx_lps_tanggal on public.lps_records (tanggal_cetak);
create index if not exists idx_lps_nomor on public.lps_records (nomor_lps);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_lps_updated_at on public.lps_records;
create trigger trg_lps_updated_at
before update on public.lps_records
for each row execute function public.set_updated_at();

-- 2. Row Level Security — HANYA pengguna yang sudah login (authenticated)
-- yang boleh membaca/menulis data. Ini cocok dengan sistem 1-akun login
-- yang dibuat manual lewat Supabase Dashboard > Authentication > Users.
alter table public.lps_records enable row level security;

drop policy if exists "lps_select_authenticated" on public.lps_records;
create policy "lps_select_authenticated" on public.lps_records
  for select using (auth.role() = 'authenticated');

drop policy if exists "lps_insert_authenticated" on public.lps_records;
create policy "lps_insert_authenticated" on public.lps_records
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "lps_update_authenticated" on public.lps_records;
create policy "lps_update_authenticated" on public.lps_records
  for update using (auth.role() = 'authenticated');

drop policy if exists "lps_delete_authenticated" on public.lps_records;
create policy "lps_delete_authenticated" on public.lps_records
  for delete using (auth.role() = 'authenticated');

-- 3. Storage bucket untuk file PDF hasil scan LPS yang sudah ditandatangani
insert into storage.buckets (id, name, public)
values ('lps-pdf', 'lps-pdf', true)
on conflict (id) do nothing;

-- Baca file PDF tetap publik (supaya link bisa langsung dibuka di modal PDF),
-- tapi upload/ubah/hapus file hanya untuk pengguna yang sudah login.
drop policy if exists "lps_pdf_read" on storage.objects;
create policy "lps_pdf_read" on storage.objects
  for select using (bucket_id = 'lps-pdf');

drop policy if exists "lps_pdf_insert" on storage.objects;
create policy "lps_pdf_insert" on storage.objects
  for insert with check (bucket_id = 'lps-pdf' and auth.role() = 'authenticated');

drop policy if exists "lps_pdf_update" on storage.objects;
create policy "lps_pdf_update" on storage.objects
  for update using (bucket_id = 'lps-pdf' and auth.role() = 'authenticated');

drop policy if exists "lps_pdf_delete" on storage.objects;
create policy "lps_pdf_delete" on storage.objects
  for delete using (bucket_id = 'lps-pdf' and auth.role() = 'authenticated');

-- =========================================================
-- LANGKAH TAMBAHAN (tidak lewat SQL, lewat Dashboard):
-- 1. Authentication > Users > Add user  → buat 1 akun login (email + password)
-- 2. Authentication > Providers (Email) → matikan "Allow new users to sign up"
--    supaya tidak ada orang lain yang bisa mendaftar sendiri.
-- =========================================================