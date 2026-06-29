# Laporan

Semua laporan harus punya filter periode tanggal. Jika relevan, tambahkan filter anak, kelompok usia, ruangan, paket, status, dan export Excel/PDF.

# 1. Laporan Kehadiran Anak
Sumber: Check In, Check Out.
Kolom: Tanggal, Kode Anak, Nama Anak, Kelompok Usia, Ruangan, Jam Check In, Jam Check Out, Durasi Penitipan, Status, Pengantar, Penjemput, Pengasuh.
Ringkasan: Total hadir, izin, sakit, belum dijemput, rata-rata jam datang, rata-rata jam pulang.

# 2. Laporan Aktivitas Anak
Sumber: Aktivitas Harian.
Kolom: Tanggal, Jam, Kode Anak, Nama Anak, Aktivitas, Kategori, Catatan, Pengasuh, Foto.
Ringkasan: Total aktivitas, aktivitas terbanyak, anak dengan catatan khusus.

# 3. Laporan Pembelian Paket
Sumber: Pembelian Paket.
Kolom: Tanggal Pembelian, No Pembelian, Anak, Paket, Jenis Paket, Tanggal Mulai, Tanggal Berakhir, Total Kuota, Sisa Kuota, Harga, Diskon, Total, Status Pembayaran, Status Paket.
Ringkasan: Total paket terjual, paket paling banyak dibeli, total nilai paket.

# 4. Laporan Tagihan
Sumber: Tagihan.
Kolom: Tanggal Tagihan, No Tagihan, Jatuh Tempo, Anak, Parent, Periode, Total, Total Bayar, Sisa Tagihan, Status.
Ringkasan: Total tagihan, paid, partial, open, piutang.

# 5. Laporan Pembayaran
Sumber: Pembayaran.
Kolom: Tanggal Bayar, No Pembayaran, No Tagihan, Anak, Parent, Metode, Nominal, Status Verifikasi.
Ringkasan: Total pembayaran, cash, transfer, QRIS, pending, rejected.

# 6. Laporan Pendapatan
Sumber: Pembayaran verified dan tagihan paid/partial.
Kolom: Tanggal, Jenis Pendapatan, Referensi, Anak, Paket/Biaya, Metode, Nominal.
Jenis: Paket, Biaya Tambahan, Keterlambatan, Lainnya.
Ringkasan: Pendapatan harian, bulanan, per paket, per metode.

# 7. Laporan Keterlambatan Penjemputan
Sumber: Check Out.
Kolom: Tanggal, Anak, Paket, Jam Seharusnya Pulang, Jam Check Out, Terlambat Menit, Biaya Terlambat, Penjemput.
Ringkasan: Total kasus, total biaya, anak paling sering terlambat.

# 8. Laporan Insiden
Sumber: Catatan Insiden.
Kolom: Tanggal, Jam, Anak, Jenis Insiden, Lokasi, Kronologi, Penanganan, Pengasuh, Status.
Ringkasan: Total insiden, open, selesai, jenis terbanyak.

# 9. Laporan Kesehatan
Sumber: Catatan Kesehatan dan Aktivitas kategori kesehatan/obat.
Kolom: Tanggal, Anak, Jenis Catatan, Suhu Tubuh, Keluhan, Obat, Tindakan, Pengasuh.

# 10. Laporan Kapasitas / Okupansi
Sumber: Booking, Check In, Master Ruangan, Master Kelompok Usia.
Kolom: Tanggal, Kapasitas Total, Booking, Check In, Sisa Kapasitas, Persentase Okupansi.
Ringkasan: Rata-rata okupansi, hari paling penuh, hari paling sepi.
