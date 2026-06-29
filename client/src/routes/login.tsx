import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appConfigQueryKey, daycareApi } from "@/lib/daycare-api";
import { authStore } from "@/lib/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { data: config } = useQuery({ queryKey: appConfigQueryKey, queryFn: daycareApi.appConfig });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const appName = config?.appName || "Daycare Management";

  useEffect(() => {
    document.title = `Login - ${appName}`;
  }, [appName]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const response = await daycareApi.login({ email, password });
      authStore.save(response.token, response.user);
      toast.success("Login berhasil");
      await navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f2f2] px-4 py-10">
      <section className="w-full max-w-md overflow-hidden rounded-lg border border-border/60 bg-card shadow-[0_18px_55px_rgba(38,28,31,0.10)]">
        <div className="border-b border-border/50 bg-[#262225] px-7 py-6 text-white">
          <div className="mb-5 grid size-11 place-items-center rounded-lg bg-white/10">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-sm text-white/65">Portal Administrator</p>
          <h1 className="mt-1 text-2xl font-semibold">{appName}</h1>
        </div>
        <form className="space-y-5 p-7" onSubmit={submit} noValidate>
          <div>
            <h2 className="text-xl font-semibold">Masuk ke akun Anda</h2>
            <p className="mt-1 text-sm text-muted-foreground">Gunakan akun admin yang telah terdaftar.</p>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Email
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 pl-10" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Masukkan email" />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <span className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 px-10" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>
          <Button className="h-11 w-full" disabled={loading} type="submit">
            {loading ? "Memeriksa..." : "Masuk"}
          </Button>
        </form>
      </section>
    </main>
  );
}
