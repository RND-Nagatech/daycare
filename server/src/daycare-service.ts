import { collections } from "./db.js";
import { hashPassword } from "./auth-utils.js";
import type {
  Activity,
  Booking,
  Child,
  Invoice,
  InvoiceWithTotal,
  DaycareProfile,
  HealthNote,
  Incident,
  MasterDataSnapshot,
  MasterPackage,
  PackagePurchase,
  Payment,
  ParentGuardian,
  UserRole,
} from "./types.js";

type CreateChildPayload = {
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
  allergies?: string[];
  notes?: string;
  package: string;
  expectedOut?: string;
  items?: string[];
};

type CreateActivityPayload = {
  childId: string;
  type: string;
  detail: string;
  staff: string;
  time?: string;
  photoUrl?: string;
};

type PurchasePackagePayload = {
  childId: string;
  packageName: string;
  startDate?: string;
  paymentStatus?: PackagePurchase["paymentStatus"];
  payNow?: boolean;
  paymentMethod?: string;
};

type CreateBookingPayload = {
  childId: string;
  packageName: string;
  date: string;
};

type CheckOutPayload = {
  pickedUpBy?: string;
  caregiver?: string;
  additionalFeeCodes?: string[];
  notes?: string;
};

type CreatePaymentPayload = {
  invoiceId: string;
  method: string;
  amount: number;
  proofUrl?: string;
  notes?: string;
};

type VerifyPaymentPayload = {
  notes?: string;
  reason?: string;
};

type UserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: "Aktif" | "Nonaktif";
};

type CreateHealthNotePayload = {
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

type CreateIncidentPayload = {
  childId: string;
  title: string;
  description: string;
  actionTaken: string;
  severity: Incident["severity"];
  handledBy: string;
  parentNotified?: boolean;
  occurredAt?: string;
};

type UpdateDaycareProfilePayload = Partial<
  Pick<
    DaycareProfile,
    "name" | "logo" | "address" | "phone" | "email" | "website" | "operationalStart" | "operationalEnd" | "defaultCapacity"
  >
>;

type MasterResource =
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

type MasterRecord = Record<string, unknown> & {
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
};

export function invoiceTotal(invoice: Invoice) {
  return invoice.basePackage + invoice.overtimeHours * invoice.overtimeRate + invoice.extras;
}

function invoiceWithTotal(invoice: Invoice): InvoiceWithTotal {
  return { ...invoice, total: invoiceTotal(invoice) };
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function currentJakartaTime() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(".", ":");
}

function currentPeriod() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function currentJakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseOptionalDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error("Invalid date value");
    Object.assign(error, { status: 400 });
    throw error;
  }
  return parsed;
}

function publicUserRecord(user: { id: string; name: string; email: string; role: UserRole; isActive: boolean; createdAt: Date; updatedAt: Date }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.isActive ? "Aktif" as const : "Nonaktif" as const, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

const allowedUserRoles: UserRole[] = ["super_admin", "admin", "staff", "parent"];

function jakartaDayRange() {
  const date = currentJakartaDate();
  return { start: new Date(`${date}T00:00:00+07:00`), end: new Date(`${date}T23:59:59.999+07:00`) };
}

function jakartaMonthRange() {
  const date = currentJakartaDate();
  const [year, month] = date.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1) - 7 * 60 * 60 * 1000),
    end: new Date(Date.UTC(year, month, 1) - 7 * 60 * 60 * 1000 - 1),
  };
}

function masterResourceConfig(resource: string) {
  const c = collections();
  const configs = {
    pengasuh: { collection: c.caregivers, idField: "code", sort: { code: 1 } },
    paket: { collection: c.packages, idField: "code", sort: { code: 1 } },
    aktivitas: { collection: c.activityTypes, idField: "code", sort: { code: 1 } },
    "kelompok-usia": { collection: c.ageGroups, idField: "code", sort: { code: 1 } },
    ruangan: { collection: c.rooms, idField: "code", sort: { code: 1 } },
    shift: { collection: c.shifts, idField: "code", sort: { code: 1 } },
    "biaya-tambahan": { collection: c.additionalFees, idField: "code", sort: { code: 1 } },
    "metode-pembayaran": { collection: c.paymentMethods, idField: "code", sort: { code: 1 } },
    pengumuman: { collection: c.announcements, idField: "title", sort: { createdAt: -1 } },
    "hari-libur": { collection: c.holidays, idField: "date", sort: { date: 1 } },
  } as const;

  const config = configs[resource as MasterResource];
  if (!config) {
    const error = new Error("Master resource not found");
    Object.assign(error, { status: 404 });
    throw error;
  }
  return {
    collection: config.collection as any,
    idField: config.idField,
    sort: config.sort,
  };
}

function cleanMasterPayload(payload: MasterRecord, now: Date, mode: "create" | "update") {
  const blocked = new Set(["_id", "createdAt", "updatedAt"]);
  const cleaned = Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => !blocked.has(key) && value !== undefined)
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  ) as MasterRecord;

  if (mode === "create" && !cleaned.status) {
    cleaned.status = "Aktif";
  }
  cleaned.updatedAt = now;
  if (mode === "create") {
    cleaned.createdAt = now;
  }
  return cleaned;
}

async function normalizeMasterPayload(resource: string, payload: MasterRecord, existing?: MasterRecord) {
  if (resource !== "pengasuh") return payload;
  const shiftCode = String(payload.shiftCode ?? existing?.shiftCode ?? "").trim();
  if (!shiftCode) {
    const error = new Error("Shift wajib dipilih dari Master Shift");
    Object.assign(error, { status: 400 });
    throw error;
  }
  const shift = await collections().shifts.findOne({ code: shiftCode, status: "Aktif" }, { projection: { _id: 0 } });
  if (!shift) {
    const error = new Error("Shift tidak ditemukan atau tidak aktif");
    Object.assign(error, { status: 400 });
    throw error;
  }
  return { ...payload, shiftCode: shift.code, shiftName: shift.name, shift: shift.name };
}

function timeToMinutes(time?: string) {
  if (!time) return undefined;
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return undefined;
  return hour * 60 + minute;
}

function calculateOvertimeHours(expectedOut?: string, actualOut?: string) {
  const expected = timeToMinutes(expectedOut);
  const actual = timeToMinutes(actualOut);
  if (expected === undefined || actual === undefined || actual <= expected) return 0;
  return Math.ceil((actual - expected) / 60);
}

function parentIdFromPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `p-${digits || Date.now()}`;
}

function splitParentName(displayName: string) {
  return displayName.replace(/^(Bunda|Ayah|Ibu|Mama|Papa|Mami|Papi)\s+/i, "").trim() || displayName.trim();
}

function parentPatchFromPayload(payload: CreateChildPayload) {
  const displayName = payload.parent.trim();
  const primaryPhone = payload.parentPhone.trim();
  const isFather = displayName.toLowerCase().startsWith("ayah");

  return {
    displayName,
    primaryPhone,
    fatherName: payload.fatherName?.trim() || (isFather ? splitParentName(displayName) : undefined),
    fatherPhone: payload.fatherPhone?.trim() || (isFather ? primaryPhone : undefined),
    fatherOccupation: payload.fatherOccupation?.trim() || undefined,
    motherName: payload.motherName?.trim() || (!isFather ? splitParentName(displayName) : undefined),
    motherPhone: payload.motherPhone?.trim() || (!isFather ? primaryPhone : undefined),
    motherOccupation: payload.motherOccupation?.trim() || undefined,
    emergencyContactName: payload.emergencyContactName?.trim() || undefined,
    emergencyContactPhone: payload.emergencyContactPhone?.trim() || undefined,
    email: payload.email?.trim() || undefined,
    address: payload.address?.trim() || undefined,
  };
}

async function upsertParentFromPayload(payload: CreateChildPayload, now: Date): Promise<ParentGuardian> {
  const c = collections();
  const parentId = parentIdFromPhone(payload.parentPhone);
  const patch = parentPatchFromPayload(payload);
  const update = Object.fromEntries(Object.entries({ ...patch, updatedAt: now }).filter(([, value]) => value !== undefined));

  await c.parents.updateOne(
    { id: parentId },
    {
      $setOnInsert: {
        id: parentId,
        createdAt: now,
      },
      $set: update,
    },
    { upsert: true },
  );

  const parent = await c.parents.findOne({ id: parentId }, { projection: { _id: 0 } });
  if (!parent) {
    const error = new Error("Parent guardian could not be saved");
    Object.assign(error, { status: 500 });
    throw error;
  }
  return parent;
}

async function findChildOrThrow(childId: string) {
  const child = await collections().children.findOne({ id: childId }, { projection: { _id: 0 } });
  if (!child) {
    const error = new Error("Child not found");
    Object.assign(error, { status: 404 });
    throw error;
  }
  return child;
}

async function findInvoiceOrThrow(invoiceId: string) {
  const invoice = await collections().invoices.findOne({ id: invoiceId }, { projection: { _id: 0 } });
  if (!invoice) {
    const error = new Error("Invoice not found");
    Object.assign(error, { status: 404 });
    throw error;
  }
  return invoice;
}

async function findPaymentOrThrow(paymentId: string) {
  const payment = await collections().payments.findOne({ id: paymentId }, { projection: { _id: 0 } });
  if (!payment) {
    const error = new Error("Payment not found");
    Object.assign(error, { status: 404 });
    throw error;
  }
  return payment;
}

async function findPackageOrThrow(packageName: string) {
  const masterPackage = await collections().packages.findOne(
    { name: packageName, status: "Aktif" },
    { projection: { _id: 0 } },
  );
  if (!masterPackage) {
    const error = new Error("Package not found or inactive");
    Object.assign(error, { status: 400 });
    throw error;
  }
  return masterPackage;
}

async function findActivityTypeOrThrow(activityName: string) {
  const activityType = await collections().activityTypes.findOne(
    { name: activityName, status: "Aktif" },
    { projection: { _id: 0 } },
  );
  if (!activityType) {
    const error = new Error("Activity type not found or inactive");
    Object.assign(error, { status: 400 });
    throw error;
  }
  return activityType;
}

async function findCaregiverOrThrow(caregiverName: string) {
  const caregiver = await collections().caregivers.findOne(
    { name: caregiverName, status: "Aktif" },
    { projection: { _id: 0 } },
  );
  if (!caregiver) {
    const error = new Error("Caregiver not found or inactive");
    Object.assign(error, { status: 400 });
    throw error;
  }
  return caregiver;
}

async function findAdditionalFeesByCode(codes: string[] = []) {
  const uniqueCodes = [...new Set(codes.map((code) => code.trim()).filter(Boolean))];
  if (uniqueCodes.length === 0) return [];

  const fees = await collections()
    .additionalFees.find({ code: { $in: uniqueCodes }, status: "Aktif" }, { projection: { _id: 0 } })
    .toArray();
  if (fees.length !== uniqueCodes.length) {
    const error = new Error("Additional fee not found or inactive");
    Object.assign(error, { status: 400 });
    throw error;
  }
  return fees;
}

async function findPaymentMethodOrThrow(methodName: string) {
  const method = await collections().paymentMethods.findOne(
    { name: methodName, status: "Aktif" },
    { projection: { _id: 0 } },
  );
  if (!method) {
    const error = new Error("Payment method not found or inactive");
    Object.assign(error, { status: 400 });
    throw error;
  }
  return method;
}

async function getActiveMasterPackage(packageName: string) {
  return collections().packages.findOne({ name: packageName, status: "Aktif" }, { projection: { _id: 0 } });
}

function fallbackPackageFromChild(child: Child): MasterPackage {
  return {
    code: `LEGACY-${child.package.toUpperCase().replace(/\s+/g, "-")}`,
    name: child.package,
    type: child.package === "Hourly" ? "Custom" : "Harian",
    duration: child.package === "Half Day" ? 5 : child.package === "Hourly" ? 1 : 10,
    durationUnit: "Jam",
    price: child.package === "Half Day" ? 1200000 : child.package === "Hourly" ? 600000 : 1800000,
    checkInTime: "08:00",
    checkOutTime: child.package === "Half Day" ? "13:00" : child.expectedOut ?? "17:00",
    graceMinutes: 15,
    overtimeFee: child.package === "Full Day" ? 40000 : 35000,
    includeMeal: child.package !== "Hourly",
    includeSnack: true,
    includeMilk: false,
    status: "Aktif",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function packageForChild(child: Child) {
  return (await getActiveMasterPackage(child.package)) ?? fallbackPackageFromChild(child);
}

async function masterDataSnapshot(): Promise<MasterDataSnapshot> {
  const c = collections();
  const projection = { _id: 0 };
  const [
    caregivers,
    packages,
    activityTypes,
    ageGroups,
    rooms,
    shifts,
    additionalFees,
    announcements,
    paymentMethods,
    holidays,
    daycareProfile,
  ] = await Promise.all([
    c.caregivers.find({}, { projection }).sort({ code: 1 }).toArray(),
    c.packages.find({}, { projection }).sort({ code: 1 }).toArray(),
    c.activityTypes.find({}, { projection }).sort({ code: 1 }).toArray(),
    c.ageGroups.find({}, { projection }).sort({ code: 1 }).toArray(),
    c.rooms.find({}, { projection }).sort({ code: 1 }).toArray(),
    c.shifts.find({}, { projection }).sort({ code: 1 }).toArray(),
    c.additionalFees.find({}, { projection }).sort({ code: 1 }).toArray(),
    c.announcements.find({}, { projection }).sort({ createdAt: -1 }).toArray(),
    c.paymentMethods.find({}, { projection }).sort({ name: 1 }).toArray(),
    c.holidays.find({}, { projection }).sort({ date: 1 }).toArray(),
    c.daycareProfile.findOne({}, { projection }),
  ]);

  return {
    caregivers,
    packages,
    activityTypes,
    ageGroups,
    rooms,
    shifts,
    additionalFees,
    announcements,
    paymentMethods,
    holidays,
    daycareProfile: daycareProfile ?? undefined,
  };
}

async function nextInvoiceId() {
  const latest = await collections()
    .invoices.find({}, { projection: { _id: 0, id: 1 } })
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
  const number = latest?.id.match(/\d+$/)?.[0];
  return `INV-${number ? Number(number) + 1 : 1043}`;
}

async function upsertCurrentInvoice(child: Child, overtimeHours = 0) {
  const c = collections();
  const period = currentPeriod();
  const existing = await c.invoices.findOne(
    { childId: child.id, period, purchaseId: { $exists: false } },
    { projection: { _id: 0 } },
  );
  const now = new Date();
  const masterPackage = await packageForChild(child);
  const basePackage = masterPackage.price;
  const overtimeRate = masterPackage.overtimeFee;

  if (existing) {
    const updated: Invoice = {
      ...existing,
      basePackage,
      overtimeHours: Math.max(existing.overtimeHours, overtimeHours),
      overtimeRate,
      hours: Math.max(existing.hours, 1),
      updatedAt: now,
    };
    await c.invoices.updateOne({ id: existing.id }, { $set: updated });
    return updated;
  }

  const invoice: Invoice = {
    id: await nextInvoiceId(),
    childId: child.id,
    period,
    basePackage,
    hours: 1,
    overtimeHours,
    overtimeRate,
    extras: 0,
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  await c.invoices.insertOne(invoice);
  return invoice;
}

async function recalculateInvoicePaymentStatus(invoice: Invoice) {
  const verifiedPayments = await collections()
    .payments.find(
      {
        invoiceId: invoice.id,
        $or: [{ statusVerification: "verified" }, { statusVerification: { $exists: false } }],
      },
      { projection: { _id: 0 } },
    )
    .toArray();
  const paidTotal = verifiedPayments.reduce((sum, item) => sum + item.amount, 0);
  const total = invoiceTotal(invoice);
  const status: Invoice["status"] = paidTotal >= total ? "paid" : paidTotal > 0 ? "partial" : "open";
  const updatedInvoice: Invoice = { ...invoice, status, updatedAt: new Date() };
  const purchaseStatus: PackagePurchase["paymentStatus"] = status === "paid" ? "paid" : status === "partial" ? "partial" : "unpaid";
  await Promise.all([
    collections().invoices.updateOne({ id: invoice.id }, { $set: updatedInvoice }),
    collections().packagePurchases.updateMany({ invoiceId: invoice.id }, { $set: { paymentStatus: purchaseStatus, updatedAt: new Date() } }),
  ]);
  return { invoice: invoiceWithTotal(updatedInvoice), paidTotal, remaining: Math.max(total - paidTotal, 0) };
}

async function createPackagePurchaseRecord({
  child,
  masterPackage,
  invoice,
  startDate,
  paymentStatus = "unpaid",
  purchaseId,
}: {
  child: Child;
  masterPackage: MasterPackage;
  invoice: Invoice;
  startDate?: string;
  paymentStatus?: PackagePurchase["paymentStatus"];
  purchaseId?: string;
}) {
  const now = new Date();
  const purchase: PackagePurchase = {
    id: purchaseId ?? `PP-${Date.now()}`,
    childId: child.id,
    packageCode: masterPackage.code,
    packageName: masterPackage.name,
    packageType: masterPackage.type,
    price: masterPackage.price,
    startDate: startDate || now.toISOString().slice(0, 10),
    visitQuota: masterPackage.visitQuota,
    visitsUsed: child.status === "Belum Datang" ? 0 : 1,
    status: "Aktif",
    paymentStatus,
    invoiceId: invoice.id,
    createdAt: now,
    updatedAt: now,
  };

  await collections().packagePurchases.insertOne(purchase);
  return purchase;
}

export const daycareService = {
  async snapshot() {
    const c = collections();
    const [children, parents, packagePurchases, bookings, activities, healthNotes, incidents, invoices, payments, masterData] = await Promise.all([
      c.children.find({}, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray(),
      c.parents.find({}, { projection: { _id: 0 } }).sort({ displayName: 1 }).toArray(),
      c.packagePurchases.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
      c.bookings.find({}, { projection: { _id: 0 } }).sort({ date: 1, createdAt: -1 }).toArray(),
      c.activities.find({}, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray(),
      c.healthNotes.find({}, { projection: { _id: 0 } }).sort({ recordedAt: -1 }).toArray(),
      c.incidents.find({}, { projection: { _id: 0 } }).sort({ occurredAt: -1 }).toArray(),
      c.invoices.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
      c.payments.find({}, { projection: { _id: 0 } }).sort({ paidAt: -1 }).toArray(),
      masterDataSnapshot(),
    ]);

    return {
      children,
      parents,
      packagePurchases,
      bookings,
      activities,
      healthNotes,
      incidents,
      invoices: invoices.map(invoiceWithTotal),
      payments,
      masterData,
    };
  },

  async masterData() {
    return masterDataSnapshot();
  },

  async dashboardAdmin() {
    const c = collections();
    const today = currentJakartaDate();
    const day = jakartaDayRange();
    const month = jakartaMonthRange();
    const verifiedPayment = { $or: [{ statusVerification: "verified" as const }, { statusVerification: { $exists: false } }] };
    const [
      totalChildren,
      totalCaregivers,
      totalPackages,
      bookingsToday,
      checkInsToday,
      childrenInCare,
      checkOutsToday,
      openInvoices,
      partialInvoices,
      pendingPayments,
      revenueTodayRows,
      revenueMonthRows,
    ] = await Promise.all([
      c.children.countDocuments(),
      c.caregivers.countDocuments({ status: "Aktif" }),
      c.packages.countDocuments({ status: "Aktif" }),
      c.bookings.countDocuments({ date: today, status: { $ne: "Dibatalkan" } }),
      c.children.countDocuments({ checkInAt: { $gte: day.start, $lte: day.end } }),
      c.children.countDocuments({ status: "Di Daycare" }),
      c.children.countDocuments({ checkOutAt: { $gte: day.start, $lte: day.end } }),
      c.invoices.countDocuments({ status: { $in: ["open", "Belum Dibayar"] } }),
      c.invoices.countDocuments({ status: { $in: ["partial", "Partial"] } }),
      c.payments.countDocuments({ statusVerification: "pending" }),
      c.payments.find({ ...verifiedPayment, paidAt: { $gte: day.start, $lte: day.end } }, { projection: { amount: 1 } }).toArray(),
      c.payments.find({ ...verifiedPayment, paidAt: { $gte: month.start, $lte: month.end } }, { projection: { amount: 1 } }).toArray(),
    ]);
    return {
      operational: { totalChildren, totalCaregivers, totalPackages, bookingsToday, checkInsToday, childrenInCare, checkOutsToday },
      finance: {
        openInvoices,
        partialInvoices,
        pendingPayments,
        revenueToday: revenueTodayRows.reduce((sum, item) => sum + item.amount, 0),
        revenueMonth: revenueMonthRows.reduce((sum, item) => sum + item.amount, 0),
      },
    };
  },

  async listUsers() {
    const users = await collections().users.find({}).sort({ createdAt: 1 }).toArray();
    return users.map(publicUserRecord);
  },

  async createUser(payload: UserPayload) {
    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password ?? "";
    const role = payload.role;
    if (!name || !email || !password || !role || !allowedUserRoles.includes(role)) {
      const error = new Error("Nama, email, password, dan role yang valid wajib diisi");
      Object.assign(error, { status: 400 });
      throw error;
    }
    if (await collections().users.findOne({ email })) {
      const error = new Error("Email sudah digunakan");
      Object.assign(error, { status: 409 });
      throw error;
    }
    const now = new Date();
    const user = { id: `USR-${Date.now()}`, name, email, passwordHash: hashPassword(password), role, isActive: payload.status !== "Nonaktif", createdAt: now, updatedAt: now };
    await collections().users.insertOne(user);
    return publicUserRecord(user);
  },

  async updateUser(id: string, payload: UserPayload) {
    const existing = await collections().users.findOne({ id });
    if (!existing) {
      const error = new Error("User tidak ditemukan");
      Object.assign(error, { status: 404 });
      throw error;
    }
    const name = payload.name?.trim() || existing.name;
    const email = payload.email?.trim().toLowerCase() || existing.email;
    const role = payload.role ?? existing.role;
    if (!allowedUserRoles.includes(role)) {
      const error = new Error("Role tidak valid");
      Object.assign(error, { status: 400 });
      throw error;
    }
    const duplicate = await collections().users.findOne({ email, id: { $ne: id } });
    if (duplicate) {
      const error = new Error("Email sudah digunakan");
      Object.assign(error, { status: 409 });
      throw error;
    }
    const patch = {
      name,
      email,
      role,
      isActive: payload.status ? payload.status === "Aktif" : existing.isActive,
      updatedAt: new Date(),
      ...(payload.password?.trim() ? { passwordHash: hashPassword(payload.password) } : {}),
    };
    await collections().users.updateOne({ id }, { $set: patch });
    return publicUserRecord({ ...existing, ...patch });
  },

  async deleteUser(id: string) {
    const existing = await collections().users.findOne({ id });
    if (!existing) {
      const error = new Error("User tidak ditemukan");
      Object.assign(error, { status: 404 });
      throw error;
    }
    if (existing.role === "super_admin" && await collections().users.countDocuments({ role: "super_admin" }) <= 1) {
      const error = new Error("Super admin terakhir tidak boleh dihapus");
      Object.assign(error, { status: 400 });
      throw error;
    }
    await collections().users.deleteOne({ id });
    return publicUserRecord(existing);
  },

  async listMasterResource(resource: string) {
    const config = masterResourceConfig(resource);
    return config.collection.find({}, { projection: { _id: 0 } }).sort(config.sort).toArray();
  },

  async createMasterResource(resource: string, payload: MasterRecord) {
    const config = masterResourceConfig(resource);
    const now = new Date();
    const document = cleanMasterPayload(await normalizeMasterPayload(resource, payload), now, "create");
    const idValue = document[config.idField];
    if (!idValue) {
      const error = new Error(`${config.idField} is required`);
      Object.assign(error, { status: 400 });
      throw error;
    }
    const exists = await config.collection.findOne({ [config.idField]: idValue }, { projection: { _id: 0 } });
    if (exists) {
      const error = new Error("Master data already exists");
      Object.assign(error, { status: 409 });
      throw error;
    }
    await config.collection.insertOne(document);
    return document;
  },

  async updateMasterResource(resource: string, id: string, payload: MasterRecord) {
    const config = masterResourceConfig(resource);
    const now = new Date();
    const existing = await config.collection.findOne({ [config.idField]: id }, { projection: { _id: 0 } });
    if (!existing) {
      const error = new Error("Master data not found");
      Object.assign(error, { status: 404 });
      throw error;
    }
    const update = cleanMasterPayload(await normalizeMasterPayload(resource, payload, existing), now, "update");
    await config.collection.updateOne({ [config.idField]: id }, { $set: update });
    return { ...existing, ...update };
  },

  async deleteMasterResource(resource: string, id: string) {
    const config = masterResourceConfig(resource);
    const existing = await config.collection.findOne({ [config.idField]: id }, { projection: { _id: 0 } });
    if (!existing) {
      const error = new Error("Master data not found");
      Object.assign(error, { status: 404 });
      throw error;
    }
    await config.collection.deleteOne({ [config.idField]: id });
    return existing;
  },

  async updateDaycareProfile(payload: UpdateDaycareProfilePayload) {
    const now = new Date();
    const current = await collections().daycareProfile.findOne({}, { projection: { _id: 0 } });
    const next: DaycareProfile = {
      name: payload.name?.trim() || current?.name || "Lumi Daycare",
      logo: payload.logo?.trim() || current?.logo,
      address: payload.address?.trim() || current?.address || "",
      phone: payload.phone?.trim() || current?.phone || "",
      email: payload.email?.trim() || current?.email || "",
      website: payload.website?.trim() || current?.website,
      operationalStart: payload.operationalStart?.trim() || current?.operationalStart || "07:00",
      operationalEnd: payload.operationalEnd?.trim() || current?.operationalEnd || "18:00",
      defaultCapacity: Number(payload.defaultCapacity ?? current?.defaultCapacity ?? 0),
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };

    if (!next.name || !next.address || !next.phone || !next.email) {
      const error = new Error("Name, address, phone, and email are required");
      Object.assign(error, { status: 400 });
      throw error;
    }
    if (!Number.isFinite(next.defaultCapacity) || next.defaultCapacity < 0) {
      const error = new Error("Default capacity must be a valid number");
      Object.assign(error, { status: 400 });
      throw error;
    }

    await collections().daycareProfile.updateOne({ name: current?.name ?? next.name }, { $set: next }, { upsert: true });
    return next;
  },

  async createChild(payload: CreateChildPayload) {
    const masterPackage = await findPackageOrThrow(payload.package);
    const now = new Date();
    const parentGuardian = await upsertParentFromPayload(payload, now);
    const child: Child = {
      id: `c${Date.now()}`,
      parentId: parentGuardian.id,
      name: payload.name.trim(),
      age: payload.age.trim(),
      initials: initialsFromName(payload.name),
      parent: payload.parent.trim(),
      parentPhone: payload.parentPhone.trim(),
      allergies: payload.allergies ?? [],
      notes: payload.notes?.trim() || undefined,
      package: payload.package,
      status: "Belum Datang",
      expectedOut: payload.expectedOut || masterPackage.checkOutTime,
      items: payload.items ?? [],
      createdAt: now,
      updatedAt: now,
    };

    await collections().children.insertOne(child);
    const invoice = await upsertCurrentInvoice(child);
    await createPackagePurchaseRecord({ child, masterPackage, invoice });
    return child;
  },

  async purchasePackage(payload: PurchasePackagePayload, actorId = "system") {
    const child = await findChildOrThrow(payload.childId);
    const masterPackage = await findPackageOrThrow(payload.packageName);
    const now = new Date();
    const payNow = Boolean(payload.payNow || payload.paymentStatus === "paid" || payload.paymentStatus === "Lunas");
    const paymentMethod = payload.paymentMethod?.trim();
    if (payNow) {
      if (!paymentMethod) {
        const error = new Error("Metode pembayaran wajib dipilih untuk bayar langsung");
        Object.assign(error, { status: 400 });
        throw error;
      }
      await findPaymentMethodOrThrow(paymentMethod);
    }
    const updatedChild: Child = {
      ...child,
      package: masterPackage.name,
      expectedOut: masterPackage.checkOutTime,
      updatedAt: now,
    };

    await collections().children.updateOne({ id: child.id }, { $set: updatedChild });
    const purchaseId = `PP-${Date.now()}`;
    const invoiceId = await nextInvoiceId();
    const invoice: Invoice = {
      id: invoiceId,
      purchaseId,
      childId: updatedChild.id,
      period: currentPeriod(),
      basePackage: masterPackage.price,
      hours: 0,
      overtimeHours: 0,
      overtimeRate: masterPackage.overtimeFee,
      extras: 0,
      items: [{
        type: "paket",
        referenceId: purchaseId,
        description: masterPackage.name,
        quantity: 1,
        unitPrice: masterPackage.price,
        total: masterPackage.price,
      }],
      status: payNow ? "paid" : "open",
      createdAt: now,
      updatedAt: now,
    };
    await collections().invoices.insertOne(invoice);
    const purchase = await createPackagePurchaseRecord({
      child: updatedChild,
      masterPackage,
      invoice,
      startDate: payload.startDate,
      paymentStatus: payNow ? "paid" : "unpaid",
      purchaseId,
    });
    let payment: Payment | undefined;
    if (payNow) {
      payment = {
        id: `PAY-${Date.now()}`,
        invoiceId,
        method: paymentMethod!,
        amount: masterPackage.price,
        statusVerification: "verified",
        verifiedAt: now,
        verifiedBy: actorId,
        paidAt: now,
        createdAt: now,
        updatedAt: now,
      };
      await collections().payments.insertOne(payment);
    }

    return { child: updatedChild, purchase, invoice: invoiceWithTotal(invoice), payment };
  },

  async createBooking(payload: CreateBookingPayload) {
    await findChildOrThrow(payload.childId);
    const masterPackage = await findPackageOrThrow(payload.packageName);
    const date = payload.date?.trim();
    if (!date || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
      const error = new Error("Booking date is required");
      Object.assign(error, { status: 400 });
      throw error;
    }

    const now = new Date();
    const booking: Booking = {
      id: `BK-${Date.now()}`,
      childId: payload.childId,
      packageCode: masterPackage.code,
      packageName: masterPackage.name,
      date,
      status: "Terjadwal",
      createdAt: now,
      updatedAt: now,
    };

    await collections().bookings.insertOne(booking);
    return booking;
  },

  async checkIn(
    childId: string,
    payload: { items?: string[]; expectedOut?: string; droppedOffBy?: string; caregiver?: string; checkInNotes?: string },
  ) {
    const child = await findChildOrThrow(childId);
    const masterPackage = await packageForChild(child);
    const now = new Date();
    const updated: Child = {
      ...child,
      status: "Di Daycare",
      checkInTime: currentJakartaTime(),
      checkInAt: now,
      droppedOffBy: payload.droppedOffBy?.trim() || child.droppedOffBy,
      caregiver: payload.caregiver?.trim() || child.caregiver,
      checkInNotes: payload.checkInNotes?.trim() || undefined,
      expectedOut: payload.expectedOut || child.expectedOut || masterPackage.checkOutTime,
      items: payload.items?.length ? payload.items : child.items,
      updatedAt: now,
    };

    await collections().children.updateOne({ id: childId }, { $set: updated });
    await collections().bookings.updateOne(
      { childId, date: currentJakartaDate(), status: "Terjadwal" },
      { $set: { status: "Selesai", updatedAt: now } },
    );
    await upsertCurrentInvoice(updated);
    return updated;
  },

  async checkOut(childId: string, payload: CheckOutPayload = {}) {
    const child = await findChildOrThrow(childId);
    const actualOut = currentJakartaTime();
    const now = new Date();
    if (payload.caregiver) {
      await findCaregiverOrThrow(payload.caregiver);
    }
    const additionalFees = await findAdditionalFeesByCode(payload.additionalFeeCodes);
    const extras = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
    const updated: Child = {
      ...child,
      status: "Sudah Pulang",
      checkOutTime: actualOut,
      checkOutAt: now,
      pickedUpBy: payload.pickedUpBy?.trim() || undefined,
      checkOutCaregiver: payload.caregiver?.trim() || undefined,
      checkOutNotes: payload.notes?.trim() || undefined,
      checkOutAdditionalFees: additionalFees.map((fee) => ({ code: fee.code, name: fee.name, amount: fee.amount })),
      updatedAt: now,
    };
    const overtimeHours = calculateOvertimeHours(child.expectedOut, actualOut);
    const invoice = await upsertCurrentInvoice(updated, overtimeHours);
    const invoiceWithExtras: Invoice = {
      ...invoice,
      extras: Math.max(invoice.extras, extras),
      updatedAt: now,
    };

    await collections().children.updateOne({ id: childId }, { $set: updated });
    await collections().invoices.updateOne({ id: invoice.id }, { $set: invoiceWithExtras });
    return { child: updated, invoice: invoiceWithTotal(invoiceWithExtras), actualOut, overtimeHours };
  },

  async createActivity(payload: CreateActivityPayload) {
    await findChildOrThrow(payload.childId);
    await findActivityTypeOrThrow(payload.type);
    await findCaregiverOrThrow(payload.staff);
    const activity: Activity = {
      id: `a${Date.now()}`,
      childId: payload.childId,
      time: payload.time || currentJakartaTime(),
      type: payload.type,
      detail: payload.detail.trim(),
      staff: payload.staff.trim(),
      photoUrl: payload.photoUrl?.trim() || undefined,
      createdAt: new Date(),
    };
    await collections().activities.insertOne(activity);
    return activity;
  },

  async createHealthNote(payload: CreateHealthNotePayload) {
    await findChildOrThrow(payload.childId);
    await findCaregiverOrThrow(payload.handledBy);
    const now = new Date();
    const category = payload.category || "Lainnya";
    const allowedCategories: HealthNote["category"][] = ["Suhu", "Obat", "Alergi", "Luka", "Lainnya"];
    if (!allowedCategories.includes(category)) {
      const error = new Error("Health note category is invalid");
      Object.assign(error, { status: 400 });
      throw error;
    }
    if (!payload.note?.trim()) {
      const error = new Error("Health note is required");
      Object.assign(error, { status: 400 });
      throw error;
    }

    const healthNote: HealthNote = {
      id: `HN-${Date.now()}`,
      childId: payload.childId,
      recordedAt: parseOptionalDate(payload.recordedAt, now),
      category,
      note: payload.note.trim(),
      temperature: payload.temperature === undefined ? undefined : Number(payload.temperature),
      medicationName: payload.medicationName?.trim() || undefined,
      dosage: payload.dosage?.trim() || undefined,
      handledBy: payload.handledBy.trim(),
      parentNotified: Boolean(payload.parentNotified),
      createdAt: now,
      updatedAt: now,
    };

    if (healthNote.temperature !== undefined && !Number.isFinite(healthNote.temperature)) {
      const error = new Error("Temperature must be a valid number");
      Object.assign(error, { status: 400 });
      throw error;
    }

    await collections().healthNotes.insertOne(healthNote);
    return healthNote;
  },

  async createIncident(payload: CreateIncidentPayload) {
    await findChildOrThrow(payload.childId);
    await findCaregiverOrThrow(payload.handledBy);
    const now = new Date();
    const severity = payload.severity || "Ringan";
    const allowedSeverities: Incident["severity"][] = ["Ringan", "Sedang", "Tinggi"];
    if (!allowedSeverities.includes(severity)) {
      const error = new Error("Incident severity is invalid");
      Object.assign(error, { status: 400 });
      throw error;
    }
    if (!payload.title?.trim() || !payload.description?.trim() || !payload.actionTaken?.trim()) {
      const error = new Error("Incident title, description, and action taken are required");
      Object.assign(error, { status: 400 });
      throw error;
    }

    const incident: Incident = {
      id: `INC-${Date.now()}`,
      childId: payload.childId,
      occurredAt: parseOptionalDate(payload.occurredAt, now),
      title: payload.title.trim(),
      description: payload.description.trim(),
      actionTaken: payload.actionTaken.trim(),
      severity,
      handledBy: payload.handledBy.trim(),
      parentNotified: Boolean(payload.parentNotified),
      status: "Ditangani",
      createdAt: now,
      updatedAt: now,
    };

    await collections().incidents.insertOne(incident);
    return incident;
  },

  async createPayment(payload: CreatePaymentPayload) {
    const invoice = await findInvoiceOrThrow(payload.invoiceId);
    await findPaymentMethodOrThrow(payload.method);
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      const error = new Error("Payment amount must be greater than zero");
      Object.assign(error, { status: 400 });
      throw error;
    }

    const now = new Date();
    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      invoiceId: invoice.id,
      method: payload.method.trim(),
      amount,
      proofUrl: payload.proofUrl?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
      statusVerification: "pending",
      paidAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await collections().payments.insertOne(payment);

    const current = await recalculateInvoicePaymentStatus(invoice);
    return { payment, ...current };
  },

  async verifyPayment(paymentId: string, payload: VerifyPaymentPayload = {}, actorId = "system") {
    const payment = await findPaymentOrThrow(paymentId);
    const invoice = await findInvoiceOrThrow(payment.invoiceId);
    const now = new Date();
    const { rejectedAt: _rejectedAt, rejectedBy: _rejectedBy, rejectReason: _rejectReason, ...paymentWithoutRejection } = payment;
    const updatedPayment: Payment = {
      ...paymentWithoutRejection,
      statusVerification: "verified",
      verifiedAt: now,
      verifiedBy: actorId,
      verificationNotes: payload.notes?.trim() || payment.verificationNotes,
      updatedAt: now,
    };
    await collections().payments.updateOne(
      { id: payment.id },
      {
        $set: {
          statusVerification: "verified",
          verifiedAt: now,
          verifiedBy: actorId,
          verificationNotes: updatedPayment.verificationNotes,
          updatedAt: now,
        },
        $unset: { rejectedAt: "", rejectedBy: "", rejectReason: "" },
      },
    );
    const current = await recalculateInvoicePaymentStatus(invoice);
    return { payment: updatedPayment, ...current };
  },

  async rejectPayment(paymentId: string, payload: VerifyPaymentPayload = {}, actorId = "system") {
    const payment = await findPaymentOrThrow(paymentId);
    const invoice = await findInvoiceOrThrow(payment.invoiceId);
    const now = new Date();
    const reason = payload.reason?.trim() || payload.notes?.trim();
    if (!reason) {
      const error = new Error("Alasan penolakan wajib diisi");
      Object.assign(error, { status: 400 });
      throw error;
    }
    const { verifiedAt: _verifiedAt, verifiedBy: _verifiedBy, ...paymentWithoutVerification } = payment;
    const updatedPayment: Payment = {
      ...paymentWithoutVerification,
      statusVerification: "rejected",
      rejectedAt: now,
      rejectedBy: actorId,
      rejectReason: reason,
      verificationNotes: reason,
      updatedAt: now,
    };
    await collections().payments.updateOne(
      { id: payment.id },
      {
        $set: {
          statusVerification: "rejected",
          rejectedAt: now,
          rejectedBy: actorId,
          rejectReason: reason,
          verificationNotes: reason,
          updatedAt: now,
        },
        $unset: { verifiedAt: "", verifiedBy: "" },
      },
    );
    const current = await recalculateInvoicePaymentStatus(invoice);
    return { payment: updatedPayment, ...current };
  },

  async recalculateInvoices() {
    const activeChildren = await collections()
      .children.find({ status: { $ne: "Belum Datang" } }, { projection: { _id: 0 } })
      .toArray();

    await Promise.all(activeChildren.map((child) => upsertCurrentInvoice(child)));
    const invoices = await collections().invoices.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return invoices.map(invoiceWithTotal);
  },
};
