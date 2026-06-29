import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { appConfigQueryKey, daycareApi } from "@/lib/daycare-api";
import { authStore } from "@/lib/auth";
import {
  Baby,
  Banknote,
  Bell,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  BadgeDollarSign,
  Clock3,
  CreditCard,
  Database,
  DoorOpen,
  FileBarChart,
  HeartPulse,
  LayoutDashboard,
  LogIn,
  LogOut,
  Layers3,
  Menu,
  MessageSquare,
  Megaphone,
  Package,
  Receipt,
  Search,
  Settings,
  Shapes,
  ShieldAlert,
  ShoppingBag,
  Users,
  UserRoundCog,
  UserCog,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";

type MenuPath =
  | "/dashboard" | "/master/anak" | "/master/pengasuh" | "/master/paket" | "/master/aktivitas" | "/master/kelompok-usia" | "/master/ruangan" | "/master/shift" | "/master/biaya-tambahan" | "/master/metode-pembayaran"
  | "/operasional/booking" | "/operasional/check-in" | "/operasional/check-out" | "/operasional/aktivitas-harian" | "/operasional/catatan-kesehatan" | "/operasional/insiden"
  | "/keuangan/pembelian-paket" | "/keuangan/tagihan" | "/keuangan/pembayaran" | "/komunikasi/pengumuman"
  | "/laporan/kehadiran" | "/laporan/aktivitas" | "/laporan/pembelian-paket" | "/laporan/tagihan" | "/laporan/pembayaran" | "/laporan/pendapatan" | "/laporan/keterlambatan" | "/laporan/insiden" | "/laporan/kesehatan" | "/laporan/kapasitas"
  | "/pengaturan/profil" | "/pengaturan/hari-libur" | "/pengaturan/penomoran" | "/pengaturan/notifikasi" | "/user-management";

type ChildItem = { label: string; to: MenuPath; icon: LucideIcon };

const EXPANDED_MENU_KEY = "daycare_expanded_menu";

const menuGroups: Array<{ key: string; label: string; icon: LucideIcon; children: ChildItem[] }> = [
  {
    key: "master",
    label: "Master Data",
    icon: Database,
    children: [
      { label: "Anak", to: "/master/anak", icon: Baby },
      { label: "Pengasuh", to: "/master/pengasuh", icon: UserRoundCog },
      { label: "Paket", to: "/master/paket", icon: Package },
      { label: "Aktivitas", to: "/master/aktivitas", icon: Shapes },
      { label: "Kelompok Usia", to: "/master/kelompok-usia", icon: Layers3 },
      { label: "Ruangan", to: "/master/ruangan", icon: DoorOpen },
      { label: "Shift", to: "/master/shift", icon: Clock3 },
      { label: "Biaya Tambahan", to: "/master/biaya-tambahan", icon: BadgeDollarSign },
      { label: "Metode Pembayaran", to: "/master/metode-pembayaran", icon: CreditCard },
    ],
  },
  {
    key: "operasional",
    label: "Operasional",
    icon: CalendarCheck,
    children: [
      { label: "Booking", to: "/operasional/booking", icon: CalendarCheck },
      { label: "Check In", to: "/operasional/check-in", icon: LogIn },
      { label: "Check Out", to: "/operasional/check-out", icon: LogOut },
      { label: "Aktivitas Harian", to: "/operasional/aktivitas-harian", icon: ClipboardList },
      { label: "Catatan Kesehatan", to: "/operasional/catatan-kesehatan", icon: HeartPulse },
      { label: "Insiden", to: "/operasional/insiden", icon: ShieldAlert },
    ],
  },
  {
    key: "keuangan",
    label: "Keuangan",
    icon: Receipt,
    children: [
      { label: "Pembelian Paket", to: "/keuangan/pembelian-paket", icon: ShoppingBag },
      { label: "Tagihan", to: "/keuangan/tagihan", icon: Receipt },
      { label: "Pembayaran", to: "/keuangan/pembayaran", icon: WalletCards },
    ],
  },
  {
    key: "komunikasi",
    label: "Komunikasi",
    icon: MessageSquare,
    children: [{ label: "Pengumuman", to: "/komunikasi/pengumuman", icon: Megaphone }],
  },
  {
    key: "laporan",
    label: "Laporan",
    icon: FileBarChart,
    children: [
      { label: "Kehadiran Anak", to: "/laporan/kehadiran", icon: Users },
      { label: "Aktivitas Anak", to: "/laporan/aktivitas", icon: ClipboardList },
      { label: "Pembelian Paket", to: "/laporan/pembelian-paket", icon: ShoppingBag },
      { label: "Tagihan", to: "/laporan/tagihan", icon: Receipt },
      { label: "Pembayaran", to: "/laporan/pembayaran", icon: CreditCard },
      { label: "Pendapatan", to: "/laporan/pendapatan", icon: Banknote },
      { label: "Keterlambatan Jemput", to: "/laporan/keterlambatan", icon: Clock3 },
      { label: "Insiden", to: "/laporan/insiden", icon: ShieldAlert },
      { label: "Kesehatan", to: "/laporan/kesehatan", icon: HeartPulse },
      { label: "Kapasitas", to: "/laporan/kapasitas", icon: DoorOpen },
    ],
  },
  {
    key: "pengaturan",
    label: "Pengaturan",
    icon: Settings,
    children: [
      { label: "Profil Daycare", to: "/pengaturan/profil", icon: Settings },
      { label: "Hari Libur", to: "/pengaturan/hari-libur", icon: CalendarCheck },
    ],
  },
];

export function AppShell({ children, title, description, actions }: { children: ReactNode; title: string; description?: string; actions?: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { data: config } = useQuery({ queryKey: appConfigQueryKey, queryFn: daycareApi.appConfig });
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = authStore.getUser();
  const appName = config?.appName || "Daycare Management";
  const initials = (user?.name || "Admin").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    document.title = `${title} - ${appName}`;
  }, [appName, title]);

  useEffect(() => setMobileOpen(false), [path]);

  useEffect(() => {
    const stored = window.localStorage.getItem(EXPANDED_MENU_KEY);
    const activeGroup = menuGroups.find((group) => group.children.some((item) => path === item.to));
    const storedGroup = menuGroups.find((group) => group.key === stored);
    const storedMatchesPath = storedGroup?.children.some((item) => path === item.to);
    setExpandedGroup(storedMatchesPath || !activeGroup ? storedGroup?.key ?? null : activeGroup.key);
  }, [path]);

  function toggleGroup(key: string) {
    const next = expandedGroup === key ? null : key;
    setExpandedGroup(next);
    if (next) window.localStorage.setItem(EXPANDED_MENU_KEY, next);
    else window.localStorage.removeItem(EXPANDED_MENU_KEY);
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-[#242124] text-[#f7f3f4]">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        {config?.logo ? <img src={config.logo} alt="" className="size-10 rounded-md object-cover" /> : <div className="grid size-10 shrink-0 place-items-center rounded-md bg-white/10"><Baby className="size-5 text-[#e5b9bd]" /></div>}
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{appName}</p>
          <p className="text-xs text-white/50">Portal Administrator</p>
        </div>
        <button className="ml-auto rounded-md p-2 text-white/60 hover:bg-white/10 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Tutup navigasi"><X className="size-5" /></button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <NavLink to="/dashboard" label="Dashboard" icon={LayoutDashboard} active={path === "/dashboard"} />
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const open = expandedGroup === group.key;
          const childActive = group.children.some((item) => path === item.to);
          return (
            <div key={group.key}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${childActive || open ? "text-white" : "text-white/68 hover:bg-white/7 hover:text-white"}`}
                onClick={() => toggleGroup(group.key)}
                aria-expanded={open}
              >
                <GroupIcon className="size-4.5 shrink-0" />
                <span className="flex-1 font-medium">{group.label}</span>
                <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                  {group.children.map((item, index) => {
                    const active = path === item.to;
                    const classes = `flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors ${active ? "bg-[#7c5357] font-semibold text-white" : "text-white/55 hover:bg-white/7 hover:text-white"}`;
                    const Icon = item.icon;
                    return <Link key={`${item.label}-${index}`} to={item.to as never} className={classes}><Icon className="size-3.5" />{item.label}</Link>;
                  })}
                </div>
              )}
            </div>
          );
        })}
        <NavLink to="/user-management" label="User Management" icon={UserCog} active={path === "/user-management"} />
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#7c5357] text-xs font-semibold">{initials}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name || "Admin"}</p>
            <p className="truncate text-[11px] text-white/45">{user?.email || "-"}</p>
          </div>
        </div>
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/7 hover:text-white" onClick={() => { authStore.clear(); window.location.replace("/login"); }}>
          <LogOut className="size-4" /> Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-50 md:hidden"><button className="absolute inset-0 bg-black/45" onClick={() => setMobileOpen(false)} aria-label="Tutup navigasi" /><div className="relative h-full w-72 shadow-2xl">{sidebar}</div></div>}
      <div className="flex h-screen min-w-0 flex-col md:pl-72">
        <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur-md lg:px-7">
          <button className="rounded-md border border-border bg-card p-2 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka navigasi"><Menu className="size-5" /></button>
          <div className="relative hidden w-full max-w-md sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className="h-10 w-full rounded-md border border-border/70 bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="Cari anak, aktivitas, atau tagihan..." />
          </div>
          <button className="relative ml-auto rounded-md border border-border/70 bg-card p-2.5 text-muted-foreground hover:text-primary" aria-label="Notifikasi"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" /></button>
          <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user?.name || "Admin"}</p><p className="text-[11px] capitalize text-muted-foreground">{user?.role.replace("_", " ") || "admin"}</p></div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><h1 className="text-2xl font-semibold text-foreground lg:text-3xl">{title}</h1>{description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, label, icon: Icon, active }: { to: MenuPath; label: string; icon: LucideIcon; active: boolean }) {
  return <Link to={to as never} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? "bg-[#7c5357] font-semibold text-white" : "text-white/68 hover:bg-white/7 hover:text-white"}`}><Icon className="size-4.5" /><span>{label}</span></Link>;
}
