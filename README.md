# Nusa Wear

Demo toko pakaian harian dengan katalog, keranjang, checkout simulasi, event, dan komunitas. Nama brand, produk, dan akun Instagram merupakan contoh; ganti dengan data toko pakaian yang sebenarnya.

## Menjalankan

Gunakan Node.js 22.13 atau lebih baru (Node.js 24 direkomendasikan):

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Saat Supabase sudah dikonfigurasi, profil dan state belanja pelanggan disimpan per akun, sedangkan katalog, event, pesanan, dan status persetujuan pesanan menggunakan tabel toko bersama.

## Menghubungkan Supabase

1. Di Supabase Dashboard, buka **SQL Editor**, pilih **New query**, lalu jalankan seluruh isi `supabase/schema.sql`. Ini membuat profil, penyimpanan data pelanggan, permintaan reset kata sandi, serta tabel bersama untuk produk, event, admin, dan pesanan dengan RLS.
2. Dari halaman project Supabase, salin **Project URL** dan **publishable key** (atau legacy `anon` key) dari **Project Settings → API Keys**. Jangan gunakan `service_role`/secret key di browser.
3. Salin `.env.example` menjadi `.env.local` di folder proyek. Isi `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` dengan nilai project Anda. Service role key hanya dipakai server admin; jangan pernah mengganti namanya menjadi `VITE_*` atau memasukkannya ke browser. File `.env.local` tidak boleh diunggah ke GitHub.
4. Atur URL redirect konfirmasi email dan reset kata sandi di **Authentication → URL Configuration**: tambahkan `http://localhost:5173/**` saat pengembangan dan URL domain produksi setelah hosting. Redirect reset menggunakan path `/atur-ulang-password`, yang harus termasuk dalam allowed redirect URL.
5. Untuk fitur pengelolaan akun admin, tambahkan `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` sebagai environment variables server di Vercel. Jangan gunakan awalan `VITE_` untuk service role key.
6. Jadikan akun toko sebagai admin setelah akun tersebut terdaftar dan terkonfirmasi. Di **SQL Editor**, ganti email contoh berikut dengan email akun toko lalu jalankan:

   ```sql
   insert into public.store_admins (user_id)
   select id from auth.users where email = 'admin@tokoanda.com'
   on conflict (user_id) do nothing;
   ```

   Setelah itu, keluar lalu masuk kembali. Tautan **Kelola toko** akan muncul di navigasi. Jangan pernah memberi akses admin kepada akun pelanggan.

7. Jalankan ulang `npm run dev`, lalu uji pendaftaran menggunakan email milik Anda. Jika konfirmasi email aktif, buka tautan di email dahulu sebelum login.

Pemilik project dapat melihat akun di **Authentication → Users**, profil di **Table Editor → profiles**, data per akun di **Table Editor → customer_data**, serta data bersama di tabel `store_products`, `store_events`, dan `store_orders`. RLS membatasi pelanggan agar hanya bisa melihat pesanan miliknya; hanya admin yang terdaftar melalui SQL dapat melihat semua pesanan dan mengelola katalog/event.

## Hosting untuk dibagikan

1. Push proyek ke GitHub. Jangan commit `.env.local`, secret key, atau database lama.
2. Impor repository di **Vercel** sebagai project Vite; build command `npm run build`, output directory `dist`.
3. Di Vercel **Settings → Environment Variables**, tambahkan `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY`; service role key harus berupa environment variable server tanpa awalan `VITE_`. Lalu redeploy.
4. Tambahkan domain Vercel di Supabase **Authentication → URL Configuration** sebagai Site URL dan allowed redirect URL. Bagikan URL deploy kepada teman.

URL/key publishable memang digunakan aplikasi browser; keamanan database bergantung pada RLS di `supabase/schema.sql`. Jangan pernah memasukkan `service_role`/secret key ke variabel `VITE_*`, frontend, atau GitHub.

## Fitur

- Katalog dan detail produk dapat dilihat tanpa akun; wishlist, keranjang, checkout, profil, dan riwayat pesanan memerlukan akun Supabase.
- Panel `/admin` berisi laporan produk terlaris dan pesanan, alur status pesanan (menunggu persetujuan → disetujui → dikemas → dikirim → selesai), pemantauan jumlah pengguna beserta status online/offline, pengeditan nama/email pengguna, penghapusan transaksi dan akun secara permanen, serta persetujuan permintaan reset kata sandi. Perubahan email meminta konfirmasi pengguna; penghapusan akun turut menghapus data database dan file unggahan akun. Status online adalah perkiraan dari aktivitas akun dalam dua menit terakhir.
- Form admin untuk produk, event, dan cerita komunitas menerima unggahan gambar langsung dari perangkat; file JPG, PNG, atau WebP hingga 5 MB disimpan di Supabase Storage.
- Setiap event memiliki halaman detail, susunan acara, informasi lokasi/waktu, dan pendaftaran RSVP. Pengguna yang masuk mendapat tiket QR unik yang tersimpan di data akunnya dan dapat dicetak.
- Cerita komunitas dibagikan lintas pengguna melalui Supabase dan dipecah menjadi ruang Outfit harian, Mix & match, Brand lokal, Gaya berkelanjutan, dan Event Nusa; semua orang dapat melihat feed, sedangkan pengguna yang masuk dapat memposting cerita, mengunggah foto opsional, dan menyukai cerita.
- Pembeli dengan pesanan yang telah disetujui dapat mengirim satu ulasan per produk berupa rating, komentar, dan foto opsional. Foto ulasan menggunakan bucket `community-images`.
- Profil dan state belanja tersimpan di Supabase per akun. Katalog/event bersama dan pesanan menunggu persetujuan admin tersimpan di tabel toko dengan kebijakan RLS.
- Pengguna dapat mengajukan lupa/ganti kata sandi dari halaman masuk atau akun. Admin meninjau permintaan dan mengirim tautan reset Supabase setelah menyetujui; kata sandi tidak dapat dilihat atau diedit langsung oleh admin.

Jalankan kembali seluruh isi `supabase/schema.sql` di Supabase SQL Editor untuk membuat feed bersama, ruang kategori, ulasan produk, pemantauan aktivitas, antrean persetujuan reset kata sandi, dan bucket `community-images`. Jika perubahan skema belum diterapkan, fitur penghapusan transaksi dan persetujuan reset tidak akan tersedia. Foto cerita dan ulasan menerima JPG, PNG, atau WebP hingga 5 MB; tanpa foto cerita, aplikasi memakai `public/images/community-style.jpg`. Gambar katalog disimpan di `public/images/` dan bersumber dari Unsplash. Gambar-gambar tersebut adalah foto stok, bukan salinan dari Pinterest; periksa lisensi dan ketentuan penggunaan sebelum menerbitkan toko. Pembayaran masih simulasi dan konfirmasi pesanan dilakukan manual. RSVP dan tiket QR event disimpan pada data akun Supabase yang dilindungi RLS. QR berisi kode tiket unik agar dapat dibaca pemindai QR; aplikasi belum menyediakan halaman panitia untuk memvalidasi check-in secara otoritatif. Sebelum dipakai untuk acara berbayar atau check-in resmi, tambahkan endpoint/backend dan akses panitia agar tiket tidak dapat dipalsukan atau dipakai ulang.

## Kontak contoh

- Service center: `muhammadfahri0627@gmail.com`
- WhatsApp dummy: `+62 812-3456-7890` (`6281234567890` di tautan WhatsApp)
- Instagram contoh: `@nusawear.id`

Ganti nomor WhatsApp dummy dan akun Instagram dengan kontak toko sebelum situs dipublikasikan.
