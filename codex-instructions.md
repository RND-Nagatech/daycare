# Instruksi Untuk Codex

Baca seluruh folder docs sebelum implementasi.

## Aturan Wajib
1. Jangan membuat data mock permanen.
2. Jangan hardcode paket daycare.
3. Jangan hardcode aktivitas.
4. Jangan hardcode biaya tambahan.
5. Jangan membuat menu Master Orang Tua terpisah di UI admin.
6. Data orang tua diinput melalui Master Anak.
7. Secara database, parent boleh dibuat collection sendiri untuk mendukung multi-anak.
8. Semua transaksi harus menyimpan snapshot master yang relevan.
9. Laporan harus memakai data transaksi nyata.
10. Dashboard harus memakai agregasi data nyata.

## Nama Collection
- tm_ untuk master
- tt_ untuk transaksi
- tp_ untuk pengaturan

## Validasi Penting
- Anak tidak boleh check in dua kali tanpa check out.
- Booking tidak boleh melebihi kapasitas.
- Paket inactive tidak boleh dipilih.
- Tagihan cancel tidak boleh dibayar.
- Pembayaran harus mengubah status tagihan.
- Paket kuota harus mengurangi sisa kuota.
- Paket expired tidak boleh digunakan.

## UI
Gunakan bahasa Indonesia pada label/menu.
Pastikan responsive untuk laptop/tablet/mobile.
