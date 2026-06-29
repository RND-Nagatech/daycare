import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserCog } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { daycareApi } from "@/lib/daycare-api";

export const Route = createFileRoute("/user-management")({ component: UserManagementPage });

function UserManagementPage() {
  const { data: user, isLoading } = useQuery({ queryKey: ["auth-user"], queryFn: daycareApi.me });
  return <AppShell title="User Management" description="Kelola akun dan hak akses pengguna daycare."><section className="rounded-lg border border-border/60 bg-card"><div className="flex items-center gap-3 border-b border-border/60 px-5 py-4"><span className="grid size-10 place-items-center rounded-md bg-accent text-accent-foreground"><UserCog className="size-5" /></span><h2 className="font-display text-lg">Pengguna Aktif</h2></div>{isLoading ? <div className="p-5 text-sm text-muted-foreground">Memuat pengguna...</div> : <div className="grid gap-2 p-5 text-sm sm:grid-cols-4"><div><span className="text-muted-foreground">ID</span><p className="mt-1 font-medium">{user?.id}</p></div><div><span className="text-muted-foreground">Nama</span><p className="mt-1 font-medium">{user?.name}</p></div><div><span className="text-muted-foreground">Email</span><p className="mt-1 font-medium">{user?.email}</p></div><div><span className="text-muted-foreground">Role</span><p className="mt-1 font-medium capitalize">{user?.role.replace("_", " ")}</p></div></div>}</section></AppShell>;
}
