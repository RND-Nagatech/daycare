import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { daycareApi, daycareQueryKey, masterDataQueryKey } from "@/lib/daycare-api";
import {
  findMasterResourceConfig,
  type MasterField,
  type MasterRecord,
  type MasterResourceConfig,
  type MasterResourceKey,
} from "@/lib/master-data-config";
import { ArrowLeft, Edit3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ModalForm } from "@/components/common/modal-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataColumn } from "@/components/common/data-table";

export const Route = createFileRoute("/master-data/$resource")({
  head: ({ params }) => {
    const config = findMasterResourceConfig(params.resource);
    return {
      meta: [
        { title: `${config?.label ?? "Master Data"} — Lumi Daycare` },
        { name: "description", content: config?.description ?? "Pengelolaan master data daycare." },
      ],
    };
  },
  component: LegacyMasterResourcePage,
});

function LegacyMasterResourcePage() {
  const { resource } = Route.useParams();
  return <Navigate to="/master/$resource" params={{ resource }} replace />;
}

export function MasterResourceView({ resource }: { resource: string }) {
  const config = findMasterResourceConfig(resource);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<MasterRecord | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<MasterRecord | null>(null);

  const queryKey = ["master-resource", resource] as const;
  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => daycareApi.masterResource(resource as MasterResourceKey),
    enabled: Boolean(config),
  });
  const { data: masterData } = useQuery({ queryKey: masterDataQueryKey, queryFn: daycareApi.masterData });
  const shiftOptions = (masterData?.shifts ?? [])
    .filter((shift) => shift.status === "Aktif")
    .map((shift) => ({ value: shift.code, label: `${shift.name} (${shift.startTime}-${shift.endTime})`, name: shift.name }));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: masterDataQueryKey });
    queryClient.invalidateQueries({ queryKey: daycareQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: (payload: MasterRecord) => daycareApi.createMasterResource(resource as MasterResourceKey, payload),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setEditing(null);
      toast.success(`${config?.label ?? "Data"} berhasil ditambahkan`);
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MasterRecord }) =>
      daycareApi.updateMasterResource(resource as MasterResourceKey, id, payload),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setEditing(null);
      toast.success(`${config?.label ?? "Data"} berhasil diperbarui`);
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => daycareApi.deleteMasterResource(resource as MasterResourceKey, id),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success("Data berhasil dihapus");
    },
    onError: (error) => toast.error(error.message),
  });

  if (!config) {
    return (
      <AppShell title="Master Data" description="Submenu master tidak ditemukan.">
        <Link to="/master/$resource" params={{ resource: "pengasuh" }} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="size-4" /> Kembali ke Master Data
        </Link>
      </AppShell>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AppShell
      title={config.label}
      description={config.description}
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Tambah {config.label}
        </button>
      }
    >
      <ModalForm
        open={isFormOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }}
        title={editing ? `Edit ${config.label}` : `Tambah ${config.label}`}
        description="Lengkapi data wajib, lalu simpan untuk kembali ke daftar."
        size="xl"
      >
        {isFormOpen && <MasterForm
          key={editing ? String(editing[config.idField]) : `new-${config.key}`}
          config={config}
          initialValue={editing}
          isSaving={isSaving}
          error={createMutation.error?.message ?? updateMutation.error?.message}
          shiftOptions={shiftOptions}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={(payload) => {
            if (editing) {
              updateMutation.mutate({ id: String(editing[config.idField]), payload });
              return;
            }
            createMutation.mutate(payload);
          }}
        />}
      </ModalForm>

      {isLoading && <div className="mb-4 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">Memuat {config.label}...</div>}
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <SummaryItem label="Total Data" value={String(rows.length)} />
        <SummaryItem label="Aktif" value={String(rows.filter((row) => row.status === "Aktif").length)} />
        <SummaryItem label="Nonaktif" value={String(rows.filter((row) => row.status === "Nonaktif").length)} />
      </div>
      <MasterTable
        config={config}
        rows={rows}
        isDeleting={deleteMutation.isPending}
        onEdit={(row) => {
          setEditing(row);
          setFormOpen(true);
        }}
        onDelete={(row) => {
          const id = String(row[config.idField] ?? "");
          if (!id) return;
          setDeleting(row);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => { if (!open) setDeleting(null); }}
        title="Hapus data?"
        description={`Data ${String(deleting?.[config.idField] ?? "ini")} akan dihapus dan tidak dapat dipulihkan.`}
        confirmLabel="Hapus"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          const id = String(deleting?.[config.idField] ?? "");
          if (id) deleteMutation.mutate(id);
        }}
      />
    </AppShell>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[0_4px_20px_rgba(155,135,245,0.05)]">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl text-primary">{value}</div>
    </div>
  );
}

function emptyForm(config: MasterResourceConfig) {
  return Object.fromEntries(
    config.fields.map((field) => {
      if (field.type === "checkbox") return [field.key, false];
      if (field.type === "number") return [field.key, ""];
      if (field.type === "select") return [field.key, field.options?.[0] ?? ""];
      return [field.key, ""];
    }),
  ) as MasterRecord;
}

function MasterForm({
  config,
  initialValue,
  isSaving,
  error,
  onSubmit,
  onCancel,
  shiftOptions,
}: {
  config: MasterResourceConfig;
  initialValue: MasterRecord | null;
  isSaving: boolean;
  error?: string;
  onSubmit: (payload: MasterRecord) => void;
  onCancel: () => void;
  shiftOptions: Array<{ value: string; label: string; name: string }>;
}) {
  const initialForm = useMemo(() => {
    const initial = { ...emptyForm(config), ...(initialValue ?? {}) };
    if (config.key === "pengasuh" && !initial.shiftCode) {
      const matched = shiftOptions.find((shift) => shift.name === initial.shiftName || shift.name === initial.shift);
      if (matched) initial.shiftCode = matched.value;
    }
    return initial;
  }, [config, initialValue, shiftOptions]);
  const [form, setForm] = useState<MasterRecord>(initialForm);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = Object.fromEntries(
      config.fields.map((field) => {
        const value = form[field.key];
        if (field.type === "number") return [field.key, value === "" || value === undefined ? undefined : Number(value)];
        return [field.key, value];
      }),
    ) as MasterRecord;
    if (config.key === "pengasuh") {
      payload.shiftName = shiftOptions.find((item) => item.value === payload.shiftCode)?.name;
    }
    onSubmit(payload);
  }

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {config.key === "pengasuh" && shiftOptions.length === 0 && <div className="rounded-lg border border-warning/40 bg-warning/15 px-4 py-3 text-sm text-warning-foreground md:col-span-2 xl:col-span-3">Data Shift belum tersedia. Tambahkan dan aktifkan data pada Master Shift terlebih dahulu.</div>}
        {config.fields.map((field) => (
          <MasterInput
            key={field.key}
            field={field}
            value={form[field.key]}
            disabled={Boolean(initialValue && field.key === config.idField)}
            required={field.key === config.idField || field.key === "name" || field.key === "title"}
            options={field.optionsSource === "shifts" ? shiftOptions : undefined}
            onChange={(value) => setForm((current) => {
              if (field.key === "shiftCode") {
                const shift = shiftOptions.find((item) => item.value === value);
                return { ...current, shiftCode: value, shiftName: shift?.name };
              }
              return { ...current, [field.key]: value };
            })}
          />
        ))}
      </div>
      {error && <div className="mx-5 mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      <div className="flex justify-end gap-2 border-t border-border/70 px-5 py-4">
        <button type="button" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={onCancel}>
          Batal
        </button>
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={isSaving || (config.key === "pengasuh" && shiftOptions.length === 0)}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}

function MasterInput({
  field,
  value,
  disabled,
  required,
  options,
  onChange,
}: {
  field: MasterField;
  value: MasterRecord[string];
  disabled?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  onChange: (value: MasterRecord[string]) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface px-3 py-3 text-sm">
        <input className="size-4 accent-primary" type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        <span className="font-medium text-muted-foreground">{field.label}</span>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="grid gap-1.5 text-sm md:col-span-2">
        <span className="text-xs font-medium text-muted-foreground">{field.label}{required ? " *" : ""}</span>
        <textarea
          className="min-h-24 resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="grid gap-1.5 text-sm">
        <span className="text-xs font-medium text-muted-foreground">{field.label}{required ? " *" : ""}</span>
        <select
          className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          value={String(value ?? options?.[0]?.value ?? field.options?.[0] ?? "")}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        >
          {options && <option value="">Pilih {field.label}</option>}
          {(options ?? (field.options ?? []).map((option) => ({ value: option, label: option }))).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{field.label}{required ? " *" : ""}</span>
      <input
        className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70"
        type={field.type}
        value={String(value ?? "")}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function MasterTable({
  config,
  rows,
  isDeleting,
  onEdit,
  onDelete,
}: {
  config: MasterResourceConfig;
  rows: MasterRecord[];
  isDeleting: boolean;
  onEdit: (row: MasterRecord) => void;
  onDelete: (row: MasterRecord) => void;
}) {
  const columns: DataColumn<MasterRecord>[] = [
    ...config.columns.map((column) => ({ key: column, label: column, render: (row: MasterRecord) => formatCell(row[column]) })),
    { key: "actions", label: "Aksi", className: "text-right", render: (row: MasterRecord) => <div className="inline-flex gap-2"><button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-primary" onClick={() => onEdit(row)}><Edit3 className="size-3.5" /> Edit</button><button className="inline-flex items-center gap-1.5 rounded-md border border-destructive/25 bg-card px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60" disabled={isDeleting} onClick={() => onDelete(row)}><Trash2 className="size-3.5" /> Hapus</button></div> },
  ];
  return <DataTable columns={columns} rows={rows} rowKey={(row) => String(row[config.idField] ?? "")} />;
}

function formatCell(value: MasterRecord[string]) {
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "number") return new Intl.NumberFormat("id-ID").format(value);
  return String(value ?? "-");
}
