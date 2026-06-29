import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { daycareApi, daycareQueryKey } from "@/lib/daycare-api";
import { formatIDR } from "@/lib/daycare-data";
import { Activity, BarChart3, CreditCard, Download, Users } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Laporan — Lumi Daycare" },
      { name: "description", content: "Ringkasan laporan tagihan, pembayaran, kehadiran, dan aktivitas daycare." },
    ],
  }),
  component: () => <Navigate to="/laporan/$report" params={{ report: "kehadiran" }} replace />,
});

function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: daycareQueryKey, queryFn: daycareApi.snapshot });
  const children = data?.children ?? [];
  const invoices = data?.invoices ?? [];
  const payments = data?.payments ?? [];
  const activities = data?.activities ?? [];

  const invoiceTotal = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = Math.max(invoiceTotal - paidTotal, 0);
  const overtimeTotal = invoices.reduce((sum, invoice) => sum + invoice.overtimeHours * invoice.overtimeRate, 0);
  const attendance = {
    here: children.filter((child) => child.status === "Di Daycare").length,
    left: children.filter((child) => child.status === "Sudah Pulang").length,
    notArrived: children.filter((child) => child.status === "Belum Datang").length,
  };
  const activityRows = countBy(activities.map((item) => item.type));
  const paymentRows = countAmountBy(payments, (payment) => payment.method);
  const maxActivity = Math.max(...activityRows.map((row) => row.count), 1);
  const maxPayment = Math.max(...paymentRows.map((row) => row.amount), 1);

  return (
    <AppShell
      title="Laporan"
      description="Ringkasan tagihan, pembayaran, kehadiran, dan aktivitas dari transaksi daycare."
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-surface"
          onClick={() => exportReportCsv({ invoiceTotal, paidTotal, outstanding, overtimeTotal, attendance, activityRows, paymentRows })}
        >
          <Download className="size-4" /> Ekspor Ringkasan
        </button>
      }
    >
      {isLoading && (
        <div className="mb-4 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground shadow-[0_4px_20px_rgba(155,135,245,0.08)]">
          Memuat laporan...
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BarChart3} label="Total tagihan" value={formatIDR(invoiceTotal)} />
        <MetricCard icon={CreditCard} label="Pembayaran masuk" value={formatIDR(paidTotal)} />
        <MetricCard icon={CreditCard} label="Belum dibayar" value={formatIDR(outstanding)} accent />
        <MetricCard icon={Activity} label="Overtime" value={formatIDR(overtimeTotal)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)]">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Users className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg">Kehadiran Hari Ini</h2>
              <p className="text-sm text-muted-foreground">Status anak dari proses check-in dan check-out.</p>
            </div>
          </div>
          <div className="grid gap-3 p-5">
            <ReportLine label="Di daycare" value={`${attendance.here} anak`} />
            <ReportLine label="Sudah pulang" value={`${attendance.left} anak`} />
            <ReportLine label="Belum datang" value={`${attendance.notArrived} anak`} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)]">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Activity className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg">Aktivitas Harian</h2>
              <p className="text-sm text-muted-foreground">Jumlah log berdasarkan master aktivitas.</p>
            </div>
          </div>
          <div className="grid gap-3 p-5">
            {activityRows.map((row) => (
              <BarLine key={row.label} label={row.label} value={`${row.count} log`} width={(row.count / maxActivity) * 100} />
            ))}
            {activityRows.length === 0 && <div className="text-sm text-muted-foreground">Belum ada aktivitas.</div>}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] xl:col-span-2">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <CreditCard className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg">Pembayaran per Metode</h2>
              <p className="text-sm text-muted-foreground">Ringkasan nominal dari transaksi pembayaran.</p>
            </div>
          </div>
          <div className="grid gap-3 p-5">
            {paymentRows.map((row) => (
              <BarLine key={row.label} label={row.label} value={formatIDR(row.amount)} width={(row.amount / maxPayment) * 100} />
            ))}
            {paymentRows.length === 0 && <div className="text-sm text-muted-foreground">Belum ada pembayaran.</div>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={"rounded-xl border bg-card p-5 shadow-[0_4px_20px_rgba(155,135,245,0.08)] " + (accent ? "border-primary/30 bg-primary/5" : "border-border")}>
      <div className="mb-4 flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl">{value}</div>
    </div>
  );
}

function ReportLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-display text-lg">{value}</span>
    </div>
  );
}

function BarLine({ label, value, width }: { label: string; value: string; width: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-surface">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(width, 4)}%` }} />
      </div>
    </div>
  );
}

function countBy(items: string[]) {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function countAmountBy<T>(items: T[], getLabel: (item: T) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const label = getLabel(item);
    const amount = "amount" in (item as Record<string, unknown>) ? Number((item as Record<string, unknown>).amount) : 0;
    counts.set(label, (counts.get(label) ?? 0) + amount);
  });
  return [...counts.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function exportReportCsv({
  invoiceTotal,
  paidTotal,
  outstanding,
  overtimeTotal,
  attendance,
  activityRows,
  paymentRows,
}: {
  invoiceTotal: number;
  paidTotal: number;
  outstanding: number;
  overtimeTotal: number;
  attendance: { here: number; left: number; notArrived: number };
  activityRows: Array<{ label: string; count: number }>;
  paymentRows: Array<{ label: string; amount: number }>;
}) {
  const rows = [
    ["Kategori", "Nama", "Nilai"],
    ["Finansial", "Total tagihan", invoiceTotal],
    ["Finansial", "Pembayaran masuk", paidTotal],
    ["Finansial", "Belum dibayar", outstanding],
    ["Finansial", "Overtime", overtimeTotal],
    ["Kehadiran", "Di daycare", attendance.here],
    ["Kehadiran", "Sudah pulang", attendance.left],
    ["Kehadiran", "Belum datang", attendance.notArrived],
    ...activityRows.map((row) => ["Aktivitas", row.label, row.count]),
    ...paymentRows.map((row) => ["Pembayaran", row.label, row.amount]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "laporan-daycare.csv";
  link.click();
  URL.revokeObjectURL(url);
}
