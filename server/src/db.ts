import { MongoClient, type Collection, type Db } from "mongodb";
import {
  seedActivities,
  seedActivityTypes,
  seedAdditionalFees,
  seedAgeGroups,
  seedAnnouncements,
  seedCaregivers,
  seedChildren,
  seedInvoices,
  seedDaycareProfile,
  seedHolidays,
  seedPackages,
  seedPaymentMethods,
  seedParents,
  seedRooms,
  seedShifts,
} from "./seed.js";
import type {
  Activity,
  Booking,
  Child,
  DaycareProfile,
  HealthNote,
  Incident,
  Invoice,
  MasterActivity,
  MasterAdditionalFee,
  MasterAgeGroup,
  MasterAnnouncement,
  MasterCaregiver,
  MasterHoliday,
  MasterPackage,
  MasterPaymentMethod,
  MasterRoom,
  MasterShift,
  PackagePurchase,
  Payment,
  ParentGuardian,
  User,
} from "./types.js";
import { hashPassword } from "./auth-utils.js";

let client: MongoClient | undefined;
let db: Db | undefined;

export type Collections = {
  children: Collection<Child>;
  parents: Collection<ParentGuardian>;
  packagePurchases: Collection<PackagePurchase>;
  bookings: Collection<Booking>;
  activities: Collection<Activity>;
  healthNotes: Collection<HealthNote>;
  incidents: Collection<Incident>;
  invoices: Collection<Invoice>;
  payments: Collection<Payment>;
  caregivers: Collection<MasterCaregiver>;
  packages: Collection<MasterPackage>;
  activityTypes: Collection<MasterActivity>;
  ageGroups: Collection<MasterAgeGroup>;
  rooms: Collection<MasterRoom>;
  shifts: Collection<MasterShift>;
  additionalFees: Collection<MasterAdditionalFee>;
  announcements: Collection<MasterAnnouncement>;
  paymentMethods: Collection<MasterPaymentMethod>;
  holidays: Collection<MasterHoliday>;
  daycareProfile: Collection<DaycareProfile>;
  users: Collection<User>;
};

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db();

  await ensureIndexes();
  await seedIfEmpty();

  return db;
}

export function collections(): Collections {
  if (!db) {
    throw new Error("Database is not connected");
  }
  return {
    children: db.collection<Child>("children"),
    parents: db.collection<ParentGuardian>("parents"),
    packagePurchases: db.collection<PackagePurchase>("package_purchases"),
    bookings: db.collection<Booking>("bookings"),
    activities: db.collection<Activity>("activities"),
    healthNotes: db.collection<HealthNote>("tt_catatan_kesehatan"),
    incidents: db.collection<Incident>("tt_insiden"),
    invoices: db.collection<Invoice>("invoices"),
    payments: db.collection<Payment>("payments"),
    caregivers: db.collection<MasterCaregiver>("master_caregivers"),
    packages: db.collection<MasterPackage>("master_packages"),
    activityTypes: db.collection<MasterActivity>("master_activities"),
    ageGroups: db.collection<MasterAgeGroup>("master_age_groups"),
    rooms: db.collection<MasterRoom>("master_rooms"),
    shifts: db.collection<MasterShift>("tm_shift"),
    additionalFees: db.collection<MasterAdditionalFee>("master_additional_fees"),
    announcements: db.collection<MasterAnnouncement>("master_announcements"),
    paymentMethods: db.collection<MasterPaymentMethod>("master_payment_methods"),
    holidays: db.collection<MasterHoliday>("tp_hari_libur"),
    daycareProfile: db.collection<DaycareProfile>("tp_profil_daycare"),
    users: db.collection<User>("users"),
  };
}

export async function closeDatabase() {
  await client?.close();
}

async function ensureIndexes() {
  const c = collections();
  await Promise.all([
    c.children.createIndex({ id: 1 }, { unique: true }),
    c.parents.createIndex({ id: 1 }, { unique: true }),
    c.parents.createIndex({ primaryPhone: 1 }),
    c.parents.createIndex({ email: 1 }, { sparse: true }),
    c.packagePurchases.createIndex({ id: 1 }, { unique: true }),
    c.packagePurchases.createIndex({ childId: 1, status: 1 }),
    c.bookings.createIndex({ id: 1 }, { unique: true }),
    c.bookings.createIndex({ childId: 1, date: 1 }),
    c.bookings.createIndex({ date: 1, status: 1 }),
    c.children.createIndex({ status: 1 }),
    c.activities.createIndex({ id: 1 }, { unique: true }),
    c.activities.createIndex({ childId: 1, time: -1 }),
    c.healthNotes.createIndex({ id: 1 }, { unique: true }),
    c.healthNotes.createIndex({ childId: 1, recordedAt: -1 }),
    c.incidents.createIndex({ id: 1 }, { unique: true }),
    c.incidents.createIndex({ childId: 1, occurredAt: -1 }),
    c.incidents.createIndex({ status: 1, severity: 1 }),
    c.invoices.createIndex({ id: 1 }, { unique: true }),
    c.invoices.createIndex({ childId: 1, period: 1 }, { unique: true }),
    c.payments.createIndex({ id: 1 }, { unique: true }),
    c.payments.createIndex({ invoiceId: 1, paidAt: -1 }),
    c.payments.createIndex({ statusVerification: 1, paidAt: -1 }),
    c.caregivers.createIndex({ code: 1 }, { unique: true }),
    c.packages.createIndex({ code: 1 }, { unique: true }),
    c.packages.createIndex({ name: 1 }, { unique: true }),
    c.activityTypes.createIndex({ code: 1 }, { unique: true }),
    c.activityTypes.createIndex({ name: 1 }, { unique: true }),
    c.ageGroups.createIndex({ code: 1 }, { unique: true }),
    c.rooms.createIndex({ code: 1 }, { unique: true }),
    c.shifts.createIndex({ code: 1 }, { unique: true }),
    c.additionalFees.createIndex({ code: 1 }, { unique: true }),
    c.paymentMethods.createIndex({ name: 1 }, { unique: true }),
    c.holidays.createIndex({ date: 1 }, { unique: true }),
    c.daycareProfile.createIndex({ name: 1 }, { unique: true }),
    c.users.createIndex({ email: 1 }, { unique: true }),
    c.users.createIndex({ id: 1 }, { unique: true }),
  ]);
}

async function seedIfEmpty() {
  const c = collections();
  const [
    childCount,
    parentCount,
    caregiverCount,
    packageCount,
    activityTypeCount,
    ageGroupCount,
    roomCount,
    shiftCount,
    additionalFeeCount,
    announcementCount,
    paymentMethodCount,
    holidayCount,
    daycareProfileCount,
    userCount,
  ] = await Promise.all([
    c.children.countDocuments(),
    c.parents.countDocuments(),
    c.caregivers.countDocuments(),
    c.packages.countDocuments(),
    c.activityTypes.countDocuments(),
    c.ageGroups.countDocuments(),
    c.rooms.countDocuments(),
    c.shifts.countDocuments(),
    c.additionalFees.countDocuments(),
    c.announcements.countDocuments(),
    c.paymentMethods.countDocuments(),
    c.holidays.countDocuments(),
    c.daycareProfile.countDocuments(),
    c.users.countDocuments(),
  ]);

  const tasks: Promise<unknown>[] = [];
  if (childCount === 0) {
    tasks.push(c.children.insertMany(seedChildren));
    tasks.push(c.activities.insertMany(seedActivities));
    tasks.push(c.invoices.insertMany(seedInvoices));
  }
  if (parentCount === 0) tasks.push(c.parents.insertMany(seedParents));
  if (caregiverCount === 0) tasks.push(c.caregivers.insertMany(seedCaregivers));
  if (packageCount === 0) tasks.push(c.packages.insertMany(seedPackages));
  if (activityTypeCount === 0) tasks.push(c.activityTypes.insertMany(seedActivityTypes));
  if (ageGroupCount === 0) tasks.push(c.ageGroups.insertMany(seedAgeGroups));
  if (roomCount === 0) tasks.push(c.rooms.insertMany(seedRooms));
  if (shiftCount === 0) tasks.push(c.shifts.insertMany(seedShifts));
  if (additionalFeeCount === 0) tasks.push(c.additionalFees.insertMany(seedAdditionalFees));
  if (announcementCount === 0) tasks.push(c.announcements.insertMany(seedAnnouncements));
  if (paymentMethodCount === 0) tasks.push(c.paymentMethods.insertMany(seedPaymentMethods));
  if (holidayCount === 0) tasks.push(c.holidays.insertMany(seedHolidays));
  if (daycareProfileCount === 0) tasks.push(c.daycareProfile.insertOne(seedDaycareProfile));
  if (userCount === 0) {
    tasks.push(
      c.users.insertOne({
        id: "USR-00001",
        name: "Nagatech RnD",
        email: "rnd@nagatech.id",
        passwordHash: hashPassword("berasputih"),
        role: "super_admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }

  await Promise.all(tasks);
  await backfillParentsFromChildren();
  await backfillPackagePurchasesFromChildren();
}

function parentIdFromPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `p-${digits || Date.now()}`;
}

function splitParentName(displayName: string) {
  return displayName.replace(/^(Bunda|Ayah|Ibu|Mama|Papa|Mami|Papi)\s+/i, "").trim() || displayName.trim();
}

async function backfillParentsFromChildren() {
  const c = collections();
  const children = await c.children
    .find({}, { projection: { _id: 0, id: 1, parentId: 1, parent: 1, parentPhone: 1, createdAt: 1, updatedAt: 1 } })
    .toArray();

  await Promise.all(
    children.map(async (child) => {
      const parentId = child.parentId || parentIdFromPhone(child.parentPhone);
      const now = new Date();
      const displayName = child.parent.trim();
      const primaryPhone = child.parentPhone.trim();
      const parentPatch: Partial<ParentGuardian> = displayName.toLowerCase().startsWith("ayah")
        ? { fatherName: splitParentName(displayName), fatherPhone: primaryPhone }
        : { motherName: splitParentName(displayName), motherPhone: primaryPhone };

      await c.parents.updateOne(
        { id: parentId },
        {
          $setOnInsert: {
            id: parentId,
            displayName,
            primaryPhone,
            createdAt: child.createdAt ?? now,
          },
          $set: {
            ...parentPatch,
            updatedAt: child.updatedAt ?? now,
          },
        },
        { upsert: true },
      );

      if (!child.parentId) {
        await c.children.updateOne({ id: child.id }, { $set: { parentId, updatedAt: now } });
      }
    }),
  );
}

async function backfillPackagePurchasesFromChildren() {
  const c = collections();
  const existingCount = await c.packagePurchases.countDocuments();
  if (existingCount > 0) return;

  const [children, packages, invoices] = await Promise.all([
    c.children.find({}, { projection: { _id: 0 } }).toArray(),
    c.packages.find({}, { projection: { _id: 0 } }).toArray(),
    c.invoices.find({}, { projection: { _id: 0 } }).toArray(),
  ]);
  const now = new Date();
  const packageByName = new Map(packages.map((item) => [item.name, item]));
  const invoiceByChildId = new Map(invoices.map((invoice) => [invoice.childId, invoice]));

  const purchases = children.flatMap((child): PackagePurchase[] => {
    const masterPackage = packageByName.get(child.package);
    if (!masterPackage) return [];
    const invoice = invoiceByChildId.get(child.id);
    return [
      {
        id: `PP-${child.id}-${masterPackage.code}`,
        childId: child.id,
        packageCode: masterPackage.code,
        packageName: masterPackage.name,
        packageType: masterPackage.type,
        price: masterPackage.price,
        startDate: child.createdAt.toISOString().slice(0, 10),
        visitQuota: masterPackage.visitQuota,
        visitsUsed: child.status === "Belum Datang" ? 0 : 1,
        status: "Aktif",
        paymentStatus: invoice?.status === "Lunas" ? "Lunas" : "Belum Dibayar",
        invoiceId: invoice?.id,
        createdAt: child.createdAt ?? now,
        updatedAt: child.updatedAt ?? now,
      },
    ];
  });

  if (purchases.length > 0) {
    await c.packagePurchases.insertMany(purchases, { ordered: false });
  }
}
