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
  createdAt: Date;
  updatedAt: Date;
};

export type ParentGuardian = {
  id: string;
  displayName: string;
  primaryPhone: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Activity = {
  id: string;
  childId: string;
  time: string;
  type: string;
  detail: string;
  staff: string;
  photoUrl?: string;
  createdAt: Date;
};

export type HealthNote = {
  id: string;
  childId: string;
  recordedAt: Date;
  category: "Suhu" | "Obat" | "Alergi" | "Luka" | "Lainnya";
  note: string;
  temperature?: number;
  medicationName?: string;
  dosage?: string;
  handledBy: string;
  parentNotified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Incident = {
  id: string;
  childId: string;
  occurredAt: Date;
  title: string;
  description: string;
  actionTaken: string;
  severity: "Ringan" | "Sedang" | "Tinggi";
  handledBy: string;
  parentNotified: boolean;
  status: "Open" | "Ditangani" | "Selesai";
  createdAt: Date;
  updatedAt: Date;
};

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
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceWithTotal = Invoice & { total: number };

export type Payment = {
  id: string;
  invoiceId: string;
  method: string;
  amount: number;
  proofUrl?: string;
  notes?: string;
  statusVerification?: "pending" | "verified" | "rejected";
  verifiedAt?: Date;
  rejectedAt?: Date;
  verificationNotes?: string;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type PackagePurchase = {
  id: string;
  childId: string;
  packageCode: string;
  packageName: string;
  packageType: MasterPackage["type"];
  price: number;
  startDate: string;
  endDate?: string;
  visitQuota?: number;
  visitsUsed: number;
  status: "Aktif" | "Selesai" | "Dibatalkan";
  paymentStatus: "Belum Dibayar" | "Lunas";
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Booking = {
  id: string;
  childId: string;
  packageCode: string;
  packageName: string;
  date: string;
  status: "Terjadwal" | "Selesai" | "Dibatalkan";
  createdAt: Date;
  updatedAt: Date;
};

export type MasterStatus = "Aktif" | "Nonaktif";

export type MasterCaregiver = {
  code: string;
  name: string;
  role: string;
  shift: string;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterPackage = {
  code: string;
  name: string;
  type: "Harian" | "Mingguan" | "Bulanan" | "Kuota" | "Custom";
  duration: number;
  durationUnit: "Jam" | "Hari" | "Minggu" | "Bulan" | "Kunjungan";
  price: number;
  checkInTime: string;
  checkOutTime: string;
  graceMinutes: number;
  overtimeFee: number;
  visitQuota?: number;
  includeMeal: boolean;
  includeSnack: boolean;
  includeMilk: boolean;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterActivity = {
  code: string;
  name: string;
  icon: string;
  requiresTime: boolean;
  requiresNote: boolean;
  requiresPhoto: boolean;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterAgeGroup = {
  code: string;
  name: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  capacity: number;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterRoom = {
  code: string;
  name: string;
  capacity: number;
  location?: string;
  description?: string;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterShift = {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterAdditionalFee = {
  code: string;
  name: string;
  category?: string;
  amount: number;
  unit?: string;
  calculationMethod?: "flat" | "qty" | "per_jam" | "per_menit";
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterAnnouncement = {
  title: string;
  content: string;
  period: string;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterPaymentMethod = {
  code?: string;
  name: string;
  type: "Transfer" | "QRIS" | "Cash" | "E-Wallet";
  account: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrisImage?: string;
  instructions?: string;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterHoliday = {
  date: string;
  name: string;
  description?: string;
  status: MasterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type DaycareProfile = {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  operationalStart: string;
  operationalEnd: string;
  defaultCapacity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRole = "super_admin" | "admin" | "staff" | "parent";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterDataSnapshot = {
  caregivers: MasterCaregiver[];
  packages: MasterPackage[];
  activityTypes: MasterActivity[];
  ageGroups: MasterAgeGroup[];
  rooms: MasterRoom[];
  shifts: MasterShift[];
  additionalFees: MasterAdditionalFee[];
  announcements: MasterAnnouncement[];
  paymentMethods: MasterPaymentMethod[];
  holidays: MasterHoliday[];
  daycareProfile?: DaycareProfile;
};

export type DaycareSnapshot = {
  children: Child[];
  parents: ParentGuardian[];
  packagePurchases: PackagePurchase[];
  bookings: Booking[];
  activities: Activity[];
  healthNotes: HealthNote[];
  incidents: Incident[];
  invoices: InvoiceWithTotal[];
  payments: Payment[];
  masterData: MasterDataSnapshot;
};
