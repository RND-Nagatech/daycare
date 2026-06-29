# API Contract

Base URL: /api/v1

Response standar:
```json
{ "success": true, "message": "OK", "data": {} }
```

Error standar:
```json
{ "success": false, "message": "Validation error", "errors": {} }
```

## Master API
- GET/POST /anak
- GET/PUT/DELETE /anak/:id
- GET/POST /pengasuh
- GET/PUT/DELETE /pengasuh/:id
- GET/POST /paket
- GET/PUT/DELETE /paket/:id
- GET/POST /aktivitas
- GET/PUT/DELETE /aktivitas/:id
- GET/POST /kelompok-usia
- GET/PUT/DELETE /kelompok-usia/:id
- GET/POST /ruangan
- GET/PUT/DELETE /ruangan/:id
- GET/POST /biaya-tambahan
- GET/PUT/DELETE /biaya-tambahan/:id
- GET/POST /metode-pembayaran
- GET/PUT/DELETE /metode-pembayaran/:id

## Transaction API
- GET/POST /registrasi-anak
- GET/POST /booking
- GET/PUT /booking/:id
- POST /booking/:id/cancel
- POST /booking/:id/checkin
- GET/POST /pembelian-paket
- POST /pembelian-paket/:id/bayar
- GET/POST /checkin
- GET /checkin/aktif
- POST /checkin/:id/cancel
- GET/POST /aktivitas-harian
- GET/POST /checkout
- GET/POST /tagihan
- POST /tagihan/:id/cancel
- GET/POST /pembayaran
- POST /pembayaran/:id/verify
- POST /pembayaran/:id/reject
- GET/POST /catatan-kesehatan
- GET/POST /insiden

## Dashboard API
- GET /dashboard/admin
- GET /dashboard/staff
- GET /dashboard/parent

## Report API
- GET /reports/kehadiran
- GET /reports/aktivitas
- GET /reports/pembelian-paket
- GET /reports/tagihan
- GET /reports/pembayaran
- GET /reports/pendapatan
- GET /reports/keterlambatan
- GET /reports/insiden
- GET /reports/kesehatan
- GET /reports/kapasitas
