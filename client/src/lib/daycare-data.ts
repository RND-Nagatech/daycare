export type Child = {
  id: string;
  parentId?: string;
  name: string;
  age: string;
  initials: string;
  parent: string;
  parentPhone: string;
  allergies: string[];
  notes?: string;
  package: string;
  status: "Di Daycare" | "Sudah Pulang" | "Belum Datang";
  checkInTime?: string;
  droppedOffBy?: string;
  caregiver?: string;
  checkInNotes?: string;
  checkOutTime?: string;
  pickedUpBy?: string;
  checkOutCaregiver?: string;
  checkOutNotes?: string;
  checkOutAdditionalFees?: Array<{
    code: string;
    name: string;
    amount: number;
  }>;
  expectedOut?: string;
  items: string[];
};

export const children: Child[] = [
  {
    id: "c1",
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
  },
  {
    id: "c2",
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
  },
  {
    id: "c3",
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
  },
  {
    id: "c4",
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
  },
  {
    id: "c5",
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
  },
];

export type Activity = {
  id: string;
  childId: string;
  time: string;
  type: string;
  detail: string;
  staff: string;
  photoUrl?: string;
};

export const activities: Activity[] = [
  { id: "a1", childId: "c1", time: "08:00", type: "Makan", detail: "Sarapan bubur ayam — habis", staff: "Bu Ratna" },
  { id: "a2", childId: "c2", time: "08:30", type: "Popok", detail: "Ganti popok bersih", staff: "Bu Ani" },
  { id: "a3", childId: "c3", time: "09:15", type: "Main", detail: "Sesi balok kayu dengan teman", staff: "Bu Mia" },
  { id: "a4", childId: "c4", time: "11:00", type: "Obat", detail: "Obat batuk 1 sdt diberikan", staff: "Bu Ratna" },
  { id: "a5", childId: "c1", time: "12:30", type: "Tidur", detail: "Tidur siang nyenyak (1j 40m)", staff: "Bu Ani" },
  { id: "a6", childId: "c2", time: "12:45", type: "Makan", detail: "Susu soya 180ml", staff: "Bu Mia" },
  { id: "a7", childId: "c3", time: "13:10", type: "Mandi", detail: "Mandi sore + ganti baju", staff: "Bu Ratna" },
];

export type Invoice = {
  id: string;
  childId: string;
  period: string;
  basePackage: number;
  hours: number;
  overtimeHours: number;
  overtimeRate: number;
  extras: number;
  status: "Lunas" | "Belum Dibayar" | "Partial" | "Overdue";
};

export const invoices: Invoice[] = [
  { id: "INV-1042", childId: "c1", period: "Juni 2026", basePackage: 1800000, hours: 22, overtimeHours: 3, overtimeRate: 35000, extras: 50000, status: "Belum Dibayar" },
  { id: "INV-1041", childId: "c2", period: "Juni 2026", basePackage: 1200000, hours: 20, overtimeHours: 0, overtimeRate: 35000, extras: 25000, status: "Lunas" },
  { id: "INV-1040", childId: "c3", period: "Juni 2026", basePackage: 1800000, hours: 21, overtimeHours: 6, overtimeRate: 40000, extras: 0, status: "Belum Dibayar" },
  { id: "INV-1039", childId: "c4", period: "Mei 2026", basePackage: 600000, hours: 8, overtimeHours: 0, overtimeRate: 35000, extras: 0, status: "Lunas" },
  { id: "INV-1038", childId: "c5", period: "Mei 2026", basePackage: 1800000, hours: 22, overtimeHours: 2, overtimeRate: 35000, extras: 0, status: "Overdue" },
];

export function invoiceTotal(i: Invoice) {
  return i.basePackage + i.overtimeHours * i.overtimeRate + i.extras;
}

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const childById = (id: string) => children.find((c) => c.id === id);
