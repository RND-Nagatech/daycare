import type {
  Activity,
  Child,
  Invoice,
  MasterActivity,
  MasterAdditionalFee,
  MasterAgeGroup,
  MasterAnnouncement,
  MasterCaregiver,
  MasterPackage,
  MasterPaymentMethod,
  MasterRoom,
  MasterShift,
  MasterHoliday,
  DaycareProfile,
  ParentGuardian,
} from "./types.js";

const now = new Date();

export const seedChildren: Child[] = [
  {
    id: "c1",
    parentId: "p-081233441122",
    name: "Arka Wijaya",
    age: "3 thn",
    initials: "AW",
    parent: "Bunda Maya",
    parentPhone: "0812-3344-1122",
    allergies: ["Kacang"],
    notes: "Butuh tidur siang 12.30",
    package: "Full Day",
    status: "Di Daycare",
    checkInTime: "07:42",
    expectedOut: "17:00",
    items: ["Botol susu (2)", "Baju ganti", "Selimut biru"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "c2",
    parentId: "p-081177882231",
    name: "Nayla Putri",
    age: "2 thn",
    initials: "NP",
    parent: "Bunda Rina",
    parentPhone: "0811-7788-2231",
    allergies: ["Susu sapi"],
    notes: "Pakai susu soya merk Bebelac",
    package: "Half Day",
    status: "Di Daycare",
    checkInTime: "08:05",
    expectedOut: "13:00",
    items: ["Susu soya", "Diapers (4)"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "c3",
    parentId: "p-085712129090",
    name: "Bima Saputra",
    age: "4 thn",
    initials: "BS",
    parent: "Ayah Doni",
    parentPhone: "0857-1212-9090",
    allergies: [],
    package: "Full Day",
    status: "Di Daycare",
    checkInTime: "07:55",
    expectedOut: "17:00",
    items: ["Bekal nasi", "Mainan kereta"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "c4",
    parentId: "p-082234345656",
    name: "Kayla Hasna",
    age: "3 thn",
    initials: "KH",
    parent: "Bunda Tia",
    parentPhone: "0822-3434-5656",
    allergies: ["Telur"],
    notes: "Obat batuk jam 11.00 (1 sdt)",
    package: "Hourly",
    status: "Sudah Pulang",
    checkInTime: "09:10",
    expectedOut: "12:10",
    items: ["Topi merah", "Botol minum"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "c5",
    parentId: "p-081390902211",
    name: "Reno Adiputra",
    age: "2 thn",
    initials: "RA",
    parent: "Bunda Lia",
    parentPhone: "0813-9090-2211",
    allergies: [],
    package: "Full Day",
    status: "Belum Datang",
    expectedOut: "17:00",
    items: [],
    createdAt: now,
    updatedAt: now,
  },
];

export const seedParents: ParentGuardian[] = [
  {
    id: "p-081233441122",
    displayName: "Bunda Maya",
    primaryPhone: "0812-3344-1122",
    motherName: "Maya",
    motherPhone: "0812-3344-1122",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p-081177882231",
    displayName: "Bunda Rina",
    primaryPhone: "0811-7788-2231",
    motherName: "Rina",
    motherPhone: "0811-7788-2231",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p-085712129090",
    displayName: "Ayah Doni",
    primaryPhone: "0857-1212-9090",
    fatherName: "Doni",
    fatherPhone: "0857-1212-9090",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p-082234345656",
    displayName: "Bunda Tia",
    primaryPhone: "0822-3434-5656",
    motherName: "Tia",
    motherPhone: "0822-3434-5656",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p-081390902211",
    displayName: "Bunda Lia",
    primaryPhone: "0813-9090-2211",
    motherName: "Lia",
    motherPhone: "0813-9090-2211",
    createdAt: now,
    updatedAt: now,
  },
];

export const seedActivities: Activity[] = [
  { id: "a1", childId: "c1", time: "08:00", type: "Makan", detail: "Sarapan bubur ayam - habis", staff: "Bu Ratna", createdAt: now },
  { id: "a2", childId: "c2", time: "08:30", type: "Popok", detail: "Ganti popok bersih", staff: "Bu Ani", createdAt: now },
  { id: "a3", childId: "c3", time: "09:15", type: "Main", detail: "Sesi balok kayu dengan teman", staff: "Bu Mia", createdAt: now },
  { id: "a4", childId: "c4", time: "11:00", type: "Obat", detail: "Obat batuk 1 sdt diberikan", staff: "Bu Ratna", createdAt: now },
  { id: "a5", childId: "c1", time: "12:30", type: "Tidur", detail: "Tidur siang nyenyak (1j 40m)", staff: "Bu Ani", createdAt: now },
  { id: "a6", childId: "c2", time: "12:45", type: "Makan", detail: "Susu soya 180ml", staff: "Bu Mia", createdAt: now },
  { id: "a7", childId: "c3", time: "13:10", type: "Mandi", detail: "Mandi sore + ganti baju", staff: "Bu Ratna", createdAt: now },
];

export const seedInvoices: Invoice[] = [
  { id: "INV-1042", childId: "c1", period: "Juni 2026", basePackage: 1800000, hours: 22, overtimeHours: 3, overtimeRate: 35000, extras: 50000, status: "Belum Dibayar", createdAt: now, updatedAt: now },
  { id: "INV-1041", childId: "c2", period: "Juni 2026", basePackage: 1200000, hours: 20, overtimeHours: 0, overtimeRate: 35000, extras: 25000, status: "Lunas", createdAt: now, updatedAt: now },
  { id: "INV-1040", childId: "c3", period: "Juni 2026", basePackage: 1800000, hours: 21, overtimeHours: 6, overtimeRate: 40000, extras: 0, status: "Belum Dibayar", createdAt: now, updatedAt: now },
  { id: "INV-1039", childId: "c4", period: "Mei 2026", basePackage: 600000, hours: 8, overtimeHours: 0, overtimeRate: 35000, extras: 0, status: "Lunas", createdAt: now, updatedAt: now },
  { id: "INV-1038", childId: "c5", period: "Mei 2026", basePackage: 1800000, hours: 22, overtimeHours: 2, overtimeRate: 35000, extras: 0, status: "Overdue", createdAt: now, updatedAt: now },
];

export const seedCaregivers: MasterCaregiver[] = [
  { code: "PG-001", name: "Bu Ratna", role: "Lead Caregiver", shift: "Pagi", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "PG-002", name: "Bu Ani", role: "Caregiver", shift: "Pagi", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "PG-003", name: "Bu Mia", role: "Caregiver", shift: "Siang", status: "Aktif", createdAt: now, updatedAt: now },
];

export const seedPackages: MasterPackage[] = [
  {
    code: "PKG-DAY-FULL",
    name: "Full Day",
    type: "Harian",
    duration: 10,
    durationUnit: "Jam",
    price: 1800000,
    checkInTime: "07:00",
    checkOutTime: "17:00",
    graceMinutes: 15,
    overtimeFee: 40000,
    includeMeal: true,
    includeSnack: true,
    includeMilk: false,
    status: "Aktif",
    createdAt: now,
    updatedAt: now,
  },
  {
    code: "PKG-DAY-HALF",
    name: "Half Day",
    type: "Harian",
    duration: 5,
    durationUnit: "Jam",
    price: 1200000,
    checkInTime: "08:00",
    checkOutTime: "13:00",
    graceMinutes: 15,
    overtimeFee: 35000,
    includeMeal: true,
    includeSnack: true,
    includeMilk: false,
    status: "Aktif",
    createdAt: now,
    updatedAt: now,
  },
  {
    code: "PKG-HOURLY",
    name: "Hourly",
    type: "Custom",
    duration: 1,
    durationUnit: "Jam",
    price: 600000,
    checkInTime: "09:00",
    checkOutTime: "12:00",
    graceMinutes: 10,
    overtimeFee: 35000,
    visitQuota: 8,
    includeMeal: false,
    includeSnack: true,
    includeMilk: false,
    status: "Aktif",
    createdAt: now,
    updatedAt: now,
  },
];

export const seedActivityTypes: MasterActivity[] = [
  { code: "ACT-MAKAN", name: "Makan", icon: "utensils", requiresTime: true, requiresNote: true, requiresPhoto: false, status: "Aktif", createdAt: now, updatedAt: now },
  { code: "ACT-TIDUR", name: "Tidur", icon: "moon", requiresTime: true, requiresNote: true, requiresPhoto: false, status: "Aktif", createdAt: now, updatedAt: now },
  { code: "ACT-MANDI", name: "Mandi", icon: "droplets", requiresTime: true, requiresNote: true, requiresPhoto: false, status: "Aktif", createdAt: now, updatedAt: now },
  { code: "ACT-OBAT", name: "Obat", icon: "pill", requiresTime: true, requiresNote: true, requiresPhoto: false, status: "Aktif", createdAt: now, updatedAt: now },
  { code: "ACT-MAIN", name: "Main", icon: "blocks", requiresTime: true, requiresNote: true, requiresPhoto: true, status: "Aktif", createdAt: now, updatedAt: now },
  { code: "ACT-POPOK", name: "Popok", icon: "baby", requiresTime: true, requiresNote: false, requiresPhoto: false, status: "Aktif", createdAt: now, updatedAt: now },
];

export const seedAgeGroups: MasterAgeGroup[] = [
  { code: "AGE-INFANT", name: "Infant", minAgeMonths: 6, maxAgeMonths: 18, capacity: 8, status: "Aktif", createdAt: now, updatedAt: now },
  { code: "AGE-TODDLER", name: "Toddler", minAgeMonths: 19, maxAgeMonths: 36, capacity: 12, status: "Aktif", createdAt: now, updatedAt: now },
  { code: "AGE-PRESCHOOL", name: "Preschool", minAgeMonths: 37, maxAgeMonths: 60, capacity: 16, status: "Aktif", createdAt: now, updatedAt: now },
];

export const seedRooms: MasterRoom[] = [
  { code: "ROOM-A", name: "Bintang Kecil", capacity: 8, location: "Lantai 1", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "ROOM-B", name: "Awan Biru", capacity: 12, location: "Lantai 1", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "ROOM-C", name: "Matahari", capacity: 16, location: "Lantai 2", status: "Aktif", createdAt: now, updatedAt: now },
];

export const seedShifts: MasterShift[] = [
  { code: "SFT-PAGI", name: "Pagi", startTime: "07:00", endTime: "15:00", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "SFT-SIANG", name: "Siang", startTime: "10:00", endTime: "18:00", status: "Aktif", createdAt: now, updatedAt: now },
];

export const seedAdditionalFees: MasterAdditionalFee[] = [
  { code: "FEE-LATE", name: "Denda Terlambat", category: "keterlambatan", amount: 40000, unit: "jam", calculationMethod: "per_jam", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "FEE-MEAL", name: "Makan Tambahan", category: "makan_tambahan", amount: 25000, unit: "porsi", calculationMethod: "qty", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "FEE-MILK", name: "Susu Tambahan", category: "susu", amount: 20000, unit: "porsi", calculationMethod: "qty", status: "Aktif", createdAt: now, updatedAt: now },
];

export const seedAnnouncements: MasterAnnouncement[] = [
  {
    title: "Field Trip Botanical Garden",
    content: "Bus berangkat pukul 09:00. Pastikan izin orang tua sudah lengkap.",
    period: "Juni 2026",
    status: "Aktif",
    createdAt: now,
    updatedAt: now,
  },
];

export const seedPaymentMethods: MasterPaymentMethod[] = [
  { code: "PAY-BCA", name: "Transfer BCA", type: "Transfer", account: "1234567890 a.n. Lumi Daycare", bankName: "BCA", accountNumber: "1234567890", accountHolder: "Lumi Daycare", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "PAY-QRIS", name: "QRIS Lumi", type: "QRIS", account: "QRIS-LUMI-DAYCARE", instructions: "Scan QRIS resmi Lumi Daycare.", status: "Aktif", createdAt: now, updatedAt: now },
  { code: "PAY-CASH", name: "Cash", type: "Cash", account: "Kasir Daycare", status: "Aktif", createdAt: now, updatedAt: now },
];

export const seedHolidays: MasterHoliday[] = [
  { date: "2026-06-17", name: "Hari Libur Nasional", description: "Daycare tutup sesuai kalender operasional.", status: "Aktif", createdAt: now, updatedAt: now },
];

export const seedDaycareProfile: DaycareProfile = {
  name: "Lumi Daycare",
  address: "Jl. Kenanga No. 12, Jakarta",
  phone: "021-555-0101",
  email: "halo@lumidaycare.id",
  website: "https://lumidaycare.id",
  operationalStart: "07:00",
  operationalEnd: "18:00",
  defaultCapacity: 36,
  createdAt: now,
  updatedAt: now,
};
