# Database Design

Pola collection:
- tm_ untuk master
- tt_ untuk transaksi
- tp_ untuk pengaturan
- users untuk user login

## Master Collections
- tm_anak
- tm_parent
- tm_pengasuh
- tm_paket
- tm_aktivitas
- tm_kelompok_usia
- tm_ruangan
- tm_shift
- tm_biaya_tambahan
- tm_metode_pembayaran
- tm_pengumuman

## Transaction Collections
- tt_registrasi_anak
- tt_booking
- tt_pembelian_paket
- tt_checkin
- tt_aktivitas_harian
- tt_checkout
- tt_tagihan
- tt_pembayaran
- tt_catatan_kesehatan
- tt_insiden

## Setting Collections
- tp_profil_daycare
- tp_hari_libur
- tp_penomoran
- tp_notifikasi

## Catatan Penting
1. tm_parent tidak punya menu sendiri di UI admin.
2. tm_parent dibuat/diedit dari Master Anak.
3. tt_pembelian_paket wajib menyimpan paket_snapshot.
4. tt_tagihan.items wajib menyimpan referensi transaksi sumber.
5. tt_pembayaran wajib update tt_tagihan.
