# Roles & Hak Akses

## Role
### Super Admin
Akses penuh.

### Admin / Owner
Mengelola master, transaksi, pembayaran, laporan, dan pengaturan.

### Staff / Pengasuh
Mengelola check in, check out, aktivitas, kesehatan, insiden. Tidak akses laporan keuangan detail.

### Parent / Orang Tua
Akses hanya data anak miliknya: aktivitas, absensi, tagihan, pembayaran, pengumuman.

## Matriks Hak Akses
| Menu | Super Admin | Admin | Staff | Parent |
|---|---|---|---|---|
| Dashboard Admin | Ya | Ya | Tidak | Tidak |
| Dashboard Staff | Ya | Ya | Ya | Tidak |
| Master Anak | Ya | Ya | Lihat terbatas | Tidak |
| Master Paket | Ya | Ya | Tidak | Tidak |
| Master Aktivitas | Ya | Ya | Tidak | Tidak |
| Check In | Ya | Ya | Ya | Tidak |
| Aktivitas Harian | Ya | Ya | Ya | Lihat |
| Check Out | Ya | Ya | Ya | Tidak |
| Tagihan | Ya | Ya | Tidak | Lihat milik sendiri |
| Pembayaran | Ya | Ya | Tidak | Upload bukti/lihat |
| Laporan | Ya | Ya | Tidak | Tidak |
| Pengaturan | Ya | Ya | Tidak | Tidak |
| User Management | Ya | Ya | Tidak | Tidak |
