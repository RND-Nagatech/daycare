# Daycare Management System - Dokumentasi Project

## Tujuan Sistem
Sistem manajemen operasional daycare yang fleksibel untuk paket harian, mingguan, bulanan, kuota, maupun custom.

## Prinsip Utama
1. Sistem tidak boleh menganggap daycare selalu seperti sekolah bulanan.
2. Sistem harus fleksibel untuk anak yang datang 1 hari maupun langganan bulanan.
3. Orang tua/wali tidak dibuat sebagai menu terpisah di UI.
4. Data orang tua/wali diinput dari form Master Anak.
5. Secara database, data orang tua/wali tetap boleh dipisah agar satu orang tua dapat memiliki beberapa anak.
6. Semua transaksi harus memakai referensi master.
7. Semua aktivitas anak harus berasal dari Master Aktivitas.
8. Semua biaya tambahan harus berasal dari Master Biaya Tambahan.
9. Semua metode pembayaran harus berasal dari Master Metode Pembayaran.
10. Laporan harus mengambil data dari transaksi nyata, bukan mock data.

## Struktur Menu Utama
### Admin / Owner
- Dashboard
- Master Data
- Operasional
- Keuangan
- Komunikasi
- Laporan
- Pengaturan
- User Management

### Staff / Pengasuh
- Dashboard Staff
- Check In
- Check Out
- Aktivitas Harian
- Catatan Kesehatan
- Catatan Insiden

### Orang Tua / Parent App
- Home
- Profil Anak
- Aktivitas Anak
- Absensi
- Tagihan
- Pembayaran
- Pengumuman
- Kontak Daycare

## File Dokumentasi
- README.md
- business-flow.md
- roles.md
- dashboard.md
- master-data.md
- transactions.md
- reports.md
- database.md
- api.md
- frontend.md
- settings.md
- roadmap.md
- codex-instructions.md
