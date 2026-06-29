import { AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ConfirmDialog({ open, onOpenChange, title = "Konfirmasi tindakan", description, confirmLabel = "Lanjutkan", destructive = false, loading = false, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; title?: string; description: string; confirmLabel?: string; destructive?: boolean; loading?: boolean; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className={`mb-2 grid size-10 place-items-center rounded-md ${destructive ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}><AlertTriangle className="size-5" /></div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""} disabled={loading} onClick={(event) => { event.preventDefault(); onConfirm(); }}>
            {loading ? "Memproses..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
