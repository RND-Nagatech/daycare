# Transaksi

Semua transaksi wajib memiliki nomor transaksi, tanggal transaksi, status, created_at, updated_at, created_by, updated_by.

# 1. Registrasi Anak
Menu: Operasional > Registrasi Anak

Field:
- no_registrasi
- tanggal_registrasi
- kode_anak
- nama_anak
- data_orang_tua_snapshot
- paket_awal_optional
- catatan
- status_registrasi

Status: draft, aktif, batal.

Aturan:
1. Registrasi boleh tanpa paket.
2. Jika memilih paket awal, sistem dapat langsung membuat pembelian paket.
3. Tidak boleh membuat anak duplikat.

# 2. Booking
Field:
- no_booking
- tanggal_booking
- kode_anak
- nama_anak
- kode_paket
- nama_paket
- tanggal_penitipan
- jam_rencana_datang
- jam_rencana_pulang
- catatan
- status_booking

Status: booking, hadir, batal, selesai.

Aturan:
1. Booking cek kapasitas tanggal penitipan.
2. Booking tidak boleh melebihi kapasitas.
3. Booking dapat dikonversi jadi check in.

# 3. Pembelian Paket
Field:
- no_pembelian
- tanggal_pembelian
- kode_anak
- nama_anak
- kode_paket
- nama_paket
- paket_snapshot
- tanggal_mulai
- tanggal_berakhir
- harga
- diskon_nominal
- diskon_persen
- subtotal
- total
- status_pembayaran
- status_paket_anak
- total_kuota
- kuota_terpakai
- sisa_kuota

Status pembayaran: unpaid, partial, paid, cancel.
Status paket anak: aktif, expired, habis, batal.

# 4. Check In
Field:
- no_checkin
- tanggal
- jam_checkin
- kode_anak
- nama_anak
- kode_paket_aktif
- nama_paket_aktif
- no_booking_optional
- diantar_oleh
- hubungan_pengantar
- kode_pengasuh_penerima
- nama_pengasuh_penerima
- kondisi_anak_datang
- suhu_tubuh_optional
- catatan
- foto_optional
- status_checkin

Aturan:
1. Anak tidak boleh check in dua kali pada hari yang sama tanpa check out.
2. Anak harus memiliki paket aktif atau memilih paket saat check in.
3. Jika dari booking, status booking menjadi hadir.

# 5. Aktivitas Harian
Field:
- no_aktivitas
- tanggal
- jam
- no_checkin
- kode_anak
- nama_anak
- kode_aktivitas
- nama_aktivitas
- kategori_aktivitas
- catatan
- jumlah_optional
- satuan_optional
- foto_optional
- kode_pengasuh
- nama_pengasuh

Aturan:
1. Anak harus sudah check in.
2. Aktivitas wajib dari Master Aktivitas.
3. Parent app hanya melihat aktivitas anak miliknya.

# 6. Check Out
Field:
- no_checkout
- tanggal
- jam_checkout
- no_checkin
- kode_anak
- nama_anak
- dijemput_oleh
- hubungan_penjemput
- kode_pengasuh_penyerah
- nama_pengasuh_penyerah
- jam_pulang_paket
- terlambat_menit
- biaya_terlambat
- biaya_tambahan
- catatan
- foto_optional
- status_checkout

# 7. Tagihan / Invoice
Field:
- no_tagihan
- tanggal_tagihan
- jatuh_tempo
- kode_anak
- nama_anak
- kode_parent
- nama_parent
- periode
- items
- subtotal
- diskon
- total
- total_bayar
- sisa_tagihan
- status_tagihan

Status: draft, open, partial, paid, cancel.
Jenis item: paket, biaya_tambahan, keterlambatan, lainnya.

# 8. Pembayaran
Field:
- no_pembayaran
- tanggal_bayar
- no_tagihan
- kode_anak
- nama_anak
- kode_parent
- nama_parent
- kode_metode
- nama_metode
- nominal_bayar
- bukti_bayar
- catatan
- status_verifikasi

Status verifikasi: pending, verified, rejected.

# 9. Catatan Kesehatan
- no_catatan
- tanggal
- kode_anak
- nama_anak
- jenis_catatan
- suhu_tubuh
- keluhan
- tindakan
- obat_diberikan
- kode_pengasuh
- nama_pengasuh
- foto_optional

# 10. Catatan Insiden
- no_insiden
- tanggal
- jam
- kode_anak
- nama_anak
- jenis_insiden
- lokasi
- kronologi
- penanganan
- perlu_follow_up
- kode_pengasuh
- nama_pengasuh
- foto_optional
- status_insiden

Status: open, follow_up, selesai.
