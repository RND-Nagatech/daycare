import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataColumn } from "@/components/common/data-table";
import { ModalForm } from "@/components/common/modal-form";
import { daycareApi, type ManagedUser, type SaveUserInput } from "@/lib/daycare-api";

export const Route = createFileRoute("/user-management")({ component: UserManagementPage });
const usersKey = ["managed-users"] as const;

function UserManagementPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: usersKey, queryFn: daycareApi.users });
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: usersKey });
  const createUser = useMutation({ mutationFn: daycareApi.createUser, onSuccess: () => { refresh(); setFormOpen(false); toast.success("User berhasil ditambahkan"); }, onError: (error) => toast.error(error.message) });
  const updateUser = useMutation({ mutationFn: ({ id, input }: { id: string; input: SaveUserInput }) => daycareApi.updateUser(id, input), onSuccess: () => { refresh(); setFormOpen(false); setEditing(null); toast.success("User berhasil diperbarui"); }, onError: (error) => toast.error(error.message) });
  const deleteUser = useMutation({ mutationFn: daycareApi.deleteUser, onSuccess: () => { refresh(); setDeleting(null); toast.success("User berhasil dihapus"); }, onError: (error) => toast.error(error.message) });

  const columns: DataColumn<ManagedUser>[] = [
    { key: "name", label: "Nama", render: (user) => <div><p className="font-semibold">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div> },
    { key: "role", label: "Role", render: (user) => <span className="capitalize">{user.role.replace("_", " ")}</span> },
    { key: "status", label: "Status", render: (user) => <span className={`rounded-full px-2 py-1 text-xs ${user.status === "Aktif" ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>{user.status}</span> },
    { key: "actions", label: "Aksi", className: "text-right", render: (user) => <div className="inline-flex gap-2"><button className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-semibold" onClick={() => { setEditing(user); setFormOpen(true); }}><Edit3 className="size-3.5" /> Edit</button><button className="inline-flex items-center gap-1 rounded-md border border-destructive/25 px-3 py-2 text-xs font-semibold text-destructive" onClick={() => setDeleting(user)}><Trash2 className="size-3.5" /> Hapus</button></div> },
  ];

  return (
    <AppShell title="User Management" description="Kelola akun dan hak akses pengguna daycare." actions={<button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-4" /> Tambah User</button>}>
      {isLoading ? <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">Memuat pengguna...</div> : <DataTable columns={columns} rows={users} rowKey={(user) => user.id} />}
      <ModalForm open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }} title={editing ? "Edit User" : "Tambah User"} description={editing ? "Kosongkan password jika tidak ingin mengubahnya." : "Lengkapi identitas dan akses user."}>
        {formOpen && <UserForm user={editing} saving={createUser.isPending || updateUser.isPending} onCancel={() => { setFormOpen(false); setEditing(null); }} onSubmit={(input) => editing ? updateUser.mutate({ id: editing.id, input }) : createUser.mutate(input)} />}
      </ModalForm>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }} title="Hapus user?" description={`${deleting?.name ?? "User"} akan dihapus dari sistem.`} confirmLabel="Hapus" destructive loading={deleteUser.isPending} onConfirm={() => deleting && deleteUser.mutate(deleting.id)} />
    </AppShell>
  );
}

function UserForm({ user, saving, onCancel, onSubmit }: { user: ManagedUser | null; saving: boolean; onCancel: () => void; onSubmit: (input: SaveUserInput) => void }) {
  const [form, setForm] = useState<SaveUserInput>({ name: user?.name ?? "", email: user?.email ?? "", password: "", role: user?.role ?? "staff", status: user?.status ?? "Aktif" });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || (!user && !form.password?.trim())) { toast.error("Nama, email, dan password user baru wajib diisi"); return; }
    onSubmit({ ...form, password: form.password?.trim() || undefined });
  }
  return <form onSubmit={submit}><div className="grid gap-4 p-5 sm:grid-cols-2"><Field label="Nama" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} /><Field label={user ? "Password Baru (opsional)" : "Password"} type="password" value={form.password ?? ""} onChange={(value) => setForm({ ...form, password: value })} /><SelectField label="Role" value={form.role} onChange={(value) => setForm({ ...form, role: value as ManagedUser["role"] })} options={["super_admin", "admin", "staff", "parent"]} /><SelectField label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as ManagedUser["status"] })} options={["Aktif", "Nonaktif"]} /></div><div className="flex justify-end gap-2 border-t border-border px-5 py-4"><button type="button" className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold" onClick={onCancel}>Batal</button><button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></div></form>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="grid gap-1.5 text-sm"><span className="font-medium">{label}</span><input className="h-10 rounded-md border border-border bg-surface px-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="grid gap-1.5 text-sm"><span className="font-medium">{label}</span><select className="h-10 rounded-md border border-border bg-surface px-3 outline-none focus:border-primary" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}</select></label>;
}
