import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { daycareApi, daycareQueryKey, type CreateChildInput, type MasterPackage, type ParentGuardian } from "@/lib/daycare-api";
import { AlertTriangle, Baby, ClipboardList, HeartPulse, Package, Phone, Plus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { ModalForm } from "@/components/common/modal-form";

export const Route = createFileRoute("/children")({
  head: () => ({
    meta: [
      { title: "Anak & Orang Tua — Lumi Daycare" },
      { name: "description", content: "Daftar anak terdaftar lengkap dengan data orang tua, alergi, dan instruksi medis." },
    ],
  }),
  component: () => <Navigate to="/master/anak" replace />,
});

const statusTone: Record<string, string> = {
  "Di Daycare": "bg-success/20 text-success-foreground",
  "Sudah Pulang": "bg-muted text-muted-foreground",
  "Belum Datang": "bg-accent text-accent-foreground",
};

export function ChildrenPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: daycareQueryKey, queryFn: daycareApi.snapshot });
  const children = data?.children ?? [];
  const parents = data?.parents ?? [];
  const parentById = new Map(parents.map((parent) => [parent.id, parent]));
  const packages = data?.masterData.packages.filter((item) => item.status === "Aktif") ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const createChild = useMutation({
    mutationFn: daycareApi.createChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: daycareQueryKey });
      setFormOpen(false);
      toast.success("Anak berhasil didaftarkan");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Anak & Orang Tua"
      description="Profil lengkap anak: kontak orang tua, alergi, instruksi medis, dan paket."
      actions={<button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90" onClick={() => setFormOpen(true)}><Plus className="size-4" /> Registrasi Anak</button>}
    >
      <ModalForm open={formOpen} onOpenChange={setFormOpen} title="Registrasi Anak" size="xl" showHeader={false}>
        {formOpen && <AddChildForm packages={packages} isSaving={createChild.isPending} onCancel={() => setFormOpen(false)} onSubmit={(payload) => createChild.mutate(payload)} />}
      </ModalForm>
      {isLoading && <div className="mb-4 rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] p-3 text-sm text-muted-foreground">Memuat daftar anak...</div>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {children.map((c) => {
          const linkedParent = c.parentId ? parentById.get(c.parentId) : undefined;
          return (
          <article key={c.id} className="rounded-xl border border-border bg-card shadow-[0_4px_20px_rgba(155,135,245,0.08)] p-5 flex flex-col">
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-lg bg-accent text-accent-foreground grid place-items-center font-display text-lg">
                {c.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg leading-tight">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.age} · Paket {c.package}</div>
              </div>
              <span className={`text-[11px] px-2 py-1 rounded-full ${statusTone[c.status]}`}>{c.status}</span>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                <span>{linkedParent?.displayName ?? c.parent} · {linkedParent?.primaryPhone ?? c.parentPhone}</span>
              </div>
              {linkedParent && (
                <div className="grid gap-2 rounded-xl bg-surface border border-border p-3 text-xs text-muted-foreground">
                  <ParentLine label="Ibu" value={[linkedParent.motherName, linkedParent.motherPhone].filter(Boolean).join(" · ")} />
                  <ParentLine label="Ayah" value={[linkedParent.fatherName, linkedParent.fatherPhone].filter(Boolean).join(" · ")} />
                  <ParentLine label="Darurat" value={[linkedParent.emergencyContactName, linkedParent.emergencyContactPhone].filter(Boolean).join(" · ")} />
                </div>
              )}
              {c.allergies.length > 0 ? (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 mt-0.5 text-warning-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Alergi</div>
                    <div>{c.allergies.join(", ")}</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Tidak ada alergi tercatat</div>
              )}
              {c.notes && (
                <div className="rounded-xl bg-surface border border-border p-3 text-sm">
                  <div className="text-xs text-muted-foreground mb-1">Instruksi</div>
                  {c.notes}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Package className="size-3.5" /> Barang bawaan ({c.items.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.items.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                {c.items.map((i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-xl bg-surface border border-border">{i}</span>
                ))}
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </AppShell>
  );
}

function ParentLine({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function AddChildForm({
  packages,
  isSaving,
  onSubmit,
  onCancel,
}: {
  packages: MasterPackage[];
  isSaving: boolean;
  onSubmit: (payload: CreateChildInput) => void;
  onCancel: () => void;
}) {
  const defaultPackage = packages[0]?.name ?? "";
  const defaultCheckout = packages[0]?.checkOutTime ?? "17:00";
  const [form, setForm] = useState({
    name: "",
    age: "",
    parent: "",
    parentPhone: "",
    fatherName: "",
    fatherPhone: "",
    fatherOccupation: "",
    motherName: "",
    motherPhone: "",
    motherOccupation: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    email: "",
    address: "",
    allergies: "",
    notes: "",
    package: defaultPackage,
    expectedOut: defaultCheckout,
    items: "",
  });
  const selectedPackage = packages.find((item) => item.name === form.package);

  useEffect(() => {
    if (!form.package && defaultPackage) {
      setForm((current) => ({ ...current, package: defaultPackage, expectedOut: defaultCheckout }));
    }
  }, [defaultCheckout, defaultPackage, form.package]);

  return (
    <form
      className="bg-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.name || !form.age || !form.parent || !form.parentPhone) { toast.error("Nama anak, usia, kontak utama, dan nomor kontak wajib diisi"); return; }
        onSubmit({
          name: form.name,
          age: form.age,
          parent: form.parent,
          parentPhone: form.parentPhone,
          fatherName: form.fatherName || undefined,
          fatherPhone: form.fatherPhone || undefined,
          fatherOccupation: form.fatherOccupation || undefined,
          motherName: form.motherName || undefined,
          motherPhone: form.motherPhone || undefined,
          motherOccupation: form.motherOccupation || undefined,
          emergencyContactName: form.emergencyContactName || undefined,
          emergencyContactPhone: form.emergencyContactPhone || undefined,
          email: form.email || undefined,
          address: form.address || undefined,
          allergies: splitList(form.allergies),
          notes: form.notes || undefined,
          package: form.package || defaultPackage,
          expectedOut: form.expectedOut || selectedPackage?.checkOutTime || defaultCheckout,
          items: splitList(form.items),
        });
        setForm({
          name: "",
          age: "",
          parent: "",
          parentPhone: "",
          fatherName: "",
          fatherPhone: "",
          fatherOccupation: "",
          motherName: "",
          motherPhone: "",
          motherOccupation: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          email: "",
          address: "",
          allergies: "",
          notes: "",
          package: defaultPackage,
          expectedOut: defaultCheckout,
          items: "",
        });
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-lg">Registrasi Anak</h2>
          <p className="text-sm text-muted-foreground">Data anak, wali, medis, paket, dan inventaris awal.</p>
        </div>
        <div className="hidden rounded-lg bg-accent p-2 text-accent-foreground sm:grid">
          <Baby className="size-5" />
        </div>
      </div>
      <div className="grid items-start gap-5 p-5 xl:grid-cols-[1.05fr_1.35fr]">
        <div className="grid gap-5">
          <FormSection icon={Baby} title="Data Anak">
            <TextInput label="Nama anak" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <TextInput label="Usia" placeholder="Contoh: 3 thn" value={form.age} onChange={(value) => setForm({ ...form, age: value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <SelectInput
                label="Paket daycare"
                value={form.package || defaultPackage}
                onChange={(value) => {
                  const nextPackage = packages.find((item) => item.name === value);
                  setForm({ ...form, package: value, expectedOut: nextPackage?.checkOutTime ?? form.expectedOut });
                }}
              >
                {packages.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </SelectInput>
              <TextInput label="Estimasi pulang" type="time" value={form.expectedOut} onChange={(value) => setForm({ ...form, expectedOut: value })} />
            </div>
          </FormSection>

          <FormSection icon={HeartPulse} title="Alergi & Instruksi Medis">
            <TextInput label="Alergi" placeholder="Pisahkan dengan koma" value={form.allergies} onChange={(value) => setForm({ ...form, allergies: value })} />
            <TextAreaInput label="Instruksi medis" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
          </FormSection>
        </div>

        <div className="grid gap-5">
          <FormSection icon={UserRound} title="Orang Tua / Wali">
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput label="Kontak utama" placeholder="Contoh: Bunda Maya" value={form.parent} onChange={(value) => setForm({ ...form, parent: value })} />
              <TextInput label="No. kontak utama" value={form.parentPhone} onChange={(value) => setForm({ ...form, parentPhone: value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <TextInput label="Nama ibu" value={form.motherName} onChange={(value) => setForm({ ...form, motherName: value })} />
              <TextInput label="Telepon ibu" value={form.motherPhone} onChange={(value) => setForm({ ...form, motherPhone: value })} />
              <TextInput label="Pekerjaan ibu" value={form.motherOccupation} onChange={(value) => setForm({ ...form, motherOccupation: value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <TextInput label="Nama ayah" value={form.fatherName} onChange={(value) => setForm({ ...form, fatherName: value })} />
              <TextInput label="Telepon ayah" value={form.fatherPhone} onChange={(value) => setForm({ ...form, fatherPhone: value })} />
              <TextInput label="Pekerjaan ayah" value={form.fatherOccupation} onChange={(value) => setForm({ ...form, fatherOccupation: value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput label="Kontak darurat" value={form.emergencyContactName} onChange={(value) => setForm({ ...form, emergencyContactName: value })} />
              <TextInput label="Telepon darurat" value={form.emergencyContactPhone} onChange={(value) => setForm({ ...form, emergencyContactPhone: value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              <TextInput label="Alamat" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
            </div>
          </FormSection>

          <FormSection icon={ClipboardList} title="Barang Bawaan">
            <TextAreaInput label="Inventaris awal" placeholder="Botol susu (2), baju ganti, selimut" value={form.items} onChange={(value) => setForm({ ...form, items: value })} />
          </FormSection>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
        <button type="button" className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium" onClick={onCancel}>Batal</button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={isSaving || !packages.length}>
          <Plus className="size-4" /> {isSaving ? "Menyimpan..." : "Daftarkan Anak"}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Baby;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface/70 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </span>
        <h3 className="font-display text-base">{title}</h3>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        className="min-h-10 w-full min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <textarea
        className="min-h-20 w-full min-w-0 resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        className="min-h-10 w-full min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
