# Business Flow

## Alur Umum
```text
Master Data -> Registrasi/Input Anak -> Pembelian Paket/Booking -> Check In -> Aktivitas Harian -> Check Out -> Biaya Tambahan -> Tagihan -> Pembayaran -> Laporan
```

## Alur Anak Baru
1. Admin membuka Master Anak.
2. Admin input data anak.
3. Admin input data orang tua/wali di form yang sama.
4. Admin pilih kelompok usia dan ruangan jika diperlukan.
5. Admin simpan data anak.
6. Anak dapat langsung membeli paket atau dibuatkan booking.

## Alur Paket Harian
1. Anak dipilih.
2. Admin/staff memilih paket harian dari Master Paket.
3. Sistem membuat transaksi pembelian paket.
4. Anak check in.
5. Pengasuh input aktivitas harian.
6. Anak check out.
7. Sistem menghitung keterlambatan jika ada.
8. Sistem membuat tagihan.
9. Admin/orang tua melakukan pembayaran.
10. Status pembayaran menjadi lunas.

## Alur Paket Bulanan
1. Anak membeli paket bulanan.
2. Sistem menyimpan masa aktif paket.
3. Setiap kedatangan tetap check in dan check out.
4. Sistem tidak menagih ulang per hari selama paket masih aktif.
5. Tagihan dibuat dari pembelian paket atau periode billing.
6. Jika paket habis, status menjadi expired/perlu perpanjangan.

## Alur Paket Kuota
1. Anak membeli paket kuota.
2. Sistem menyimpan total kuota.
3. Setiap kedatangan mengurangi sisa kuota.
4. Jika kuota habis, paket tidak bisa digunakan.

## Alur Booking
Status booking: booking, hadir, batal, selesai.
1. Admin/orang tua membuat booking.
2. Sistem cek kapasitas tanggal penitipan.
3. Saat hari H, staff check in dari booking.
4. Setelah checkout, status menjadi selesai.

## Status Tagihan
- draft
- open
- partial
- paid
- cancel
