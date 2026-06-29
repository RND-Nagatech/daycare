import { Bell, Hash, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export function SettingsPlaceholder({ type }: { type: "numbering" | "notifications" }) {
  const config: { title: string; description: string; icon: LucideIcon; items: string[] } = type === "numbering"
    ? { title: "Penomoran", description: "Format nomor otomatis untuk master dan transaksi daycare.", icon: Hash, items: ["Anak", "Pengasuh", "Paket", "Booking", "Check In", "Check Out", "Tagihan", "Pembayaran"] }
    : { title: "Notifikasi", description: "Pengaturan kejadian dan kanal notifikasi operasional.", icon: Bell, items: ["Booking dibuat", "Check In", "Check Out", "Aktivitas baru", "Tagihan dibuat", "Pembayaran diverifikasi"] };
  const Icon = config.icon;
  return (
    <AppShell title={config.title} description={config.description}>
      <section className="rounded-lg border border-border/60 bg-card">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4"><span className="grid size-10 place-items-center rounded-md bg-accent text-accent-foreground"><Icon className="size-5" /></span><div><h2 className="font-display text-lg">Konfigurasi {config.title}</h2><p className="text-sm text-muted-foreground">Data konfigurasi mengikuti dokumentasi sistem.</p></div></div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">{config.items.map((item) => <div key={item} className="rounded-md border border-border/60 bg-surface px-4 py-3 text-sm font-medium">{item}</div>)}</div>
      </section>
    </AppShell>
  );
}
