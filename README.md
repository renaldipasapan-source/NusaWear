# Nusa Wear

Demo toko pakaian harian dengan katalog, keranjang, checkout simulasi, event, dan komunitas. Nama brand, produk, dan akun Instagram merupakan contoh; ganti dengan data toko pakaian yang sebenarnya.

## Menjalankan

Gunakan Node.js 22.13 atau lebih baru (Node.js 24 direkomendasikan):

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Saat Supabase sudah dikonfigurasi, akun pelanggan, profil, dan state belanja masing-masing akun disimpan di project Supabase milik toko.

## Menghubungkan Supabase

1. Di Supabase Dashboard, buka **SQL Editor**, pilih **New query**, lalu jalankan seluruh isi `supabase/schema.sql`. Ini membuat profil pelanggan dan penyimpanan data per akun dengan RLS.
2. Dari halaman project Supabase, salin **Project URL** dan **publishable key** (atau legacy `anon` key) dari **Project Settings → API Keys**. Jangan gunakan `service_role`/secret key di browser.
3. Salin `.env.example` menjadi `.env.local` di folder proyek. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dengan nilai project Anda. File `.env.local` tidak boleh diunggah ke GitHub.
4. Atur URL redirect konfirmasi email di **Authentication → URL Configuration**: tambahkan `http://localhost:5173/**` saat pengembangan dan URL domain produksi setelah hosting.
5. Jalankan ulang `npm run dev`, lalu uji pendaftaran menggunakan email milik Anda. Jika konfirmasi email aktif, buka tautan di email dahulu sebelum login.

Pemilik project dapat melihat akun di **Authentication → Users**, profil di **Table Editor → profiles**, dan data tiap akun di **Table Editor → customer_data**. RLS membatasi pengguna agar hanya bisa membaca/mengubah baris miliknya sendiri; pemilik project mengelola seluruh data lewat dashboard Supabase.

## Hosting untuk dibagikan

1. Push proyek ke GitHub. Jangan commit `.env.local`, secret key, atau database lama.
2. Impor repository di **Vercel** sebagai project Vite; build command `npm run build`, output directory `dist`.
3. Di Vercel **Settings → Environment Variables**, tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` memakai nilai yang sama dengan `.env.local`; lalu redeploy.
4. Tambahkan domain Vercel di Supabase **Authentication → URL Configuration** sebagai Site URL dan allowed redirect URL. Bagikan URL deploy kepada teman.

URL/key publishable memang digunakan aplikasi browser; keamanan database bergantung pada RLS di `supabase/schema.sql`. Jangan pernah memasukkan `service_role`/secret key ke variabel `VITE_*`, frontend, atau GitHub.

## Fitur

- Katalog dan detail produk dapat dilihat tanpa akun; wishlist, keranjang, checkout, profil, dan riwayat pesanan memerlukan akun Supabase.
- Event komunitas mendukung RSVP untuk pengguna yang masuk.
- Komunitas menyediakan feed inspirasi, tombol suka, dan formulir berbagi cerita untuk pengguna yang masuk.
- Profil dan state belanja tersimpan di Supabase per akun dan dapat dikelola pemilik toko di Supabase Dashboard.

Gambar katalog disimpan di `public/images/` dan bersumber dari Unsplash. Gambar-gambar tersebut adalah foto stok, bukan salinan dari Pinterest; periksa lisensi dan ketentuan penggunaan sebelum menerbitkan toko. Pembayaran masih simulasi dan konfirmasi pesanan dilakukan manual. Data event dan komunitas masih mengikuti state akun masing-masing; interaksi tersebut belum berupa feed bersama lintas akun.

## Kontak contoh

- Service center: `muhammadfahri0627@gmail.com`
- WhatsApp dummy: `+62 812-3456-7890` (`6281234567890` di tautan WhatsApp)
- Instagram contoh: `@nusawear.id`

Ganti nomor WhatsApp dummy dan akun Instagram dengan kontak toko sebelum situs dipublikasikan.
