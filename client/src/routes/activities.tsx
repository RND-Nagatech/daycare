import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import {
  daycareApi,
  daycareQueryKey,
  type CreateHealthNoteInput,
  type CreateIncidentInput,
  type HealthNote,
  type Incident,
  type MasterActivity,
} from "@/lib/daycare-api";
import { AlertTriangle, Baby, Blocks, Camera, Droplets, HeartPulse, Moon, Pill, Plus, ShieldAlert, Utensils } from "lucide-react";
import { toast } from "sonner";
import { ModalForm } from "@/components/common/modal-form";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Log Aktivitas — Lumi Daycare" },
      { name: "description", content: "Catatan harian pengasuh: makan, tidur, mandi, obat, dan main." },
    ],
  }),
  component: () => <Navigate to="/operasional/aktivitas-harian" replace />,
});

const typeIcon: Record<string, ComponentType<{ className?: string }>> = {
  Makan: Utensils,
  Tidur: Moon,
  Mandi: Droplets,
  Obat: Pill,
  Main: Blocks,
  Popok: Baby,
};

const typeTone: Record<string, string> = {
  Makan: "bg-warning/25 text-warning-foreground",
  Tidur: "bg-primary/15 text-primary",
  Mandi: "bg-accent text-accent-foreground",
  Obat: "bg-destructive/15 text-destructive",
  Main: "bg-success/20 text-success-foreground",
  Popok: "bg-muted text-muted-foreground",
};

export type ActivityPageMode = "activity" | "health" | "incident";

export function ActivityFeaturePage({ mode }: { mode: ActivityPageMode }) {
  const queryClient = useQueryClient();
  const [activeForm, setActiveForm] = useState<"activity" | "health" | "incident" | null>(null);
  const { data, isLoading } = useQuery({ queryKey: daycareQueryKey, queryFn: daycareApi.snapshot });
  const createActivity = useMutation({
    mutationFn: daycareApi.createActivity,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: daycareQueryKey }); setActiveForm(null); toast.success("Aktivitas berhasil dicatat"); },
    onError: (error) => toast.error(error.message),
  });
  const createHealthNote = useMutation({
    mutationFn: daycareApi.createHealthNote,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: daycareQueryKey }); setActiveForm(null); toast.success("Catatan kesehatan berhasil disimpan"); },
    onError: (error) => toast.error(error.message),
  });
  const createIncident = useMutation({
    mutationFn: daycareApi.createIncident,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: daycareQueryKey }); setActiveForm(null); toast.success("Insiden berhasil dilaporkan"); },
    onError: (error) => toast.error(error.message),
  });
  const children = data?.children ?? [];
  const activities = data?.activities ?? [];
  const healthNotes = data?.healthNotes ?? [];
  const incidents = data?.incidents ?? [];
  const activityTypes = data?.masterData.activityTypes.filter((item) => item.status === "Aktif") ?? [];
  const caregivers = data?.masterData.caregivers.filter((item) => item.status === "Aktif") ?? [];
  const childById = (id: string) => children.find((child) => child.id === id);
  const sorted = [...activities].sort((a, b) => b.time.localeCompare(a.time));
  const pageCopy = {
    activity: { title: "Aktivitas Harian", description: "Input dan pantau timeline aktivitas anak yang sedang dititipkan." },
    health: { title: "Catatan Kesehatan", description: "Kelola catatan suhu, obat, alergi, luka, dan kondisi medis anak." },
    incident: { title: "Insiden", description: "Dokumentasikan insiden, penanganan, serta tindak lanjut kepada orang tua." },
  }[mode];

  return (
    <AppShell
      title={pageCopy.title}
      description={pageCopy.description}
      actions={<button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground" onClick={() => setActiveForm(mode)}>{mode === "activity" ? <Plus className="size-4" /> : mode === "health" ? <HeartPulse className="size-4" /> : <ShieldAlert className="size-4" />}{mode === "activity" ? "Catat Aktivitas" : mode === "health" ? "Tambah Catatan" : "Lapor Insiden"}</button>}
    >
      <ModalForm open={activeForm === "activity"} onOpenChange={(open) => { if (!open) setActiveForm(null); }} title="Catat Aktivitas" showHeader={false}>
        {activeForm === "activity" && <ActivityForm children={children} activityTypes={activityTypes} caregivers={caregivers.map((item) => item.name)} isSaving={createActivity.isPending} onCancel={() => setActiveForm(null)} onSubmit={(payload) => createActivity.mutate(payload)} />}
      </ModalForm>
      <ModalForm open={activeForm === "health"} onOpenChange={(open) => { if (!open) setActiveForm(null); }} title="Catatan Kesehatan" showHeader={false}>
        {activeForm === "health" && <HealthNoteForm
          children={children}
          caregivers={caregivers.map((item) => item.name)}
          isSaving={createHealthNote.isPending}
          onCancel={() => setActiveForm(null)}
          onSubmit={(payload) => createHealthNote.mutate(payload)}
        />}
      </ModalForm>
      <ModalForm open={activeForm === "incident"} onOpenChange={(open) => { if (!open) setActiveForm(null); }} title="Laporan Insiden" showHeader={false}>
        {activeForm === "incident" && <IncidentForm
          children={children}
          caregivers={caregivers.map((item) => item.name)}
          isSaving={createIncident.isPending}
          onCancel={() => setActiveForm(null)}
          onSubmit={(payload) => createIncident.mutate(payload)}
        />}
      </ModalForm>
      {isLoading && <div className="mb-4 rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] p-3 text-sm text-muted-foreground">Memuat aktivitas...</div>}

      {mode === "health" && <HealthNoteList items={healthNotes} childName={(id) => childById(id)?.name ?? "Anak"} />}
      {mode === "incident" && <IncidentList items={incidents} childName={(id) => childById(id)?.name ?? "Anak"} />}

      {mode === "activity" && <><div className="flex flex-wrap gap-2 mb-6">
        {["Semua", ...activityTypes.map((item) => item.name)].map((f, i) => (
          <button
            key={f}
            className={
              "text-xs px-3 py-1.5 rounded-full border " +
              (i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] overflow-hidden">
        <ul className="divide-y divide-border">
          {sorted.map((a) => {
            const Icon = typeIcon[a.type] ?? Blocks;
            const child = childById(a.childId);
            return (
              <li key={a.id} className="flex items-start gap-4 p-5">
                <div className="text-right shrink-0 w-14">
                  <div className="font-display text-lg leading-none">{a.time}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">hari ini</div>
                </div>
                <div className={`size-10 rounded-lg grid place-items-center ${typeTone[a.type]}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{child?.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border">{a.type}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{a.detail}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/80">
                    <span>oleh {a.staff}</span>
                    {a.photoUrl && (
                      <a href={a.photoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-foreground hover:bg-card">
                        <Camera className="size-3" /> Foto
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      </>}
    </AppShell>
  );
}

function toDateTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function HealthNoteForm({
  children,
  caregivers,
  isSaving,
  onSubmit,
  onCancel,
}: {
  children: Array<{ id: string; name: string }>;
  caregivers: string[];
  isSaving: boolean;
  onSubmit: (payload: CreateHealthNoteInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    childId: "",
    category: "Suhu" as CreateHealthNoteInput["category"],
    note: "",
    temperature: "",
    medicationName: "",
    dosage: "",
    handledBy: "",
    parentNotified: false,
    recordedAt: "",
  });
  const selectedChildId = form.childId || children[0]?.id || "";
  const selectedCaregiver = form.handledBy || caregivers[0] || "";

  return (
    <form
      className="bg-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!selectedChildId || !selectedCaregiver || !form.note) { toast.error("Anak, petugas, dan catatan wajib diisi"); return; }
        onSubmit({
          childId: selectedChildId,
          category: form.category,
          note: form.note,
          temperature: form.temperature ? Number(form.temperature) : undefined,
          medicationName: form.medicationName || undefined,
          dosage: form.dosage || undefined,
          handledBy: selectedCaregiver,
          parentNotified: form.parentNotified,
          recordedAt: form.recordedAt || undefined,
        });
        setForm({ ...form, note: "", temperature: "", medicationName: "", dosage: "", recordedAt: "" });
      }}
    >
      <FormHeader icon={HeartPulse} title="Catatan Kesehatan" description="Suhu, obat, alergi, luka, dan kondisi medis harian." />
      <div className="grid gap-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Anak" value={selectedChildId} onChange={(value) => setForm({ ...form, childId: value })}>
            {children.map((child) => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </SelectField>
          <SelectField label="Kategori" value={form.category} onChange={(value) => setForm({ ...form, category: value as CreateHealthNoteInput["category"] })}>
            {["Suhu", "Obat", "Alergi", "Luka", "Lainnya"].map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </SelectField>
        </div>
        <textarea className="min-h-20 resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" placeholder="Catatan kondisi anak" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField label="Suhu" type="number" value={form.temperature} onChange={(value) => setForm({ ...form, temperature: value })} />
          <TextField label="Nama obat" value={form.medicationName} onChange={(value) => setForm({ ...form, medicationName: value })} />
          <TextField label="Dosis" value={form.dosage} onChange={(value) => setForm({ ...form, dosage: value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Ditangani oleh" value={selectedCaregiver} onChange={(value) => setForm({ ...form, handledBy: value })}>
            {caregivers.map((caregiver) => (
              <option key={caregiver} value={caregiver}>{caregiver}</option>
            ))}
          </SelectField>
          <TextField label="Waktu" type="datetime-local" value={form.recordedAt} onChange={(value) => setForm({ ...form, recordedAt: value })} />
        </div>
        <FormFooter
          onCancel={onCancel}
          checked={form.parentNotified}
          onCheckedChange={(checked) => setForm({ ...form, parentNotified: checked })}
          buttonLabel={isSaving ? "Menyimpan..." : "Simpan Catatan"}
          disabled={isSaving || !children.length || !caregivers.length}
        />
      </div>
    </form>
  );
}

function IncidentForm({
  children,
  caregivers,
  isSaving,
  onSubmit,
  onCancel,
}: {
  children: Array<{ id: string; name: string }>;
  caregivers: string[];
  isSaving: boolean;
  onSubmit: (payload: CreateIncidentInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    childId: "",
    title: "",
    description: "",
    actionTaken: "",
    severity: "Ringan" as CreateIncidentInput["severity"],
    handledBy: "",
    parentNotified: false,
    occurredAt: "",
  });
  const selectedChildId = form.childId || children[0]?.id || "";
  const selectedCaregiver = form.handledBy || caregivers[0] || "";

  return (
    <form
      className="bg-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!selectedChildId || !selectedCaregiver || !form.title || !form.description || !form.actionTaken) { toast.error("Semua data utama insiden wajib diisi"); return; }
        onSubmit({
          childId: selectedChildId,
          title: form.title,
          description: form.description,
          actionTaken: form.actionTaken,
          severity: form.severity,
          handledBy: selectedCaregiver,
          parentNotified: form.parentNotified,
          occurredAt: form.occurredAt || undefined,
        });
        setForm({ ...form, title: "", description: "", actionTaken: "", occurredAt: "" });
      }}
    >
      <FormHeader icon={ShieldAlert} title="Laporan Insiden" description="Catatan kejadian, tindakan, tingkat risiko, dan notifikasi orang tua." />
      <div className="grid gap-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Anak" value={selectedChildId} onChange={(value) => setForm({ ...form, childId: value })}>
            {children.map((child) => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </SelectField>
          <SelectField label="Tingkat" value={form.severity} onChange={(value) => setForm({ ...form, severity: value as CreateIncidentInput["severity"] })}>
            {["Ringan", "Sedang", "Tinggi"].map((severity) => (
              <option key={severity} value={severity}>{severity}</option>
            ))}
          </SelectField>
        </div>
        <TextField label="Judul kejadian" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <textarea className="min-h-20 resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" placeholder="Deskripsi kejadian" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <textarea className="min-h-20 resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" placeholder="Tindakan yang dilakukan" value={form.actionTaken} onChange={(event) => setForm({ ...form, actionTaken: event.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Ditangani oleh" value={selectedCaregiver} onChange={(value) => setForm({ ...form, handledBy: value })}>
            {caregivers.map((caregiver) => (
              <option key={caregiver} value={caregiver}>{caregiver}</option>
            ))}
          </SelectField>
          <TextField label="Waktu" type="datetime-local" value={form.occurredAt} onChange={(value) => setForm({ ...form, occurredAt: value })} />
        </div>
        <FormFooter
          onCancel={onCancel}
          checked={form.parentNotified}
          onCheckedChange={(checked) => setForm({ ...form, parentNotified: checked })}
          buttonLabel={isSaving ? "Menyimpan..." : "Simpan Insiden"}
          disabled={isSaving || !children.length || !caregivers.length}
        />
      </div>
    </form>
  );
}

function HealthNoteList({ items, childName }: { items: HealthNote[]; childName: (id: string) => string }) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)]">
      <FormHeader icon={HeartPulse} title="Riwayat Kesehatan" description={`${items.length} catatan tersimpan`} />
      <div className="divide-y divide-border">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{childName(item.childId)} · {item.category}</div>
              <span className="text-xs text-muted-foreground">{toDateTimeLabel(item.recordedAt)}</span>
            </div>
            <p className="mt-1 text-muted-foreground">{item.note}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {item.temperature !== undefined && <span>{item.temperature} C</span>}
              {item.medicationName && <span>{item.medicationName}</span>}
              <span>oleh {item.handledBy}</span>
              {item.parentNotified && <span className="text-success-foreground">Orang tua sudah diberi tahu</span>}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="p-4 text-sm text-muted-foreground">Belum ada catatan kesehatan.</div>}
      </div>
    </section>
  );
}

function IncidentList({ items, childName }: { items: Incident[]; childName: (id: string) => string }) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)]">
      <FormHeader icon={AlertTriangle} title="Riwayat Insiden" description={`${items.length} laporan tersimpan`} />
      <div className="divide-y divide-border">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{item.title}</div>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">{item.severity}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{childName(item.childId)} · {toDateTimeLabel(item.occurredAt)}</div>
            <p className="mt-2 text-muted-foreground">{item.description}</p>
            <div className="mt-2 text-xs text-muted-foreground">Tindakan: {item.actionTaken}</div>
          </div>
        ))}
        {items.length === 0 && <div className="p-4 text-sm text-muted-foreground">Belum ada laporan insiden.</div>}
      </div>
    </section>
  );
}

function FormHeader({ icon: Icon, title, description }: { icon: ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-5 py-4">
      <div className="hidden rounded-lg bg-accent p-2 text-accent-foreground sm:grid">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="font-display text-lg">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function FormFooter({
  checked,
  onCheckedChange,
  buttonLabel,
  disabled,
  onCancel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  buttonLabel: string;
  disabled: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input className="size-4 accent-primary" type="checkbox" checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} />
        Orang tua sudah diberi tahu
      </label>
      <div className="flex gap-2"><button type="button" className="rounded-md border border-border px-4 py-2.5 text-sm font-medium" onClick={onCancel}>Batal</button><button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={disabled}><Plus className="size-4" /> {buttonLabel}</button></div>
    </div>
  );
}

function ActivityForm({
  children,
  activityTypes,
  caregivers,
  isSaving,
  onSubmit,
  onCancel,
}: {
  children: Array<{ id: string; name: string }>;
  activityTypes: MasterActivity[];
  caregivers: string[];
  isSaving: boolean;
  onSubmit: (payload: { childId: string; type: string; detail: string; staff: string; time?: string; photoUrl?: string }) => void;
  onCancel: () => void;
}) {
  const defaultActivityType = activityTypes[0]?.name ?? "";
  const defaultCaregiver = caregivers[0] ?? "";
  const [form, setForm] = useState({
    childId: "",
    type: defaultActivityType,
    detail: "",
    staff: defaultCaregiver,
    time: "",
    photoUrl: "",
  });
  const selectedChildId = form.childId || children[0]?.id || "";
  const selectedActivityType = form.type || defaultActivityType;
  const selectedCaregiver = form.staff || defaultCaregiver;

  useEffect(() => {
    if (!form.type && defaultActivityType) {
      setForm((current) => ({ ...current, type: defaultActivityType }));
    }
  }, [defaultActivityType, form.type]);

  useEffect(() => {
    if (!form.staff && defaultCaregiver) {
      setForm((current) => ({ ...current, staff: defaultCaregiver }));
    }
  }, [defaultCaregiver, form.staff]);

  return (
    <form
      className="bg-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!selectedChildId || !form.detail || !selectedCaregiver) { toast.error("Anak, pengasuh, dan catatan aktivitas wajib diisi"); return; }
        onSubmit({
          childId: selectedChildId,
          type: selectedActivityType,
          detail: form.detail,
          staff: selectedCaregiver,
          time: form.time || undefined,
          photoUrl: form.photoUrl || undefined,
        });
        setForm({ ...form, type: selectedActivityType, staff: selectedCaregiver, detail: "", time: "", photoUrl: "" });
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-lg">Catat Aktivitas</h2>
          <p className="text-sm text-muted-foreground">Anak, aktivitas, jam, catatan, foto, dan pengasuh.</p>
        </div>
        <div className="hidden rounded-lg bg-accent p-2 text-accent-foreground sm:grid">
          <Blocks className="size-5" />
        </div>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Anak</span>
            <select className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={selectedChildId} onChange={(e) => setForm({ ...form, childId: e.target.value })}>
              {children.map((child) => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Aktivitas</span>
            <select className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={selectedActivityType} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {activityTypes.map((type) => (
                <option key={type.code} value={type.name}>{type.name}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Jam</span>
              <input className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Pengasuh</span>
              <select className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" value={selectedCaregiver} onChange={(e) => setForm({ ...form, staff: e.target.value })}>
                {caregivers.map((caregiver) => (
                  <option key={caregiver} value={caregiver}>{caregiver}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Catatan</span>
            <textarea className="min-h-24 resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" placeholder="Contoh: Makan siang habis, tidur 45 menit, atau catatan obat." value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Foto referensi</span>
            <input className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" placeholder="URL foto opsional" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <button type="button" className="rounded-md border border-border px-4 py-2.5 text-sm font-medium" onClick={onCancel}>Batal</button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={isSaving || !children.length || !activityTypes.length || !caregivers.length}>
          <Plus className="size-4" /> {isSaving ? "Menyimpan..." : "Catat Aktivitas"}
        </button>
      </div>
    </form>
  );
}
