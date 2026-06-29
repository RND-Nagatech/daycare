import type { Activity, Child, Invoice } from "./daycare-data";
import type { MasterRecord, MasterResourceKey } from "./master-data-config";
import { authStore, type AuthUser } from "./auth";

export type InvoiceWithTotal = Invoice & { total: number };

export type MasterStatus = "Aktif" | "Nonaktif";

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
};

export type MasterActivity = {
  code: string;
  name: string;
  icon: string;
  requiresTime: boolean;
  requiresNote: boolean;
  requiresPhoto: boolean;
  status: MasterStatus;
};

export type MasterDataSnapshot = {
  caregivers: Array<{ code: string; name: string; role: string; shift: string; shiftCode?: string; shiftName?: string; status: MasterStatus }>;
  packages: MasterPackage[];
  activityTypes: MasterActivity[];
  ageGroups: Array<{ code: string; name: string; minAgeMonths: number; maxAgeMonths: number; capacity: number; status: MasterStatus }>;
  rooms: Array<{ code: string; name: string; capacity: number; location?: string; description?: string; status: MasterStatus; createdAt?: string; updatedAt?: string }>;
  shifts: Array<{ code: string; name: string; startTime: string; endTime: string; description?: string; status: MasterStatus }>;
  additionalFees: Array<{
    code: string;
    name: string;
    category?: string;
    amount: number;
    unit?: string;
    calculationMethod?: "flat" | "qty" | "per_jam" | "per_menit";
    status: MasterStatus;
  }>;
  announcements: Array<{ title: string; content: string; period: string; status: MasterStatus }>;
  paymentMethods: Array<{
    code?: string;
    name: string;
    type: string;
    account: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    qrisImage?: string;
    instructions?: string;
    status: MasterStatus;
  }>;
  holidays: Array<{ date: string; name: string; description?: string; status: MasterStatus }>;
  daycareProfile?: {
    name: string;
    logo?: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    operationalStart: string;
    operationalEnd: string;
    defaultCapacity: number;
  };
};

export type DaycareProfile = NonNullable<MasterDataSnapshot["daycareProfile"]>;
export type UpdateDaycareProfileInput = Partial<DaycareProfile>;

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
  paymentStatus: "unpaid" | "partial" | "paid" | "Belum Dibayar" | "Lunas";
  invoiceId?: string;
  createdAt?: string;
};

export type Booking = {
  id: string;
  childId: string;
  packageCode: string;
  packageName: string;
  date: string;
  status: "Terjadwal" | "Selesai" | "Dibatalkan";
};

export type Payment = {
  id: string;
  invoiceId: string;
  method: string;
  amount: number;
  proofUrl?: string;
  notes?: string;
  statusVerification?: "pending" | "verified" | "rejected";
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectReason?: string;
  verificationNotes?: string;
  paidAt: string;
};

export type HealthNote = {
  id: string;
  childId: string;
  recordedAt: string;
  category: "Suhu" | "Obat" | "Alergi" | "Luka" | "Lainnya";
  note: string;
  temperature?: number;
  medicationName?: string;
  dosage?: string;
  handledBy: string;
  parentNotified: boolean;
};

export type Incident = {
  id: string;
  childId: string;
  occurredAt: string;
  title: string;
  description: string;
  actionTaken: string;
  severity: "Ringan" | "Sedang" | "Tinggi";
  handledBy: string;
  parentNotified: boolean;
  status: "Open" | "Ditangani" | "Selesai";
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

export type CreateChildInput = {
  name: string;
  age: string;
  parent: string;
  parentPhone: string;
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
  allergies: string[];
  notes?: string;
  package: string;
  expectedOut?: string;
  items: string[];
};

export type CreateActivityInput = {
  childId: string;
  type: string;
  detail: string;
  staff: string;
  time?: string;
  photoUrl?: string;
};

export type PurchasePackageInput = {
  childId: string;
  packageName: string;
  startDate?: string;
  paymentStatus?: PackagePurchase["paymentStatus"];
  payNow?: boolean;
  paymentMethod?: string;
};

export type AdminDashboard = {
  operational: { totalChildren: number; totalCaregivers: number; totalPackages: number; bookingsToday: number; checkInsToday: number; childrenInCare: number; checkOutsToday: number };
  finance: { openInvoices: number; partialInvoices: number; pendingPayments: number; revenueToday: number; revenueMonth: number };
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "staff" | "parent";
  status: "Aktif" | "Nonaktif";
  createdAt: string;
  updatedAt: string;
};

export type SaveUserInput = { name: string; email: string; password?: string; role: ManagedUser["role"]; status: ManagedUser["status"] };

export type CreateBookingInput = {
  childId: string;
  packageName: string;
  date: string;
};

export type CheckOutInput = {
  pickedUpBy?: string;
  caregiver?: string;
  additionalFeeCodes?: string[];
  notes?: string;
};

export type CreatePaymentInput = {
  invoiceId: string;
  method: string;
  amount: number;
  proofUrl?: string;
  notes?: string;
};

export type CreateHealthNoteInput = {
  childId: string;
  category: HealthNote["category"];
  note: string;
  temperature?: number;
  medicationName?: string;
  dosage?: string;
  handledBy: string;
  parentNotified?: boolean;
  recordedAt?: string;
};

export type CreateIncidentInput = {
  childId: string;
  title: string;
  description: string;
  actionTaken: string;
  severity: Incident["severity"];
  handledBy: string;
  parentNotified?: boolean;
  occurredAt?: string;
};

const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, unknown>;
};

function isApiEnvelope<T>(body: unknown): body is ApiEnvelope<T> {
  return typeof body === "object" && body !== null && "success" in body && "data" in body;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = authStore.getToken();
  const response = await fetch(`${API_URL}${url}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Request failed" }));
    if (response.status === 401 && !url.includes("/auth/login")) authStore.clear();
    throw new Error(body.message ?? "Request failed");
  }

  const body = (await response.json()) as unknown;
  return isApiEnvelope<T>(body) ? body.data : (body as T);
}

export const daycareApi = {
  appConfig() {
    return requestJson<{ appName: string; logo?: string }>("/api/v1/app-config");
  },

  login(input: { email: string; password: string }) {
    return requestJson<{ token: string; user: AuthUser }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  me() {
    return requestJson<AuthUser>("/api/v1/auth/me");
  },

  dashboard() {
    return requestJson<AdminDashboard>("/api/v1/dashboard/admin");
  },

  users() {
    return requestJson<ManagedUser[]>("/api/v1/users");
  },

  createUser(input: SaveUserInput) {
    return requestJson<ManagedUser>("/api/v1/users", { method: "POST", body: JSON.stringify(input) });
  },

  updateUser(id: string, input: SaveUserInput) {
    return requestJson<ManagedUser>(`/api/v1/users/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
  },

  deleteUser(id: string) {
    return requestJson<ManagedUser>(`/api/v1/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  snapshot() {
    return requestJson<DaycareSnapshot>("/api/v1/daycare");
  },

  masterData() {
    return requestJson<MasterDataSnapshot>("/api/v1/master-data");
  },

  masterResource(resource: MasterResourceKey) {
    return requestJson<MasterRecord[]>(`/api/v1/master/${encodeURIComponent(resource)}`);
  },

  createMasterResource(resource: MasterResourceKey, input: MasterRecord) {
    return requestJson<MasterRecord>(`/api/v1/master/${encodeURIComponent(resource)}`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateMasterResource(resource: MasterResourceKey, id: string, input: MasterRecord) {
    return requestJson<MasterRecord>(`/api/v1/master/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  deleteMasterResource(resource: MasterResourceKey, id: string) {
    return requestJson<MasterRecord>(`/api/v1/master/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  createChild(input: CreateChildInput) {
    return requestJson<Child>("/api/v1/registrasi-anak", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  purchasePackage(input: PurchasePackageInput) {
    return requestJson<{ child: Child; purchase: PackagePurchase; invoice: InvoiceWithTotal }>(
      "/api/v1/pembelian-paket",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  createBooking(input: CreateBookingInput) {
    return requestJson<Booking>("/api/v1/booking", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  checkIn(
    childId: string,
    input: { items: string[]; expectedOut?: string; droppedOffBy?: string; caregiver?: string; checkInNotes?: string },
  ) {
    return requestJson<Child>(`/api/v1/anak/${encodeURIComponent(childId)}/check-in`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  checkOut(childId: string, input: CheckOutInput = {}) {
    return requestJson<{ child: Child; invoice: InvoiceWithTotal; actualOut: string; overtimeHours: number }>(
      `/api/v1/anak/${encodeURIComponent(childId)}/check-out`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  },

  createActivity(input: CreateActivityInput) {
    return requestJson<Activity>("/api/v1/aktivitas-harian", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  createHealthNote(input: CreateHealthNoteInput) {
    return requestJson<HealthNote>("/api/v1/catatan-kesehatan", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  createIncident(input: CreateIncidentInput) {
    return requestJson<Incident>("/api/v1/insiden", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  createPayment(input: CreatePaymentInput) {
    return requestJson<{ payment: Payment; invoice: InvoiceWithTotal; paidTotal: number; remaining: number }>(
      "/api/v1/pembayaran",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  verifyPayment(paymentId: string, input: { notes?: string } = {}) {
    return requestJson<{ payment: Payment; invoice: InvoiceWithTotal; paidTotal: number; remaining: number }>(
      `/api/v1/pembayaran/${encodeURIComponent(paymentId)}/verify`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  rejectPayment(paymentId: string, input: { reason: string }) {
    return requestJson<{ payment: Payment; invoice: InvoiceWithTotal; paidTotal: number; remaining: number }>(
      `/api/v1/pembayaran/${encodeURIComponent(paymentId)}/reject`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  recalculateInvoices() {
    return requestJson<InvoiceWithTotal[]>("/api/v1/tagihan/recalculate", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  updateDaycareProfile(input: UpdateDaycareProfileInput) {
    return requestJson<DaycareProfile>("/api/v1/pengaturan/profil-daycare", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};

export const daycareQueryKey = ["daycare"] as const;
export const masterDataQueryKey = ["master-data"] as const;
export const appConfigQueryKey = ["app-config"] as const;
