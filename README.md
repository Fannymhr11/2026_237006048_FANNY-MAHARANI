# Sistem Monitoring Lembar Pengantar Surat (LPS) — PT Taspen

Versi **Next.js + React**, responsif (mobile & desktop), dark/light mode,
dan login 1 akun. Backend tetap **Supabase** (Postgres + Storage + Auth).

## Fitur yang ditambahkan dari versi sebelumnya

- ✅ Login wajib sebelum bisa akses aplikasi (Supabase Auth)
- ✅ Hanya 1 akun yang dibuat manual (tidak ada pendaftaran publik)
- ✅ Dark mode / Light mode (tombol di pojok kanan atas)
- ✅ Tampilan responsif: sidebar di desktop, menu drawer di mobile
- ✅ Slot logo — tinggal taruh file logo resmi PT Taspen Anda

## Struktur folder penting

```
lps-taspen-next/
├── app/
│   ├── login/page.js          # Halaman login
│   └── (app)/                 # Semua halaman yang butuh login
│       ├── layout.js
│       ├── page.js            # Dashboard
│       ├── tambah-lps/page.js
│       ├── data-lps/page.js
│       └── laporan/page.js
├── components/                # Sidebar, ThemeToggle, Logo, dll
├── lib/supabase/               # Koneksi Supabase (browser, server, middleware)
├── middleware.js               # Proteksi login di semua halaman
├── sql/schema.sql               # Skema database (WAJIB dijalankan di Supabase)
└── .env.local.example            # Contoh konfigurasi environment
```

## Langkah setup dari nol

### 1. Install Node.js (kalau belum ada)
Download di https://nodejs.org (pilih versi **LTS**). Cek sudah terinstall
dengan buka Terminal VSCode lalu ketik:
```bash
node -v
```

### 2. Buka folder project di VSCode
**File → Open Folder** → pilih folder `lps-taspen-next` hasil extract.

### 3. Install semua dependency
Buka Terminal VSCode (`` Ctrl+` ``), lalu jalankan:
```bash
npm install
```
Tunggu sampai selesai (butuh koneksi internet, biasanya 1-3 menit).

### 4. Jalankan schema.sql di Supabase
1. Buka project Supabase Anda → **SQL Editor** → **New query**.
2. Copy seluruh isi `sql/schema.sql`, paste, klik **Run**.
3. Ini akan membuat tabel `lps_records`, storage bucket `lps-pdf`, dan
   aturan keamanan yang **mewajibkan login** untuk baca/tulis data.

### 5. Buat 1 akun login (di Supabase Dashboard)
1. Menu **Authentication → Users → Add user → Create new user**.
2. Isi email & password, centang **Auto Confirm User**, klik **Create user**.
3. Lalu ke **Authentication → Providers (Email)** → matikan
   **"Allow new users to sign up"** supaya tidak ada pendaftaran publik.

### 6. Isi environment variable
1. Duplikat file `.env.local.example` → ganti nama jadi `.env.local`.
2. Isi dengan URL dan Anon/Publishable key dari
   **Supabase Dashboard → Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
   ```

### 7. Tambahkan logo PT Taspen (opsional, bisa menyusul)
Taruh file logo resmi di:
```
public/logo-taspen.png
```
(format PNG/SVG persegi, latar transparan disarankan, mis. 128×128px).
Selama file ini belum ada, aplikasi otomatis menampilkan placeholder "PT"
supaya tampilan tetap rapi — tidak akan error.

### 8. Jalankan aplikasi
Di Terminal VSCode:
```bash
npm run dev
```
Setelah muncul tulisan `Ready`, buka browser ke:
```
http://localhost:3000
```
Akan otomatis diarahkan ke halaman **Login**. Masuk pakai akun yang dibuat
di langkah 5.

## Menjalankan lagi di lain waktu
Setiap kali mau pakai lagi, cukup buka folder project di VSCode lalu:
```bash
npm run dev
```
(tidak perlu `npm install` lagi kecuali ada dependency baru).

## Deploy supaya bisa diakses tim (bukan cuma di laptop Anda)
Cara termudah: **Vercel** (pembuat Next.js, gratis untuk pemakaian seperti ini).
1. Push folder ini ke GitHub (bisa lewat VSCode: Source Control → Publish).
2. Buka https://vercel.com → **Add New Project** → pilih repo GitHub tadi.
3. Saat diminta **Environment Variables**, isi `NEXT_PUBLIC_SUPABASE_URL`
   dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sama seperti di `.env.local`.
4. Klik **Deploy** → selesai, dapat link seperti `https://lps-taspen.vercel.app`.

## Alur status LPS (sama seperti sebelumnya)

1. **Baru Dicetak** — otomatis saat LPS pertama dibuat.
2. **Menunggu TTD Kepala Layanan** / **Menunggu TTD HC & GA** — diubah manual
   lewat tombol Edit di halaman Data LPS.
3. **Selesai** — wajib upload scan PDF LPS yang sudah ditandatangani saat
   mengubah ke status ini.

## Troubleshooting umum

- **`npm install` error / lambat** → pastikan koneksi internet stabil, coba
  ulangi. Kalau masih gagal, kirim pesan errornya, saya bantu cek.
- **Muncul "Invalid API key"** → cek ulang isi `.env.local`, pastikan tidak
  ada spasi/tanda kutip tambahan.
- **Tidak bisa login** → pastikan akun sudah dibuat & "Auto Confirm User"
  dicentang saat membuatnya di Supabase Dashboard.
- **Upload PDF gagal** → cek bucket `lps-pdf` sudah ada di Supabase Storage,
  dan file `schema.sql` sudah dijalankan sampai selesai.
