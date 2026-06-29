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
  checkInAt?: string;
  droppedOffBy?: string;
  caregiver?: string;
  checkInNotes?: string;
  checkOutTime?: string;
  checkOutAt?: string;
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

export type Activity = {
  id: string;
  childId: string;
  time: string;
  type: string;
  detail: string;
  staff: string;
  photoUrl?: string;
  createdAt?: string;
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
  status: "open" | "partial" | "paid" | "cancel" | "Lunas" | "Belum Dibayar" | "Partial" | "Overdue";
  purchaseId?: string;
  createdAt?: string;
};

export function invoiceTotal(i: Invoice) {
  return i.basePackage + i.overtimeHours * i.overtimeRate + i.extras;
}

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
