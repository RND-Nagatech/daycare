import type { ReactNode } from "react";

export type DataColumn<T> = { key: string; label: string; render: (row: T) => ReactNode; className?: string };

export function DataTable<T>({ columns, rows, rowKey, emptyMessage = "Belum ada data." }: { columns: DataColumn<T>[]; rows: T[]; rowKey: (row: T) => string; emptyMessage?: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-[0_5px_24px_rgba(54,39,43,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-surface/70 text-xs uppercase text-muted-foreground"><tr>{columns.map((column) => <th key={column.key} className={`px-5 py-3 font-semibold ${column.className ?? ""}`}>{column.label}</th>)}</tr></thead>
          <tbody className="divide-y divide-border/50">
            {rows.length === 0 && <tr><td className="px-5 py-10 text-center text-muted-foreground" colSpan={columns.length}>{emptyMessage}</td></tr>}
            {rows.map((row) => <tr key={rowKey(row)} className="hover:bg-surface/50">{columns.map((column) => <td key={column.key} className={`px-5 py-4 align-top ${column.className ?? ""}`}>{column.render(row)}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
