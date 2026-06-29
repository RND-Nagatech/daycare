import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Baby, CalendarCheck, Clock3, CreditCard, LogIn, LogOut, Package, Receipt, UserRoundCog, WalletCards, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { daycareApi } from "@/lib/daycare-api";
import { formatIDR } from "@/lib/daycare-data";

export const Route = createFileRoute("/")({ component: () => <Navigate to="/dashboard" replace /> });
const dashboardKey = ["dashboard-admin"] as const;

export function Dashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: dashboardKey, queryFn: daycareApi.dashboard });
  return (
    <AppShell title="Dashboard" description="Ringkasan operasional dan keuangan berdasarkan data database saat ini.">
      {error && <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Dashboard gagal dimuat: {error.message}</div>}
      {isLoading && <div className="mb-5 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Memuat agregasi dashboard...</div>}
      {data && <>
        <DashboardSection title="Operasional">
          <Metric icon={Baby} label="Total Anak Aktif" value={data.operational.totalChildren} />
          <Metric icon={UserRoundCog} label="Total Pengasuh Aktif" value={data.operational.totalCaregivers} />
          <Metric icon={Package} label="Paket Aktif" value={data.operational.totalPackages} />
          <Metric icon={CalendarCheck} label="Booking Hari Ini" value={data.operational.bookingsToday} />
          <Metric icon={LogIn} label="Check In Hari Ini" value={data.operational.checkInsToday} />
          <Metric icon={Clock3} label="Anak Sedang Dititipkan" value={data.operational.childrenInCare} />
          <Metric icon={LogOut} label="Check Out Hari Ini" value={data.operational.checkOutsToday} />
        </DashboardSection>
        <DashboardSection title="Keuangan">
          <Metric icon={Receipt} label="Tagihan Open" value={data.finance.openInvoices} />
          <Metric icon={Receipt} label="Tagihan Partial" value={data.finance.partialInvoices} />
          <Metric icon={CreditCard} label="Pembayaran Pending" value={data.finance.pendingPayments} />
          <Metric icon={WalletCards} label="Pendapatan Hari Ini" value={formatIDR(data.finance.revenueToday)} wide />
          <Metric icon={WalletCards} label="Pendapatan Bulan Ini" value={formatIDR(data.finance.revenueMonth)} wide />
        </DashboardSection>
      </>}
    </AppShell>
  );
}

function DashboardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-8"><div className="mb-4 flex items-center gap-3"><h2 className="font-display text-lg">{title}</h2><div className="h-px flex-1 bg-border/60" /></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div></section>;
}

function Metric({ icon: Icon, label, value, wide = false }: { icon: LucideIcon; label: string; value: string | number; wide?: boolean }) {
  return <article className={`rounded-lg border border-border/60 bg-card p-5 shadow-[0_4px_18px_rgba(54,39,43,0.04)] ${wide ? "xl:col-span-2" : ""}`}><div className="mb-4 grid size-10 place-items-center rounded-md bg-accent text-accent-foreground"><Icon className="size-5" /></div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></article>;
}
