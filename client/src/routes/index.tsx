import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Baby,
  ClipboardCheck,
  Download,
  Eye,
  Filter,
  Mail,
  Megaphone,
  MessageSquare,
  MoreVertical,
  Send,
  Utensils,
  Users,
  LogIn,
  Cake,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { daycareApi, daycareQueryKey } from "@/lib/daycare-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lumi Daycare" },
      { name: "description", content: "Ringkasan harian: anak hadir, aktivitas terbaru, dan tagihan." },
    ],
  }),
  component: () => <Navigate to="/dashboard" replace />,
});

const staffImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDJkrSLDMK0rdnxrignreZXaCRIcMbJIac-TG-2L2RCteaq3m6P-k_nRf2xD1zA9lQHJ2mNGi48kawaK-tmDX8KEG85J8kkvtPT8PyGhhj3U0lzBsfK3FuI4oSiIAV-2xgpncnimT1i-DukwxKHUmuGTnsygNROb15-mkM3uSSoTEU3T2B8fVXbBvRIJo7kNNpEKDxMLO-4BMQmI5aTR2JJuXDvGzjuxzbObtvOnv3H13O5Yi10nCwEXpuhURY-4OXy7JxuF_BB3Hw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDrGCDPDqUUe4j_iikQ4v05NMUZhmbVaQu8rtXK4bNrEVgpAsMb4-pVLdD1wFJYmJF7rqQ4jLCYqawIHHMS1-O8L_SWTVblyZLk2mE8U0DujuyCM1z1U51JKSHQk_nxjsbFcV9a7gEf7XU32qoJAASRIRFbPA9h8ilmahXEjQpL2lSEPUi45XAnBddTbNjcRbpj5of7nIFjYP95S4mRuNcrQxToBXL8_QvL63BG7FL8ZQZXjZ59_zKmd9MkwykTRrylQZIqZfc6p0U",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4rpenH98iJHCdYj_BcNx-2pfr7A0KZ-mj5vMKOPQ0ZW_SsLXSQuaMmT3xfAC_0H6GQcY0xhmwXKUyhseCWEKX4ZgY-HVv2dhBK-9weVfB9jGsgsMg0LCGvJ2_JLljE0r4hOghBxy7YECOhvreeM-__u6AU8l3akBwVFpMOSZ6Bknn6n6TbKV0fig2BylqGgtT4Iec41BjoAqjHnQMO0aljwQFtawObrN-ySGKS14VpfQRXv01B5bi-ZlUn5AJI9vXeMKm6YbQDWI",
];

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: daycareQueryKey,
    queryFn: daycareApi.snapshot,
  });

  const children = data?.children ?? [];
  const activities = data?.activities ?? [];
  const inDaycare = children.filter((child) => child.status === "Di Daycare");

  return (
    <AppShell title="Dashboard" description="Ringkasan operasional harian daycare.">
      {error && <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">Data backend belum bisa dimuat.</div>}
      {isLoading && <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm font-semibold text-muted-foreground shadow-[0_4px_20px_rgba(155,135,245,0.06)]">Memuat data daycare...</div>}

      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Users} label="Total Anak" value={`${children.length}`} badge="+4 bulan ini" tone="primary" />
        <SummaryCard icon={ClipboardCheck} label="Kehadiran Hari Ini" value={`${inDaycare.length}`} badge={`${children.length ? Math.round((inDaycare.length / children.length) * 100) : 0}% hadir`} tone="secondary" />
        <SummaryCard icon={Utensils} label="Lunch Timer" value="00:42:12" badge="Prep Mode" tone="tertiary" />
        <SummaryCard icon={Mail} label="Pesan Baru" value="7" badge="" tone="primary" alert />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          <AttendanceCard children={children} />
          <AnnouncementCard />
        </section>
        <aside className="space-y-6 lg:col-span-4">
          <ActivityCard activities={activities.slice(-3).reverse()} />
          <CaregiversCard />
          <BirthdaysCard />
        </aside>
      </div>
    </AppShell>
  );
}

function SummaryCard({ icon: Icon, label, value, badge, tone, alert }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; badge: string; tone: "primary" | "secondary" | "tertiary"; alert?: boolean }) {
  const toneClass = {
    primary: "bg-primary/15 text-primary",
    secondary: "bg-accent text-accent-foreground",
    tertiary: "bg-warning/25 text-warning-foreground",
  }[tone];

  return (
    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-[0_4px_20px_rgba(155,135,245,0.06)] transition-transform hover:scale-[1.01]">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-lg p-2 ${toneClass}`}><Icon className="size-6" /></div>
        {alert ? <div className="size-3 animate-pulse rounded-full bg-destructive" /> : <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-bold text-accent-foreground">{badge}</span>}
      </div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</h3>
      <p className="mt-1 font-display text-3xl text-foreground">{value}</p>
    </div>
  );
}

function AttendanceCard({ children }: { children: Array<{ id: string; name: string; parent: string; package: string; status: string; checkInTime?: string; initials: string }> }) {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-6 shadow-[0_4px_20px_rgba(155,135,245,0.06)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-primary">Daftar Kehadiran Siswa</h2>
          <p className="text-sm text-muted-foreground">Manage daily check-ins and student status.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-surface hover:text-primary"><Filter className="size-5" /></button>
          <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-surface hover:text-primary"><Download className="size-5" /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px]">
          <thead>
            <tr className="border-b border-border/70 text-left">
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Class</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Check-in</th>
              <th className="pb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="pb-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {children.slice(0, 3).map((child) => (
              <tr key={child.id} className="hover:bg-surface/70">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">{child.initials}</div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{child.name}</p>
                      <p className="text-xs text-muted-foreground">Parent: {child.parent}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-muted-foreground">{child.package}</td>
                <td className="py-4 text-sm text-foreground">{child.checkInTime ?? "--:--"}</td>
                <td className="py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${child.status === "Di Daycare" ? "bg-success/20 text-success-foreground" : "bg-destructive/10 text-destructive"}`}>
                    {child.status === "Di Daycare" ? "Checked In" : child.status}
                  </span>
                </td>
                <td className="py-4 text-right"><MoreVertical className="ml-auto size-5 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/master/anak" className="mt-6 flex w-full justify-center rounded-xl border border-primary/20 py-2 font-bold text-primary transition-colors hover:bg-primary/5">Lihat Semua Anak</Link>
    </section>
  );
}

function AnnouncementCard() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-primary/10 bg-primary/5 p-6">
      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <Megaphone className="size-6 text-primary" />
          <h2 className="font-display text-xl text-primary">Announcements</h2>
        </div>
        <div className="mb-6 rounded-xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm">
          <p className="mb-2 text-lg font-semibold">Upcoming Field Trip: Botanical Garden</p>
          <p className="mb-4 text-sm text-muted-foreground">Just a reminder that the bus leaves at 9:00 AM this Friday. Please ensure all waivers are signed via the portal.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Eye className="size-4" /> Sent to 84 parents <span className="mx-2">•</span> 2 hours ago</div>
        </div>
        <Link to="/komunikasi/pengumuman" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
          <Send className="size-5" /> Send Broadcast
        </Link>
      </div>
    </section>
  );
}

function ActivityCard({ activities }: { activities: Array<{ id: string; type: string; detail: string; time: string }> }) {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-6 shadow-[0_4px_20px_rgba(155,135,245,0.06)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Log Aktivitas</h2>
        <Link to="/operasional/aktivitas-harian" className="text-xs font-bold text-primary hover:underline">Lihat Riwayat</Link>
      </div>
      <div className="relative space-y-6 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-px before:bg-border">
        {activities.map((item, index) => (
          <div key={item.id} className="relative pl-8">
            <div className={`absolute left-0 top-1 flex size-6 items-center justify-center rounded-full border-4 border-card ${index === 0 ? "bg-accent" : index === 1 ? "bg-primary/15" : "bg-warning/25"}`}>
              {index === 0 ? <Utensils className="size-3 text-accent-foreground" /> : index === 1 ? <Baby className="size-3 text-primary" /> : <LogIn className="size-3 text-warning-foreground" />}
            </div>
            <p className="text-sm font-semibold">{activityTitle(item.type)}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{item.time}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CaregiversCard() {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-6 shadow-[0_4px_20px_rgba(155,135,245,0.06)]">
      <h2 className="mb-6 text-lg font-semibold">Active Caregivers</h2>
      {["Bu Ratna", "Bu Ani", "Bu Mia"].map((name, index) => (
        <div key={name} className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-surface">
          <div className="flex items-center gap-3">
            <img src={staffImages[index]} alt={name} className="size-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-[11px] text-muted-foreground">{index === 2 ? "Break Time" : "Lead Caregiver"}</p>
            </div>
          </div>
          <MessageSquare className="size-5 text-primary" />
        </div>
      ))}
    </section>
  );
}

function BirthdaysCard() {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <Cake className="size-5 text-warning-foreground" />
        <h3 className="text-lg font-semibold">Upcoming Birthdays</h3>
      </div>
      <div className="flex -space-x-2">
        {["TC", "BK", "LW"].map((item) => (
          <div key={item} className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-accent text-[10px] font-bold text-accent-foreground">{item}</div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">3 students celebrating this week!</p>
    </section>
  );
}

function activityTitle(type: string) {
  if (type === "Makan") return "Lunch Preparation";
  if (type === "Main") return "Painting Session Started";
  if (type === "Obat") return "Medication Update";
  return "Morning Rush Ended";
}
