import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { daycareApi, daycareQueryKey, type CheckOutInput, type MasterPackage } from "@/lib/daycare-api";
import { formatIDR, type Child } from "@/lib/daycare-data";
import { CalendarPlus, Clock, LogIn, LogOut, Package } from "lucide-react";
import { toast } from "sonner";
import { ModalForm } from "@/components/common/modal-form";

export const Route = createFileRoute("/checkin")({
  head: () => ({
    meta: [
      { title: "Check-in / Check-out — Lumi Daycare" },
      { name: "description", content: "Catat kedatangan dan kepulangan anak beserta barang bawaan dengan satu sentuhan." },
    ],
  }),
  component: () => <Navigate to="/operasional/booking" replace />,
});

export type OperationalMode = "booking" | "check-in" | "check-out";

export function OperationalPage({ mode }: { mode: OperationalMode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: daycareQueryKey, queryFn: daycareApi.snapshot });
  const children = data?.children ?? [];
  const bookings = data?.bookings ?? [];
  const packages = data?.masterData.packages.filter((item) => item.status === "Aktif") ?? [];
  const caregivers = data?.masterData.caregivers.filter((item) => item.status === "Aktif") ?? [];
  const additionalFees = data?.masterData.additionalFees.filter((item) => item.status === "Aktif") ?? [];
  const [bookingOpen, setBookingOpen] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: daycareQueryKey });
  const createBooking = useMutation({
    mutationFn: daycareApi.createBooking,
    onSuccess: () => { refresh(); setBookingOpen(false); toast.success("Booking berhasil dibuat"); },
    onError: (error) => toast.error(error.message),
  });
  const checkIn = useMutation({
    mutationFn: ({ childId, input }: { childId: string; input: CheckInPayload }) =>
      daycareApi.checkIn(childId, input),
    onSuccess: () => { refresh(); toast.success("Check-in berhasil dicatat"); },
    onError: (error) => toast.error(error.message),
  });
  const checkOut = useMutation({
    mutationFn: ({ childId, input }: { childId: string; input: CheckOutInput }) => daycareApi.checkOut(childId, input),
    onSuccess: () => { refresh(); toast.success("Check-out berhasil dicatat"); },
    onError: (error) => toast.error(error.message),
  });
  const arriving = children.filter((c) => c.status === "Belum Datang");
  const here = children.filter((c) => c.status === "Di Daycare");
  const left = children.filter((c) => c.status === "Sudah Pulang");

  function handleCheckIn(child: Child, input: CheckInPayload) {
    checkIn.mutate({
      childId: child.id,
      input,
    });
  }

  const pageCopy = {
    booking: { title: "Booking", description: "Kelola reservasi kunjungan anak sebelum hari penitipan." },
    "check-in": { title: "Check In", description: "Catat proses kedatangan, petugas penerima, dan barang bawaan anak." },
    "check-out": { title: "Check Out", description: "Catat proses kepulangan, penjemput, dan biaya tambahan anak." },
  }[mode];

  return (
    <AppShell
      title={pageCopy.title}
      description={pageCopy.description}
      actions={mode === "booking" ? <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" onClick={() => setBookingOpen(true)}><CalendarPlus className="size-4" /> Buat Booking</button> : undefined}
    >
      {isLoading && <div className="mb-4 rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] p-3 text-sm text-muted-foreground">Memuat status check-in...</div>}
      {mode === "booking" && <>
        <ModalForm open={bookingOpen} onOpenChange={setBookingOpen} title="Buat Booking" showHeader={false}>
          {bookingOpen && <BookingForm children={children} packages={packages} isSaving={createBooking.isPending} onCancel={() => setBookingOpen(false)} onSubmit={(payload) => createBooking.mutate(payload)} />}
        </ModalForm>
        <section className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-display text-lg">Booking Kunjungan</h2>
              <p className="text-sm text-muted-foreground">Reservasi opsional sebelum check-in.</p>
            </div>
            <span className="text-xs text-muted-foreground">{bookings.length} booking</span>
          </div>
          <ul className="divide-y divide-border">
            {bookings.slice(0, 5).map((booking) => {
              const child = children.find((item) => item.id === booking.childId);
              return (
                <li key={booking.id} className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="font-medium">{booking.id} · {child?.name ?? "Anak tidak ditemukan"}</div>
                    <div className="text-xs text-muted-foreground">{booking.packageName} · {booking.date}</div>
                  </div>
                  <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] ${booking.status === "Terjadwal" ? "bg-accent text-accent-foreground" : booking.status === "Selesai" ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                    {booking.status}
                  </span>
                </li>
              );
            })}
            {bookings.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">Belum ada booking kunjungan.</li>
            )}
          </ul>
        </section>
      </>}
      {mode === "check-in" && <Column title="Anak Belum Datang" tone="accent" items={arriving} action="checkin" caregivers={caregivers.map((item) => item.name)} onCheckIn={handleCheckIn} />}
      {mode === "check-out" && <Column
          title="Di daycare"
          tone="primary"
          items={here}
          action="checkout"
          caregivers={caregivers.map((item) => item.name)}
          additionalFees={additionalFees}
          onCheckOut={(child, input) => checkOut.mutate({ childId: child.id, input })}
        />}
      {mode === "check-out" && left.length > 0 && <section className="mt-6 rounded-xl border border-border/60 bg-card p-5"><h2 className="font-display text-lg">Riwayat Pulang Hari Ini</h2><div className="mt-3 text-sm text-muted-foreground">{left.length} anak sudah menyelesaikan proses check out.</div></section>}
    </AppShell>
  );
}

type CheckInPayload = {
  items: string[];
  expectedOut?: string;
  droppedOffBy?: string;
  caregiver?: string;
  checkInNotes?: string;
};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function BookingForm({
  children,
  packages,
  isSaving,
  onSubmit,
  onCancel,
}: {
  children: Child[];
  packages: MasterPackage[];
  isSaving: boolean;
  onSubmit: (payload: { childId: string; packageName: string; date: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    childId: children[0]?.id ?? "",
    packageName: packages[0]?.name ?? "",
    date: todayDate(),
  });

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
        if (!form.childId || !form.packageName || !form.date) { toast.error("Anak, paket, dan tanggal wajib diisi"); return; }
        onSubmit(form);
      }}
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
          <CalendarPlus className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg">Buat Booking</h2>
          <p className="text-sm text-muted-foreground">Nomor booking dibuat otomatis oleh sistem.</p>
        </div>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Anak</span>
          <select className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.childId} onChange={(event) => setForm({ ...form, childId: event.target.value })}>
            {children.map((child) => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Paket</span>
          <select className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.packageName} onChange={(event) => setForm({ ...form, packageName: event.target.value })}>
            {packages.map((item) => (
              <option key={item.code} value={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Tanggal</span>
          <input className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        </label>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <button type="button" className="rounded-md border border-border px-4 py-2.5 text-sm font-medium" onClick={onCancel}>Batal</button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={isSaving || !children.length || !packages.length}>
          <CalendarPlus className="size-4" /> {isSaving ? "Menyimpan..." : "Buat Booking"}
        </button>
      </div>
    </form>
  );
}

function Column({
  title,
  items,
  tone,
  action,
  caregivers = [],
  additionalFees = [],
  onCheckIn,
  onCheckOut,
}: {
  title: string;
  items: Child[];
  tone: "primary" | "accent" | "muted";
  action?: "checkin" | "checkout";
  caregivers?: string[];
  additionalFees?: Array<{ code: string; name: string; amount: number }>;
  onCheckIn?: (child: Child, input: CheckInPayload) => void;
  onCheckOut?: (child: Child, input: CheckOutInput) => void;
}) {
  const toneClass =
    tone === "primary" ? "bg-primary" : tone === "accent" ? "bg-accent-foreground/40" : "bg-muted-foreground/40";
  return (
    <section className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)]">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${toneClass}`} />
          <h2 className="font-display text-lg">{title}</h2>
        </div>
        <span className="text-xs text-muted-foreground">{items.length} anak</span>
      </div>
      <div className="p-3 space-y-2">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground p-4 text-center">Belum ada.</div>
        )}
        {items.map((c) => (
          <div key={c.id} className="rounded-xl border border-border p-4 bg-surface/70">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-accent text-accent-foreground grid place-items-center text-sm font-semibold">{c.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.parent} · {c.package}</div>
              </div>
              {(c.checkOutTime || c.checkInTime) && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" /> {c.checkOutTime || c.checkInTime}
                </span>
              )}
            </div>

            {(c.droppedOffBy || c.caregiver || c.checkInNotes) && (
              <div className="mt-3 rounded-lg border border-border bg-card p-3 text-xs">
                <div className="grid gap-1.5">
                  {c.droppedOffBy && <MetaLine label="Diantar oleh" value={c.droppedOffBy} />}
                  {c.caregiver && <MetaLine label="Pengasuh" value={c.caregiver} />}
                  {c.checkInNotes && <MetaLine label="Catatan" value={c.checkInNotes} />}
                  {c.pickedUpBy && <MetaLine label="Dijemput oleh" value={c.pickedUpBy} />}
                  {c.checkOutCaregiver && <MetaLine label="Check-out oleh" value={c.checkOutCaregiver} />}
                  {c.checkOutNotes && <MetaLine label="Catatan pulang" value={c.checkOutNotes} />}
                  {c.checkOutAdditionalFees?.length ? (
                    <MetaLine
                      label="Biaya tambahan"
                      value={formatIDR(c.checkOutAdditionalFees.reduce((sum, fee) => sum + fee.amount, 0))}
                    />
                  ) : null}
                </div>
              </div>
            )}

            {c.items.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
                  <Package className="size-3" /> Barang bawaan
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.items.map((it) => (
                    <span key={it} className="text-[11px] px-2 py-0.5 rounded-md bg-card border border-border">{it}</span>
                  ))}
                </div>
              </div>
            )}

            {action === "checkin" && (
              <CheckInCardForm
                child={c}
                caregivers={caregivers}
                onSubmit={(input) => onCheckIn?.(c, input)}
              />
            )}

            {action === "checkout" && (
              <CheckOutCardForm
                child={c}
                caregivers={caregivers}
                additionalFees={additionalFees}
                onSubmit={(input) => onCheckOut?.(c, input)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CheckOutCardForm({
  child,
  caregivers,
  additionalFees,
  onSubmit,
}: {
  child: Child;
  caregivers: string[];
  additionalFees: Array<{ code: string; name: string; amount: number }>;
  onSubmit: (input: CheckOutInput) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    pickedUpBy: child.parent,
    caregiver: child.caregiver || caregivers[0] || "",
    notes: "",
    additionalFeeCodes: [] as string[],
  });

  function toggleFee(code: string) {
    setForm((current) => ({
      ...current,
      additionalFeeCodes: current.additionalFeeCodes.includes(code)
        ? current.additionalFeeCodes.filter((item) => item !== code)
        : [...current.additionalFeeCodes, code],
    }));
  }

  const selectedFeeTotal = additionalFees
    .filter((fee) => form.additionalFeeCodes.includes(fee.code))
    .reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <>
      <button type="button" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card py-2 text-sm font-medium hover:bg-surface" onClick={() => setOpen(true)}><LogOut className="size-4" /> Proses Check-out</button>
      <ModalForm open={open} onOpenChange={setOpen} title={`Check-out ${child.name}`} description="Catat penjemput, petugas, biaya tambahan, dan kondisi kepulangan.">
    <form
      className="grid gap-3 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.pickedUpBy || !form.caregiver) { toast.error("Penjemput dan pengasuh wajib diisi"); return; }
        onSubmit({
          pickedUpBy: form.pickedUpBy,
          caregiver: form.caregiver,
          additionalFeeCodes: form.additionalFeeCodes,
          notes: form.notes || undefined,
        });
        setOpen(false);
      }}
    >
      <div className="grid gap-2">
        <label className="grid min-w-0 gap-1 text-xs">
          <span className="text-muted-foreground">Dijemput oleh</span>
          <input className="min-h-9 w-full min-w-0 rounded-md border border-border bg-surface px-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.pickedUpBy} onChange={(event) => setForm({ ...form, pickedUpBy: event.target.value })} />
        </label>
        <label className="grid min-w-0 gap-1 text-xs">
          <span className="text-muted-foreground">Pengasuh</span>
          <select className="min-h-9 w-full min-w-0 rounded-md border border-border bg-surface px-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.caregiver} onChange={(event) => setForm({ ...form, caregiver: event.target.value })}>
            {caregivers.length === 0 && <option value="">-</option>}
            {caregivers.map((caregiver) => (
              <option key={caregiver} value={caregiver}>{caregiver}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-1 text-xs">
        <span className="text-muted-foreground">Biaya tambahan</span>
        <div className="grid gap-1">
          {additionalFees.map((fee) => (
            <label key={fee.code} className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-2 py-1.5">
              <span className="flex items-center gap-2">
                <input type="checkbox" checked={form.additionalFeeCodes.includes(fee.code)} onChange={() => toggleFee(fee.code)} />
                <span>{fee.name}</span>
              </span>
              <span className="text-muted-foreground">{formatIDR(fee.amount)}</span>
            </label>
          ))}
          {additionalFees.length === 0 && <span className="text-muted-foreground">Tidak ada biaya tambahan aktif.</span>}
        </div>
        {selectedFeeTotal > 0 && <span className="text-right text-muted-foreground">Total tambahan {formatIDR(selectedFeeTotal)}</span>}
      </div>
      <label className="grid min-w-0 gap-1 text-xs">
        <span className="text-muted-foreground">Catatan</span>
        <textarea className="min-h-16 w-full min-w-0 resize-y rounded-md border border-border bg-surface px-2 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </label>
      <div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Batal</button><button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><LogOut className="size-4" /> Simpan Check-out</button></div>
    </form>
      </ModalForm>
    </>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function CheckInCardForm({
  child,
  caregivers,
  onSubmit,
}: {
  child: Child;
  caregivers: string[];
  onSubmit: (input: CheckInPayload) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    items: child.items.join(", "),
    expectedOut: child.expectedOut ?? "17:00",
    droppedOffBy: child.parent,
    caregiver: caregivers[0] ?? "",
    checkInNotes: "",
  });

  return (
    <>
      <button type="button" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90" onClick={() => setOpen(true)}><LogIn className="size-4" /> Proses Check-in</button>
      <ModalForm open={open} onOpenChange={setOpen} title={`Check-in ${child.name}`} description="Catat pengantar, petugas penerima, jadwal pulang, dan barang bawaan.">
    <form
      className="grid gap-3 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.droppedOffBy || !form.caregiver) { toast.error("Pengantar dan pengasuh wajib diisi"); return; }
        onSubmit({
          items: form.items.split(",").map((item) => item.trim()).filter(Boolean),
          expectedOut: form.expectedOut,
          droppedOffBy: form.droppedOffBy,
          caregiver: form.caregiver,
          checkInNotes: form.checkInNotes || undefined,
        });
        setOpen(false);
      }}
    >
      <div className="grid gap-2">
        <label className="grid min-w-0 gap-1 text-xs">
          <span className="text-muted-foreground">Diantar oleh</span>
          <input className="min-h-9 w-full min-w-0 rounded-md border border-border bg-surface px-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.droppedOffBy} onChange={(event) => setForm({ ...form, droppedOffBy: event.target.value })} />
        </label>
        <label className="grid min-w-0 gap-1 text-xs">
          <span className="text-muted-foreground">Pengasuh</span>
          <select className="min-h-9 w-full min-w-0 rounded-md border border-border bg-surface px-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.caregiver} onChange={(event) => setForm({ ...form, caregiver: event.target.value })}>
            {caregivers.length === 0 && <option value="">-</option>}
            {caregivers.map((caregiver) => (
              <option key={caregiver} value={caregiver}>{caregiver}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-xs">
          <span className="text-muted-foreground">Estimasi pulang</span>
          <input className="min-h-9 w-full min-w-0 rounded-md border border-border bg-surface px-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" type="time" value={form.expectedOut} onChange={(event) => setForm({ ...form, expectedOut: event.target.value })} />
        </label>
        <label className="grid min-w-0 gap-1 text-xs">
          <span className="text-muted-foreground">Barang bawaan</span>
          <input className="min-h-9 w-full min-w-0 rounded-md border border-border bg-surface px-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.items} onChange={(event) => setForm({ ...form, items: event.target.value })} />
        </label>
      </div>
      <label className="grid min-w-0 gap-1 text-xs">
        <span className="text-muted-foreground">Catatan</span>
        <textarea className="min-h-16 w-full min-w-0 resize-y rounded-md border border-border bg-surface px-2 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={form.checkInNotes} onChange={(event) => setForm({ ...form, checkInNotes: event.target.value })} />
      </label>
      <div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" className="rounded-md border border-border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Batal</button><button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><LogIn className="size-4" /> Simpan Check-in</button></div>
    </form>
      </ModalForm>
    </>
  );
}
