import { useQuery } from "@tanstack/react-query";
import { Download, FileBarChart } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DataTable, type DataColumn } from "@/components/common/data-table";
import { daycareApi, daycareQueryKey } from "@/lib/daycare-api";
import { formatIDR } from "@/lib/daycare-data";

export const reportLabels = {
  kehadiran: "Kehadiran Anak",
  aktivitas: "Aktivitas Anak",
  "pembelian-paket": "Pembelian Paket",
  tagihan: "Tagihan",
  pembayaran: "Pembayaran",
  pendapatan: "Pendapatan",
  keterlambatan: "Keterlambatan Jemput",
  insiden: "Insiden",
  kesehatan: "Kesehatan",
  kapasitas: "Kapasitas",
} as const;

type ReportKey = keyof typeof reportLabels;
type ReportRow = Record<string, string | number>;

export function ReportView({ report }: { report: string }) {
  const key = (report in reportLabels ? report : "kehadiran") as ReportKey;
  const { data, isLoading } = useQuery({ queryKey: daycareQueryKey, queryFn: daycareApi.snapshot });
  const children = data?.children ?? [];
  const childName = (id: string) => children.find((child) => child.id === id)?.name ?? "-";
  const rows = buildRows(key, data, childName);
  const columns: DataColumn<ReportRow>[] = Object.keys(rows[0] ?? { informasi: "Informasi" }).filter((column) => column !== "_key").map((column) => ({
    key: column,
    label: column.replaceAll("_", " "),
    render: (row) => row[column] ?? "-",
  }));

  return (
    <AppShell
      title={`Laporan ${reportLabels[key]}`}
      description="Data laporan berasal dari transaksi daycare dan dapat digunakan untuk evaluasi operasional."
      actions={<button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold" onClick={() => exportRows(reportLabels[key], rows)}><Download className="size-4" /> Ekspor CSV</button>}
    >
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Total Data" value={String(rows.length)} />
        <Metric label="Jenis Laporan" value={reportLabels[key]} />
        <Metric label="Sumber" value="Transaksi Aktual" />
      </div>
      {isLoading ? <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">Memuat laporan...</div> : <DataTable columns={columns} rows={rows} rowKey={(row) => String(row._key)} emptyMessage="Belum ada data untuk laporan ini." />}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border/60 bg-card p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><FileBarChart className="size-4" />{label}</div><div className="mt-2 text-lg font-semibold">{value}</div></div>;
}

function buildRows(key: ReportKey, data: Awaited<ReturnType<typeof daycareApi.snapshot>> | undefined, childName: (id: string) => string): ReportRow[] {
  if (!data) return [];
  if (key === "kehadiran") return data.children.map((item) => ({ _key: item.id, anak: item.name, status: item.status, check_in: item.checkInTime ?? "-", check_out: item.checkOutTime ?? "-" }));
  if (key === "aktivitas") return data.activities.map((item) => ({ _key: item.id, anak: childName(item.childId), aktivitas: item.type, jam: item.time, pengasuh: item.staff, catatan: item.detail }));
  if (key === "pembelian-paket") return data.packagePurchases.map((item) => ({ _key: item.id, transaksi: item.id, anak: childName(item.childId), paket: item.packageName, mulai: item.startDate, harga: formatIDR(item.price), status: item.status }));
  if (key === "tagihan") return data.invoices.map((item) => ({ _key: item.id, invoice: item.id, anak: childName(item.childId), periode: item.period, total: formatIDR(item.total), status: item.status }));
  if (key === "pembayaran") return data.payments.map((item) => ({ _key: item.id, pembayaran: item.id, invoice: item.invoiceId, metode: item.method, nominal: formatIDR(item.amount), verifikasi: item.statusVerification ?? "verified" }));
  if (key === "pendapatan") return data.invoices.map((item) => ({ _key: item.id, periode: item.period, invoice: item.id, paket: formatIDR(item.basePackage), overtime: formatIDR(item.overtimeHours * item.overtimeRate), total: formatIDR(item.total) }));
  if (key === "keterlambatan") return data.invoices.filter((item) => item.overtimeHours > 0).map((item) => ({ _key: item.id, anak: childName(item.childId), invoice: item.id, jam_overtime: item.overtimeHours, tarif: formatIDR(item.overtimeRate), total: formatIDR(item.overtimeHours * item.overtimeRate) }));
  if (key === "insiden") return data.incidents.map((item) => ({ _key: item.id, anak: childName(item.childId), insiden: item.title, tingkat: item.severity, status: item.status, ditangani_oleh: item.handledBy }));
  if (key === "kesehatan") return data.healthNotes.map((item) => ({ _key: item.id, anak: childName(item.childId), kategori: item.category, catatan: item.note, suhu: item.temperature ?? "-", ditangani_oleh: item.handledBy }));
  return data.masterData.rooms.map((item) => ({ _key: item.code, ruangan: item.name, lokasi: item.location ?? "-", kapasitas: item.capacity, status: item.status }));
}

function exportRows(label: string, rows: ReportRow[]) {
  const columns = Object.keys(rows[0] ?? {}).filter((column) => column !== "_key");
  const csvRows = [columns, ...rows.map((row) => columns.map((column) => row[column] ?? ""))];
  const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan-${label.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
