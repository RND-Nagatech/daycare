import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileBarChart, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DataTable, type DataColumn } from "@/components/common/data-table";
import { authStore } from "@/lib/auth";
import { daycareApi, daycareQueryKey } from "@/lib/daycare-api";
import { formatIDR } from "@/lib/daycare-data";
import { downloadReportPdf } from "@/lib/report-pdf";

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

const internalColumns = new Set(["_key", "_date", "_filter", "_amount"]);

export function ReportView({ report }: { report: string }) {
  const key = (report in reportLabels ? report : "kehadiran") as ReportKey;
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filter, setFilter] = useState("");
  const [exporting, setExporting] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: daycareQueryKey, queryFn: daycareApi.snapshot });
  const children = data?.children ?? [];
  const childName = (id: string) => children.find((child) => child.id === id)?.name ?? "-";
  const allRows = useMemo(() => buildRows(key, data, childName), [data, key]);
  const filterOptions = useMemo(() => Array.from(new Set(allRows.map((row) => String(row._filter ?? "")).filter(Boolean))).sort(), [allRows]);
  const rows = useMemo(() => allRows.filter((row) => {
    const date = String(row._date ?? "").slice(0, 10);
    if (fromDate && (!date || date < fromDate)) return false;
    if (toDate && (!date || date > toDate)) return false;
    return !filter || row._filter === filter;
  }), [allRows, filter, fromDate, toDate]);
  const visibleKeys = Object.keys(allRows[0] ?? { informasi: "Informasi" }).filter((column) => !internalColumns.has(column));
  const columns: DataColumn<ReportRow>[] = visibleKeys.map((column) => ({
    key: column,
    label: titleCase(column),
    render: (row) => row[column] ?? "-",
  }));
  const period = fromDate || toDate ? `${fromDate || "Awal data"} s.d. ${toDate || "Hari ini"}` : "Semua tanggal";
  const amountTotal = rows.reduce((sum, row) => sum + Number(row._amount ?? 0), 0);
  const summary = [`Total data: ${rows.length}`, ...(amountTotal > 0 ? [`Total nilai: ${formatIDR(amountTotal)}`] : [])];

  async function exportPdf() {
    if (!rows.length) { toast.error("Tidak ada data untuk diekspor"); return; }
    setExporting(true);
    try {
      const profile = data?.masterData.daycareProfile;
      await downloadReportPdf({
        daycareName: profile?.name || "Daycare Management",
        logo: profile?.logo,
        title: `Laporan ${reportLabels[key]}`,
        period,
        columns: visibleKeys.map((column) => ({ key: column, label: titleCase(column) })),
        rows,
        summary,
        printedBy: authStore.getUser()?.name || "Administrator",
      }, `laporan-${key}.pdf`);
      toast.success("PDF laporan berhasil dibuat");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF gagal dibuat");
    } finally {
      setExporting(false);
    }
  }

  return (
    <AppShell
      title={`Laporan ${reportLabels[key]}`}
      description="Filter dan preview transaksi aktual sebelum laporan diekspor."
      actions={<div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm font-semibold disabled:opacity-50" disabled={!rows.length} onClick={() => exportRows(reportLabels[key], rows, visibleKeys)}><Download className="size-4" /> Export CSV</button><button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50" disabled={!rows.length || exporting} onClick={exportPdf}><FileText className="size-4" /> {exporting ? "Membuat PDF..." : "Export PDF"}</button></div>}
    >
      <section className="mb-5 grid gap-3 rounded-lg border border-border/60 bg-card p-4 md:grid-cols-[1fr_1fr_1.25fr_auto] md:items-end">
        <label className="grid gap-1.5 text-sm"><span className="text-xs font-medium text-muted-foreground">Tanggal mulai</span><input type="date" className="min-h-10 rounded-md border border-border bg-surface px-3" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
        <label className="grid gap-1.5 text-sm"><span className="text-xs font-medium text-muted-foreground">Tanggal akhir</span><input type="date" className="min-h-10 rounded-md border border-border bg-surface px-3" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
        <label className="grid gap-1.5 text-sm"><span className="text-xs font-medium text-muted-foreground">Filter {filterLabel(key)}</span><select className="min-h-10 rounded-md border border-border bg-surface px-3" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">Semua {filterLabel(key)}</option>{filterOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <button className="min-h-10 rounded-md border border-border px-4 text-sm font-medium disabled:opacity-50" disabled={!fromDate && !toDate && !filter} onClick={() => { setFromDate(""); setToDate(""); setFilter(""); }}>Reset</button>
      </section>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Total Data" value={String(rows.length)} />
        <Metric label="Periode" value={period} />
        <Metric label="Sumber" value="Database Aktual" />
      </div>
      {isLoading ? <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">Memuat laporan...</div> : <DataTable columns={columns} rows={rows} rowKey={(row) => String(row._key)} emptyMessage="Belum ada data sesuai filter laporan." />}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border/60 bg-card p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><FileBarChart className="size-4" />{label}</div><div className="mt-2 text-base font-semibold">{value}</div></div>;
}

function dateValue(value?: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function buildRows(key: ReportKey, data: Awaited<ReturnType<typeof daycareApi.snapshot>> | undefined, childName: (id: string) => string): ReportRow[] {
  if (!data) return [];
  if (key === "kehadiran") return data.children.filter((item) => item.checkInAt || item.checkOutAt).map((item) => ({ _key: item.id, _date: dateValue(item.checkInAt ?? item.checkOutAt), _filter: item.status, tanggal: dateValue(item.checkInAt ?? item.checkOutAt), anak: item.name, status: item.status, check_in: item.checkInTime ?? "-", check_out: item.checkOutTime ?? "-" }));
  if (key === "aktivitas") return data.activities.map((item) => ({ _key: item.id, _date: dateValue(item.createdAt), _filter: item.type, tanggal: dateValue(item.createdAt), anak: childName(item.childId), aktivitas: item.type, jam: item.time, pengasuh: item.staff, catatan: item.detail }));
  if (key === "pembelian-paket") return data.packagePurchases.map((item) => ({ _key: item.id, _date: dateValue(item.createdAt ?? item.startDate), _filter: item.paymentStatus, _amount: item.price, transaksi: item.id, tagihan: item.invoiceId ?? "-", anak: childName(item.childId), paket: item.packageName, mulai: item.startDate, harga: formatIDR(item.price), pembayaran: item.paymentStatus }));
  if (key === "tagihan") return data.invoices.map((item) => ({ _key: item.id, _date: dateValue(item.createdAt), _filter: item.status, _amount: item.total, invoice: item.id, anak: childName(item.childId), periode: item.period, total: formatIDR(item.total), status: item.status }));
  if (key === "pembayaran") return data.payments.map((item) => ({ _key: item.id, _date: dateValue(item.paidAt), _filter: item.statusVerification ?? "verified", _amount: item.amount, tanggal: dateValue(item.paidAt), pembayaran: item.id, invoice: item.invoiceId, metode: item.method, nominal: formatIDR(item.amount), verifikasi: item.statusVerification ?? "verified" }));
  if (key === "pendapatan") return data.payments.filter((item) => !item.statusVerification || item.statusVerification === "verified").map((item) => ({ _key: item.id, _date: dateValue(item.paidAt), _filter: item.method, _amount: item.amount, tanggal: dateValue(item.paidAt), pembayaran: item.id, invoice: item.invoiceId, metode: item.method, pendapatan: formatIDR(item.amount) }));
  if (key === "keterlambatan") return data.invoices.filter((item) => item.overtimeHours > 0).map((item) => ({ _key: item.id, _date: dateValue(item.createdAt), _filter: item.status, _amount: item.overtimeHours * item.overtimeRate, anak: childName(item.childId), invoice: item.id, jam_overtime: item.overtimeHours, tarif: formatIDR(item.overtimeRate), total: formatIDR(item.overtimeHours * item.overtimeRate) }));
  if (key === "insiden") return data.incidents.map((item) => ({ _key: item.id, _date: dateValue(item.occurredAt), _filter: item.status, tanggal: dateValue(item.occurredAt), anak: childName(item.childId), insiden: item.title, tingkat: item.severity, status: item.status, ditangani_oleh: item.handledBy }));
  if (key === "kesehatan") return data.healthNotes.map((item) => ({ _key: item.id, _date: dateValue(item.recordedAt), _filter: item.category, tanggal: dateValue(item.recordedAt), anak: childName(item.childId), kategori: item.category, catatan: item.note, suhu: item.temperature ?? "-", ditangani_oleh: item.handledBy }));
  return data.masterData.rooms.map((item) => ({ _key: item.code, _date: dateValue(item.updatedAt ?? item.createdAt), _filter: item.status, ruangan: item.name, lokasi: item.location ?? "-", kapasitas: item.capacity, status: item.status }));
}

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function filterLabel(key: ReportKey) {
  if (["kehadiran", "tagihan", "pembelian-paket", "pembayaran", "keterlambatan", "insiden", "kapasitas"].includes(key)) return "status";
  if (key === "aktivitas") return "aktivitas";
  if (key === "kesehatan") return "kategori";
  return "metode pembayaran";
}

function exportRows(label: string, rows: ReportRow[], columns: string[]) {
  const csvRows = [columns.map(titleCase), ...rows.map((row) => columns.map((column) => row[column] ?? ""))];
  const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan-${label.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
