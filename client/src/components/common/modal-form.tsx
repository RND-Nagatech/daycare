import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ModalForm({ open, onOpenChange, title, description, children, size = "lg", showHeader = true }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; size?: "md" | "lg" | "xl"; showHeader?: boolean }) {
  const width = size === "md" ? "sm:max-w-lg" : size === "xl" ? "sm:max-w-5xl" : "sm:max-w-2xl";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${width} max-h-[92vh] overflow-y-auto p-0`}>
        {showHeader ? <DialogHeader className="border-b border-border/60 px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader> : <DialogTitle className="sr-only">{title}</DialogTitle>}
        {children}
      </DialogContent>
    </Dialog>
  );
}
