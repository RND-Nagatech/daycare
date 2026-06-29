# Master Data

Semua master data wajib memiliki field umum: _id, created_at, updated_at, created_by, updated_by, is_active.

Format kode disarankan:
- Anak: ANK-YYYYMMDD-001
- Pengasuh: PGS-001
- Paket: PKT-001
- Aktivitas: AKT-001
- Ruangan: RGN-001
- Biaya: BYA-001

# 1. Master Anak
## Menu
Master Data > Anak

## Field Data Anak
- kode_anak
- nama_anak
- foto_anak
- jenis_kelamin
- tempat_lahir
- tanggal_lahir
- usia
- golongan_darah
- berat_badan
- tinggi_badan
- alergi
- riwayat_penyakit
- obat_rutin
- catatan_kesehatan
- catatan_khusus
- kode_kelompok_usia
- nama_kelompok_usia
- kode_ruangan
- nama_ruangan
- status_anak

Status anak: aktif, nonaktif, calon, blacklist.

## Field Data Orang Tua / Wali
- nama_ayah
- no_hp_ayah
- pekerjaan_ayah
- email_ayah
- nama_ibu
- no_hp_ibu
- pekerjaan_ibu
- email_ibu
- nama_wali_utama
- hubungan_wali_utama
- no_hp_wali_utama
- email_wali_utama
- nama_kontak_darurat
- hubungan_kontak_darurat
- no_hp_kontak_darurat
- alamat

## Aturan
1. UI tidak memiliki menu Master Orang Tua.
2. Data orang tua tetap boleh disimpan dalam collection terpisah agar mendukung multi-anak.
3. Jika no HP/email orang tua sudah ada, sistem menawarkan menghubungkan anak ke orang tua tersebut.
4. Parent app hanya boleh melihat anak yang terhubung.

# 2. Master Pengasuh / Staff
- kode_pengasuh
- nama_pengasuh
- foto
- jenis_kelamin
- no_hp
- email
- alamat
- jabatan
- tanggal_masuk
- kode_shift
- nama_shift
- status_pengasuh

# 3. Master Paket
## Field
- kode_paket
- nama_paket
- jenis_paket
- durasi
- satuan_durasi
- harga
- jam_masuk
- jam_pulang
- toleransi_terlambat_menit
- biaya_terlambat
- aturan_biaya_terlambat
- kuota_kunjungan
- include_makan
- include_snack
- include_susu
- include_antar_jemput
- deskripsi
- status_paket

Jenis paket: harian, mingguan, bulanan, kuota, custom.
Satuan durasi: jam, hari, minggu, bulan, kunjungan.
Aturan biaya terlambat: flat, per_jam, per_30_menit, per_menit.

## Aturan
1. Semua transaksi pembelian paket wajib mengambil data dari Master Paket.
2. Jika harga paket berubah, transaksi lama tidak boleh berubah.
3. Simpan snapshot paket pada transaksi.
4. Paket inactive tidak boleh dipilih.

# 4. Master Aktivitas
- kode_aktivitas
- nama_aktivitas
- kategori_aktivitas
- icon
- perlu_jam
- perlu_catatan
- perlu_foto
- perlu_jumlah
- satuan_jumlah
- status_aktivitas

Kategori: makan, minum, tidur, belajar, bermain, toilet, kesehatan, obat, mood, lainnya.

# 5. Master Kelompok Usia
- kode_kelompok_usia
- nama_kelompok_usia
- usia_min_bulan
- usia_max_bulan
- kapasitas
- keterangan

# 6. Master Ruangan
- kode_ruangan
- nama_ruangan
- kapasitas
- lokasi
- keterangan
- status_ruangan

# 7. Master Shift
- kode_shift
- nama_shift
- jam_mulai
- jam_selesai
- keterangan
- status_shift

# 8. Master Biaya Tambahan
- kode_biaya
- nama_biaya
- kategori_biaya
- nominal
- satuan
- cara_hitung
- status_biaya

Kategori: keterlambatan, makan_tambahan, susu, popok, antar_jemput, lainnya.
Cara hitung: flat, qty, per_jam, per_menit.

# 9. Master Metode Pembayaran
- kode_metode
- nama_metode
- jenis_metode
- nama_bank
- nomor_rekening
- atas_nama
- qris_image
- instruksi_pembayaran
- status_metode

Jenis metode: cash, transfer, qris, ewallet.

# 10. Master Pengumuman
- kode_pengumuman
- judul
- isi
- tanggal_mulai
- tanggal_selesai
- target
- status_pengumuman

Target: semua, parent, staff.

# 11. Master Hari Libur
- tanggal
- nama_libur
- keterangan
- status

# 12. Master Profil Daycare
- nama_daycare
- logo
- alamat
- no_hp
- email
- website
- jam_operasional_mulai
- jam_operasional_selesai
- kapasitas_default
