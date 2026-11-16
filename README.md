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
- Setiap event memiliki halaman detail, susunan acara, informasi lokasi/waktu, dan pendaftaran RSVP. Pengguna yang masuk mendapat tiket QR unik yang tersimpan di data akunnya dan dapat dicetak.
- Cerita komunitas dibagikan lintas pengguna melalui Supabase dan dipecah menjadi ruang Outfit harian, Mix & match, Brand lokal, Gaya berkelanjutan, dan Event Nusa; semua orang dapat melihat feed, sedangkan pengguna yang masuk dapat memposting cerita, mengunggah foto opsional, dan menyukai cerita.
- Profil dan state belanja tersimpan di Supabase per akun dan dapat dikelola pemilik toko di Supabase Dashboard.

Jalankan kembali seluruh isi `supabase/schema.sql` di Supabase SQL Editor untuk membuat feed bersama, ruang kategori, dan bucket `community-images`. Jika unggahan cerita gagal karena tabel atau bucket belum tersedia, jalankan kembali schema tersebut, lalu gunakan tombol **Muat ulang cerita**. Foto cerita menerima JPG, PNG, atau WebP hingga 5 MB; tanpa foto, aplikasi memakai `public/images/community-style.jpg`. Gambar katalog disimpan di `public/images/` dan bersumber dari Unsplash. Gambar-gambar tersebut adalah foto stok, bukan salinan dari Pinterest; periksa lisensi dan ketentuan penggunaan sebelum menerbitkan toko. Pembayaran masih simulasi dan konfirmasi pesanan dilakukan manual. RSVP dan tiket QR event disimpan pada data akun Supabase yang dilindungi RLS. QR berisi kode tiket unik agar dapat dibaca pemindai QR; aplikasi belum menyediakan halaman panitia untuk memvalidasi check-in secara otoritatif. Sebelum dipakai untuk acara berbayar atau check-in resmi, tambahkan endpoint/backend dan akses panitia agar tiket tidak dapat dipalsukan atau dipakai ulang.

## Kontak contoh

- Service center: `muhammadfahri0627@gmail.com`
- WhatsApp dummy: `+62 812-3456-7890` (`6281234567890` di tautan WhatsApp)
- Instagram contoh: `@nusawear.id`

Ganti nomor WhatsApp dummy dan akun Instagram dengan kontak toko sebelum situs dipublikasikan.
