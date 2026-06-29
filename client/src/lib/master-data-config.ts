import type { MasterDataSnapshot } from "./daycare-api";

export type MasterResourceKey =
  | "pengasuh"
  | "paket"
  | "aktivitas"
  | "kelompok-usia"
  | "ruangan"
  | "shift"
  | "biaya-tambahan"
  | "metode-pembayaran"
  | "pengumuman"
  | "hari-libur";

export type MasterRecord = Record<string, string | number | boolean | undefined>;

export type MasterField = {
  key: string;
  label: string;
  type: "text" | "number" | "time" | "date" | "select" | "checkbox" | "textarea";
  options?: string[];
};

export type MasterResourceConfig = {
  key: MasterResourceKey;
  label: string;
  description: string;
  snapshotKey: keyof MasterDataSnapshot;
  idField: string;
  columns: string[];
  fields: MasterField[];
};

export const masterResourceConfigs: MasterResourceConfig[] = [
  {
    key: "pengasuh",
    label: "Pengasuh",
    description: "Data caregiver, peran, dan shift kerja.",
    snapshotKey: "caregivers",
    idField: "code",
    columns: ["code", "name", "role", "shift", "status"],
    fields: [
      { key: "code", label: "Kode", type: "text" },
      { key: "name", label: "Nama", type: "text" },
      { key: "role", label: "Peran", type: "text" },
      { key: "shift", label: "Shift", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "paket",
    label: "Paket Daycare",
    description: "Paket layanan, durasi, tarif, dan aturan overtime.",
    snapshotKey: "packages",
    idField: "code",
    columns: ["code", "name", "type", "duration", "price", "status"],
    fields: [
      { key: "code", label: "Kode", type: "text" },
      { key: "name", label: "Nama", type: "text" },
      { key: "type", label: "Tipe", type: "select", options: ["Harian", "Mingguan", "Bulanan", "Kuota", "Custom"] },
      { key: "duration", label: "Durasi", type: "number" },
      { key: "durationUnit", label: "Satuan Durasi", type: "select", options: ["Jam", "Hari", "Minggu", "Bulan", "Kunjungan"] },
      { key: "price", label: "Tarif", type: "number" },
      { key: "checkInTime", label: "Jam Masuk", type: "time" },
      { key: "checkOutTime", label: "Jam Pulang", type: "time" },
      { key: "graceMinutes", label: "Grace Period Menit", type: "number" },
      { key: "overtimeFee", label: "Biaya Overtime", type: "number" },
      { key: "visitQuota", label: "Kuota Kunjungan", type: "number" },
      { key: "includeMeal", label: "Termasuk Makan", type: "checkbox" },
      { key: "includeSnack", label: "Termasuk Snack", type: "checkbox" },
      { key: "includeMilk", label: "Termasuk Susu", type: "checkbox" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "aktivitas",
    label: "Aktivitas",
    description: "Jenis aktivitas harian yang bisa dicatat pengasuh.",
    snapshotKey: "activityTypes",
    idField: "code",
    columns: ["code", "name", "icon", "requiresPhoto", "status"],
    fields: [
      { key: "code", label: "Kode", type: "text" },
      { key: "name", label: "Nama", type: "text" },
      { key: "icon", label: "Icon", type: "text" },
      { key: "requiresTime", label: "Wajib Jam", type: "checkbox" },
      { key: "requiresNote", label: "Wajib Catatan", type: "checkbox" },
      { key: "requiresPhoto", label: "Wajib Foto", type: "checkbox" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "kelompok-usia",
    label: "Kelompok Usia",
    description: "Pengelompokan usia anak dan kapasitasnya.",
    snapshotKey: "ageGroups",
    idField: "code",
    columns: ["code", "name", "minAgeMonths", "maxAgeMonths", "capacity", "status"],
    fields: [
      { key: "code", label: "Kode", type: "text" },
      { key: "name", label: "Nama", type: "text" },
      { key: "minAgeMonths", label: "Usia Min Bulan", type: "number" },
      { key: "maxAgeMonths", label: "Usia Max Bulan", type: "number" },
      { key: "capacity", label: "Kapasitas", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "ruangan",
    label: "Ruangan",
    description: "Data ruang daycare, lokasi, dan kapasitas.",
    snapshotKey: "rooms",
    idField: "code",
    columns: ["code", "name", "location", "capacity", "status"],
    fields: [
      { key: "code", label: "Kode", type: "text" },
      { key: "name", label: "Nama", type: "text" },
      { key: "capacity", label: "Kapasitas", type: "number" },
      { key: "location", label: "Lokasi", type: "text" },
      { key: "description", label: "Deskripsi", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "shift",
    label: "Shift",
    description: "Jadwal shift operasional pengasuh.",
    snapshotKey: "shifts",
    idField: "code",
    columns: ["code", "name", "startTime", "endTime", "status"],
    fields: [
      { key: "code", label: "Kode", type: "text" },
      { key: "name", label: "Nama", type: "text" },
      { key: "startTime", label: "Mulai", type: "time" },
      { key: "endTime", label: "Selesai", type: "time" },
      { key: "description", label: "Deskripsi", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "biaya-tambahan",
    label: "Biaya Tambahan",
    description: "Biaya tambahan untuk checkout dan tagihan.",
    snapshotKey: "additionalFees",
    idField: "code",
    columns: ["code", "name", "category", "amount", "calculationMethod", "status"],
    fields: [
      { key: "code", label: "Kode", type: "text" },
      { key: "name", label: "Nama", type: "text" },
      { key: "category", label: "Kategori", type: "text" },
      { key: "amount", label: "Nominal", type: "number" },
      { key: "unit", label: "Satuan", type: "text" },
      { key: "calculationMethod", label: "Metode Hitung", type: "select", options: ["flat", "qty", "per_jam", "per_menit"] },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "metode-pembayaran",
    label: "Metode Pembayaran",
    description: "Rekening, QRIS, cash, dan instruksi pembayaran.",
    snapshotKey: "paymentMethods",
    idField: "code",
    columns: ["code", "name", "type", "account", "status"],
    fields: [
      { key: "code", label: "Kode", type: "text" },
      { key: "name", label: "Nama", type: "text" },
      { key: "type", label: "Tipe", type: "select", options: ["Transfer", "QRIS", "Cash", "E-Wallet"] },
      { key: "account", label: "Akun", type: "text" },
      { key: "bankName", label: "Bank", type: "text" },
      { key: "accountNumber", label: "Nomor Rekening", type: "text" },
      { key: "accountHolder", label: "Pemilik Rekening", type: "text" },
      { key: "instructions", label: "Instruksi", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "pengumuman",
    label: "Pengumuman",
    description: "Pengumuman untuk admin dan broadcast orang tua.",
    snapshotKey: "announcements",
    idField: "title",
    columns: ["title", "period", "status"],
    fields: [
      { key: "title", label: "Judul", type: "text" },
      { key: "content", label: "Konten", type: "textarea" },
      { key: "period", label: "Periode", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
  {
    key: "hari-libur",
    label: "Hari Libur",
    description: "Kalender libur operasional daycare.",
    snapshotKey: "holidays",
    idField: "date",
    columns: ["date", "name", "description", "status"],
    fields: [
      { key: "date", label: "Tanggal", type: "date" },
      { key: "name", label: "Nama", type: "text" },
      { key: "description", label: "Deskripsi", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] },
    ],
  },
];

export function findMasterResourceConfig(key: string) {
  return masterResourceConfigs.find((item) => item.key === key);
}
