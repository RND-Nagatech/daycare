import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { daycareApi, daycareQueryKey, type InvoiceWithTotal, type MasterPackage, type Payment } from "@/lib/daycare-api";
import type { Child } from "@/lib/daycare-data";
import { formatIDR } from "@/lib/daycare-data";
import { Download, PackagePlus, ReceiptText, Send } from "lucide-react";
import { toast } from "sonner";
import { ModalForm } from "@/components/common/modal-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Tagihan — Lumi Daycare" },
      { name: "description", content: "Kalkulasi tarif paket dan denda overtime otomatis, transparan untuk orang tua." },
    ],
  }),
  component: () => <Navigate to="/keuangan/tagihan" replace />,
});

const statusTone: Record<string, string> = {
  Lunas: "bg-success/20 text-success-foreground",
  "Belum Dibayar": "bg-warning/25 text-warning-foreground",
  Partial: "bg-primary/15 text-primary",
  Overdue: "bg-destructive/15 text-destructive",
};

const verificationTone: Record<string, string> = {
  pending: "bg-warning/25 text-warning-foreground",
  verified: "bg-success/20 text-success-foreground",
  rejected: "bg-destructive/15 text-destructive",
};

function isVerifiedPayment(payment: Payment) {
  return !payment.statusVerification || payment.statusVerification === "verified";
}

export type FinancePageMode = "purchase" | "invoices" | "payments";

export function FinanceFeaturePage({ mode }: { mode: FinancePageMode }) {
  const queryClient = useQueryClient();
  const [activeForm, setActiveForm] = useState<"package" | "payment" | null>(null);
  const [verification, setVerification] = useState<{ id: string; action: "verify" | "reject" } | null>(null);
  const { data, isLoading } = useQuery({ queryKey: daycareQueryKey, queryFn: daycareApi.snapshot });
  const recalculate = useMutation({
    mutationFn: daycareApi.recalculateInvoices,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: daycareQueryKey }); toast.success("Tagihan berhasil dihitung ulang"); },
    onError: (error) => toast.error(error.message),
  });
  const purchasePackage = useMutation({
    mutationFn: daycareApi.purchasePackage,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: daycareQueryKey }); setActiveForm(null); toast.success("Paket berhasil diaktifkan"); },
    onError: (error) => toast.error(error.message),
  });
  const createPayment = useMutation({
    mutationFn: daycareApi.createPayment,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: daycareQueryKey }); setActiveForm(null); toast.success("Pembayaran berhasil dicatat"); },
    onError: (error) => toast.error(error.message),
  });
  const verifyPayment = useMutation({
    mutationFn: (paymentId: string) => daycareApi.verifyPayment(paymentId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: daycareQueryKey }); setVerification(null); toast.success("Pembayaran berhasil diverifikasi"); },
    onError: (error) => toast.error(error.message),
  });
  const rejectPayment = useMutation({
    mutationFn: (paymentId: string) => daycareApi.rejectPayment(paymentId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: daycareQueryKey }); setVerification(null); toast.success("Pembayaran ditolak"); },
    onError: (error) => toast.error(error.message),
  });
  const invoices = data?.invoices ?? [];
  const children = data?.children ?? [];
  const payments = data?.payments ?? [];
  const packagePurchases = data?.packagePurchases ?? [];
  const packages = data?.masterData.packages.filter((item) => item.status === "Aktif") ?? [];
  const paymentMethods = data?.masterData.paymentMethods.filter((item) => item.status === "Aktif") ?? [];
  const childById = (id: string) => children.find((child) => child.id === id);
  const paidByInvoice = new Map<string, number>();
  payments.forEach((payment) => {
    if (isVerifiedPayment(payment)) {
      paidByInvoice.set(payment.invoiceId, (paidByInvoice.get(payment.invoiceId) ?? 0) + payment.amount);
    }
  });
  const total = invoices.reduce((s, i) => s + i.total, 0);
  const outstanding = invoices.reduce((sum, invoice) => sum + Math.max(invoice.total - (paidByInvoice.get(invoice.id) ?? 0), 0), 0);
  const overtimeTotal = invoices.reduce((s, i) => s + i.overtimeHours * i.overtimeRate, 0);
  const pageCopy = {
    purchase: { title: "Pembelian Paket", description: "Aktifkan paket anak dari master paket dan simpan snapshot transaksi." },
    invoices: { title: "Tagihan", description: "Kelola tarif paket, biaya tambahan, dan denda overtime secara akurat." },
    payments: { title: "Pembayaran", description: "Catat dan verifikasi pembayaran terhadap tagihan anak." },
  }[mode];

  return (
    <AppShell
      title={pageCopy.title}
      description={pageCopy.description}
      actions={mode === "purchase" ? <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground" onClick={() => setActiveForm("package")}><PackagePlus className="size-4" /> Beli Paket</button> : mode === "payments" ? <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground" onClick={() => setActiveForm("payment")}><ReceiptText className="size-4" /> Catat Pembayaran</button> : <button
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          disabled={recalculate.isPending}
          onClick={() => recalculate.mutate()}
        >
          <Send className="size-4" /> {recalculate.isPending ? "Menghitung..." : "Hitung Ulang"}
        </button>}
    >
      {mode === "purchase" && <ModalForm open={activeForm === "package"} onOpenChange={(open) => { if (!open) setActiveForm(null); }} title="Pembelian Paket" showHeader={false}>
        {activeForm === "package" && <PurchasePackageForm children={children} packages={packages} isSaving={purchasePackage.isPending} onCancel={() => setActiveForm(null)} onSubmit={(payload) => purchasePackage.mutate(payload)} />}
      </ModalForm>}
      {mode === "payments" && <ModalForm open={activeForm === "payment"} onOpenChange={(open) => { if (!open) setActiveForm(null); }} title="Catat Pembayaran" showHeader={false}>
        {activeForm === "payment" && <PaymentForm invoices={invoices} children={children} payments={payments} methods={paymentMethods.map((item) => item.name)} isSaving={createPayment.isPending} onCancel={() => setActiveForm(null)} onSubmit={(payload) => createPayment.mutate(payload)} />}
      </ModalForm>}
      {isLoading && <div className="mb-4 rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] p-3 text-sm text-muted-foreground">Memuat tagihan...</div>}
      {mode === "invoices" && <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card label="Total ditagihkan" value={formatIDR(total)} />
        <Card label="Belum dibayar" value={formatIDR(outstanding)} accent />
        <Card label="Pendapatan overtime" value={formatIDR(overtimeTotal)} />
      </div>}

      {mode === "purchase" && <div className="mb-6">
        <div className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-display text-lg">Riwayat Paket</h2>
              <p className="text-sm text-muted-foreground">Transaksi paket aktif dari master paket.</p>
            </div>
            <span className="text-xs text-muted-foreground">{packagePurchases.length} transaksi</span>
          </div>
          <ul className="divide-y divide-border">
            {packagePurchases.slice(0, 5).map((purchase) => {
              const child = childById(purchase.childId);
              return (
                <li key={purchase.id} className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="font-medium">{child?.name ?? "Anak tidak ditemukan"}</div>
                    <div className="text-xs text-muted-foreground">
                      {purchase.packageName} · Mulai {purchase.startDate} · {purchase.packageType}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-display">{formatIDR(purchase.price)}</div>
                    <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[11px] ${purchase.paymentStatus === "Lunas" ? statusTone.Lunas : statusTone["Belum Dibayar"]}`}>
                      {purchase.paymentStatus}
                    </span>
                  </div>
                </li>
              );
            })}
            {packagePurchases.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">Belum ada pembelian paket.</li>
            )}
          </ul>
        </div>
      </div>}

      {mode === "payments" && <div className="mb-6">
        <div className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-display text-lg">Riwayat Pembayaran</h2>
              <p className="text-sm text-muted-foreground">Pembayaran yang tercatat ke tagihan.</p>
            </div>
            <span className="text-xs text-muted-foreground">{payments.length} pembayaran</span>
          </div>
          <ul className="divide-y divide-border">
            {payments.slice(0, 5).map((payment) => {
              const invoice = invoices.find((item) => item.id === payment.invoiceId);
              const child = invoice ? childById(invoice.childId) : undefined;
              const status = payment.statusVerification ?? "verified";
              return (
                <li key={payment.id} className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="font-medium">{payment.invoiceId} · {child?.name ?? "Anak tidak ditemukan"}</div>
                    <div className="text-xs text-muted-foreground">{payment.method} · {new Date(payment.paidAt).toLocaleDateString("id-ID")}</div>
                    {payment.notes && <div className="mt-1 text-xs text-muted-foreground">{payment.notes}</div>}
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-display">{formatIDR(payment.amount)}</div>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${verificationTone[status]}`}>
                      {status}
                    </span>
                    {payment.proofUrl && (
                      <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="ml-2 text-xs text-primary hover:underline">
                        Bukti bayar
                      </a>
                    )}
                    {status === "pending" && (
                      <div className="mt-2 flex justify-start gap-2 sm:justify-end">
                        <button
                          className="rounded-lg border border-success/30 px-2 py-1 text-xs text-success-foreground hover:bg-success/10 disabled:opacity-60"
                          disabled={verifyPayment.isPending || rejectPayment.isPending}
                          onClick={() => setVerification({ id: payment.id, action: "verify" })}
                        >
                          Verify
                        </button>
                        <button
                          className="rounded-lg border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"
                          disabled={verifyPayment.isPending || rejectPayment.isPending}
                          onClick={() => setVerification({ id: payment.id, action: "reject" })}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
            {payments.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">Belum ada pembayaran.</li>
            )}
          </ul>
        </div>
      </div>}

      {mode === "invoices" && <div className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] overflow-hidden">
        <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-muted-foreground px-5 py-3 border-b border-border bg-surface/50">
          <div className="col-span-3">Invoice</div>
          <div className="col-span-3">Anak</div>
          <div className="col-span-2">Paket</div>
          <div className="col-span-2">Overtime</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
        <ul className="divide-y divide-border">
          {invoices.map((i) => {
            const child = childById(i.childId);
            const ot = i.overtimeHours * i.overtimeRate;
            return (
              <li key={i.id} className="grid grid-cols-12 items-center px-5 py-4 text-sm">
                <div className="col-span-3">
                  <div className="font-medium">{i.id}</div>
                  <div className="text-xs text-muted-foreground">{i.period}</div>
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-accent text-accent-foreground grid place-items-center text-xs font-semibold">{child?.initials}</div>
                  <div className="min-w-0">
                    <div className="truncate">{child?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{child?.parent}</div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div>{formatIDR(i.basePackage)}</div>
                  <div className="text-xs text-muted-foreground">{i.hours} hari · {child?.package}</div>
                </div>
                <div className="col-span-2">
                  {i.overtimeHours > 0 ? (
                    <>
                      <div>{formatIDR(ot)}</div>
                      <div className="text-xs text-muted-foreground">{i.overtimeHours}j × {formatIDR(i.overtimeRate)}</div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="col-span-2 text-right">
                  <div className="font-display text-base">{formatIDR(i.total)}</div>
                  {paidByInvoice.get(i.id) ? (
                    <div className="text-xs text-muted-foreground">dibayar {formatIDR(paidByInvoice.get(i.id) ?? 0)}</div>
                  ) : null}
                  <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full ${statusTone[i.status]}`}>{i.status}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface/50">
          <span className="text-xs text-muted-foreground">{invoices.length} invoice ditampilkan</span>
          <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] hover:bg-surface">
            <Download className="size-3.5" /> Ekspor CSV
          </button>
        </div>
      </div>}
      {mode === "payments" && <ConfirmDialog open={Boolean(verification)} onOpenChange={(open) => { if (!open) setVerification(null); }} title={verification?.action === "reject" ? "Tolak pembayaran?" : "Verifikasi pembayaran?"} description={verification?.action === "reject" ? "Pembayaran akan ditandai ditolak dan tidak mengurangi sisa tagihan." : "Nominal pembayaran akan dihitung ke tagihan terkait."} confirmLabel={verification?.action === "reject" ? "Tolak" : "Verifikasi"} destructive={verification?.action === "reject"} loading={verifyPayment.isPending || rejectPayment.isPending} onConfirm={() => { if (!verification) return; if (verification.action === "verify") verifyPayment.mutate(verification.id); else rejectPayment.mutate(verification.id); }} />}
    </AppShell>
  );
}

function remainingAmount(invoice: InvoiceWithTotal, payments: Payment[]) {
  const paid = payments
    .filter((payment) => payment.invoiceId === invoice.id && isVerifiedPayment(payment))
    .reduce((sum, payment) => sum + payment.amount, 0);
  return Math.max(invoice.total - paid, 0);
}

function PaymentForm({
  invoices,
  children,
  payments,
  methods,
  isSaving,
  onSubmit,
  onCancel,
}: {
  invoices: InvoiceWithTotal[];
  children: Child[];
  payments: Payment[];
  methods: string[];
  isSaving: boolean;
  onSubmit: (payload: { invoiceId: string; method: string; amount: number; proofUrl?: string; notes?: string }) => void;
  onCancel: () => void;
}) {
  const payableInvoices = useMemo(
    () => invoices.filter((invoice) => remainingAmount(invoice, payments) > 0),
    [invoices, payments],
  );
  const [form, setForm] = useState({
    invoiceId: payableInvoices[0]?.id ?? "",
    method: methods[0] ?? "",
    amount: payableInvoices[0] ? String(remainingAmount(payableInvoices[0], payments)) : "",
    proofUrl: "",
    notes: "",
  });
  const selectedInvoice = invoices.find((invoice) => invoice.id === form.invoiceId);
  const selectedRemaining = selectedInvoice ? remainingAmount(selectedInvoice, payments) : 0;

  useEffect(() => {
    setForm((current) => {
      const nextInvoiceId = current.invoiceId || payableInvoices[0]?.id || "";
      const invoice = invoices.find((item) => item.id === nextInvoiceId);
      const nextMethod = current.method || methods[0] || "";
      const nextAmount = current.amount || (invoice ? String(remainingAmount(invoice, payments)) : "");
      if (current.invoiceId === nextInvoiceId && current.method === nextMethod && current.amount === nextAmount) {
        return current;
      }
      return {
        ...current,
        invoiceId: nextInvoiceId,
        method: nextMethod,
        amount: nextAmount,
      };
    });
  }, [invoices, methods, payableInvoices, payments]);

  return (
    <form
      className="bg-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.invoiceId || !form.method || !form.amount) { toast.error("Tagihan, metode, dan nominal wajib diisi"); return; }
        onSubmit({
          invoiceId: form.invoiceId,
          method: form.method,
          amount: Number(form.amount),
          proofUrl: form.proofUrl || undefined,
          notes: form.notes || undefined,
        });
        setForm({ ...form, amount: "", proofUrl: "", notes: "" });
      }}
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
          <ReceiptText className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg">Catat Pembayaran</h2>
          <p className="text-sm text-muted-foreground">Tagihan, metode, nominal, dan bukti bayar.</p>
        </div>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Tagihan</span>
          <select
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            value={form.invoiceId}
            onChange={(event) => {
              const invoice = invoices.find((item) => item.id === event.target.value);
              setForm({ ...form, invoiceId: event.target.value, amount: invoice ? String(remainingAmount(invoice, payments)) : "" });
            }}
          >
            {payableInvoices.map((invoice) => {
              const child = children.find((item) => item.id === invoice.childId);
              return (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.id} · {child?.name ?? "Tanpa anak"}
                </option>
              );
            })}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Metode</span>
          <select
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            value={form.method}
            onChange={(event) => setForm({ ...form, method: event.target.value })}
          >
            {methods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Nominal</span>
          <input
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            type="number"
            min="1"
            max={selectedRemaining || undefined}
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Bukti bayar</span>
          <input
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            placeholder="URL bukti opsional"
            value={form.proofUrl}
            onChange={(event) => setForm({ ...form, proofUrl: event.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Catatan pembayaran</span>
          <input
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            placeholder="Opsional, misalnya transfer dari rekening orang tua"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <div className="text-sm text-muted-foreground">
          {selectedInvoice ? `Sisa tagihan ${formatIDR(selectedRemaining)}` : "Pilih tagihan"}
        </div>
        <div className="flex gap-2"><button type="button" className="rounded-md border border-border px-4 py-2.5 text-sm font-medium" onClick={onCancel}>Batal</button><button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={isSaving || !payableInvoices.length || !methods.length}>
          <ReceiptText className="size-4" /> {isSaving ? "Menyimpan..." : "Catat Pembayaran"}
        </button></div>
      </div>
    </form>
  );
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function PurchasePackageForm({
  children,
  packages,
  isSaving,
  onSubmit,
  onCancel,
}: {
  children: Child[];
  packages: MasterPackage[];
  isSaving: boolean;
  onSubmit: (payload: { childId: string; packageName: string; startDate: string; paymentStatus: "Belum Dibayar" | "Lunas" }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    childId: children[0]?.id ?? "",
    packageName: packages[0]?.name ?? "",
    startDate: todayDate(),
    paymentStatus: "Belum Dibayar" as "Belum Dibayar" | "Lunas",
  });
  const selectedPackage = packages.find((item) => item.name === form.packageName);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      childId: current.childId || children[0]?.id || "",
      packageName: current.packageName || packages[0]?.name || "",
    }));
  }, [children, packages]);

  return (
    <form
      className="bg-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.childId || !form.packageName) { toast.error("Anak dan paket wajib dipilih"); return; }
        onSubmit(form);
      }}
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
          <PackagePlus className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg">Pembelian Paket</h2>
          <p className="text-sm text-muted-foreground">Aktifkan paket dari master data dan buat invoice otomatis.</p>
        </div>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Anak</span>
          <select
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            value={form.childId}
            onChange={(event) => setForm({ ...form, childId: event.target.value })}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Paket</span>
          <select
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            value={form.packageName}
            onChange={(event) => setForm({ ...form, packageName: event.target.value })}
          >
            {packages.map((item) => (
              <option key={item.code} value={item.name}>
                {item.name} · {formatIDR(item.price)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Tanggal mulai</span>
          <input
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            type="date"
            value={form.startDate}
            onChange={(event) => setForm({ ...form, startDate: event.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Status pembayaran</span>
          <select
            className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            value={form.paymentStatus}
            onChange={(event) => setForm({ ...form, paymentStatus: event.target.value as "Belum Dibayar" | "Lunas" })}
          >
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="Lunas">Lunas</option>
          </select>
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <div className="text-sm text-muted-foreground">
          {selectedPackage ? `${selectedPackage.type} · ${formatIDR(selectedPackage.price)} · Overtime ${formatIDR(selectedPackage.overtimeFee)}/jam` : "Pilih paket"}
        </div>
        <div className="flex gap-2"><button type="button" className="rounded-md border border-border px-4 py-2.5 text-sm font-medium" onClick={onCancel}>Batal</button><button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={isSaving || !children.length || !packages.length}>
          <PackagePlus className="size-4" /> {isSaving ? "Menyimpan..." : "Aktifkan Paket"}
        </button></div>
      </div>
    </form>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={"rounded-lg border p-5 " + (accent ? "border-primary/30 bg-primary/5" : "border-border bg-card")}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-2">{value}</div>
    </div>
  );
}
