import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  daycareApi,
  daycareQueryKey,
  masterDataQueryKey,
  appConfigQueryKey,
  type DaycareProfile,
  type UpdateDaycareProfileInput,
} from "@/lib/daycare-api";
import { Building2, Clock, Mail, MapPin, Phone, Save, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Lumi Daycare" },
      { name: "description", content: "Pengaturan profil daycare dan konfigurasi dasar operasional." },
    ],
  }),
  component: () => <Navigate to="/pengaturan/profil" replace />,
});

const emptyProfile: DaycareProfile = {
  name: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  operationalStart: "07:00",
  operationalEnd: "18:00",
  defaultCapacity: 0,
};

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: masterDataQueryKey, queryFn: daycareApi.masterData });
  const profile = data?.daycareProfile ?? emptyProfile;
  const [form, setForm] = useState<DaycareProfile>(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: daycareApi.updateDaycareProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKey });
      queryClient.invalidateQueries({ queryKey: daycareQueryKey });
      queryClient.invalidateQueries({ queryKey: appConfigQueryKey });
      toast.success("Profil daycare berhasil disimpan");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AppShell title="Profil Daycare" description="Profil daycare dipakai sebagai acuan kapasitas, jam operasional, dan identitas admin.">
      {isLoading && <div className="mb-4 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">Memuat pengaturan...</div>}

      <form
        className="grid gap-5 xl:grid-cols-[1fr_0.7fr]"
        onSubmit={(event) => {
          event.preventDefault();
          updateProfile.mutate({
            ...form,
            defaultCapacity: Number(form.defaultCapacity),
          } satisfies UpdateDaycareProfileInput);
        }}
      >
        <section className="rounded-xl border border-border/70 bg-card shadow-[0_4px_20px_rgba(155,135,245,0.06)]">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Building2 className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-lg text-primary">Profil Daycare</h2>
                <p className="text-sm text-muted-foreground">Identitas lembaga dan kontak operasional.</p>
              </div>
            </div>
            <div className="flex gap-2"><button type="button" className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold" onClick={() => setForm(profile)}>Batal</button><button
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-60"
              disabled={updateProfile.isPending}
            >
              <Save className="size-4" />
              {updateProfile.isPending ? "Menyimpan" : "Simpan"}
            </button></div>
          </div>

          <div className="grid gap-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                icon={Building2}
                label="Nama daycare"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />
              <Field
                icon={Mail}
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
              />
            </div>
            <Field
              icon={MapPin}
              label="Alamat"
              value={form.address}
              onChange={(value) => setForm({ ...form, address: value })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                icon={Phone}
                label="Telepon"
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
              />
              <Field
                icon={Building2}
                label="Website"
                value={form.website ?? ""}
                onChange={(value) => setForm({ ...form, website: value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                icon={Clock}
                label="Buka"
                type="time"
                value={form.operationalStart}
                onChange={(value) => setForm({ ...form, operationalStart: value })}
              />
              <Field
                icon={Clock}
                label="Tutup"
                type="time"
                value={form.operationalEnd}
                onChange={(value) => setForm({ ...form, operationalEnd: value })}
              />
              <Field
                icon={Users}
                label="Kapasitas default"
                type="number"
                value={String(form.defaultCapacity)}
                onChange={(value) => setForm({ ...form, defaultCapacity: Number(value) })}
              />
            </div>
            {updateProfile.error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {updateProfile.error.message}
              </div>
            )}
          </div>
        </section>

        <aside className="grid content-start gap-5">
          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-[0_4px_20px_rgba(155,135,245,0.06)]">
            <h2 className="font-display text-lg text-primary">Ringkasan Operasional</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <InfoLine label="Jam operasional" value={`${form.operationalStart || "-"} - ${form.operationalEnd || "-"}`} />
              <InfoLine label="Kapasitas" value={`${form.defaultCapacity || 0} anak`} />
              <InfoLine label="Shift terdaftar" value={`${data?.shifts.length ?? 0} shift`} />
              <InfoLine label="Hari libur" value={`${data?.holidays.length ?? 0} hari`} />
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-[0_4px_20px_rgba(155,135,245,0.06)]">
            <h2 className="font-display text-lg text-primary">Kontak Publik</h2>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p>{form.name || "Nama daycare belum diisi"}</p>
              <p>{form.address || "Alamat belum diisi"}</p>
              <p>{form.phone || "Telepon belum diisi"}</p>
              <p>{form.email || "Email belum diisi"}</p>
            </div>
          </div>
        </aside>
      </form>
    </AppShell>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface px-3 py-2.5">
        <Icon className="size-4 text-muted-foreground" />
        <input
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
