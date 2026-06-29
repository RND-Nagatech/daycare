import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type ReportPdfInput = {
  daycareName: string;
  logo?: string;
  title: string;
  period: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, string | number>>;
  summary: string[];
  printedBy: string;
};

function formatPrintDate() {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
}

async function imageDataUrl(source?: string) {
  if (!source) return undefined;
  if (source.startsWith("data:image/")) return source;
  try {
    const response = await fetch(source);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export async function buildReportPdf(input: ReportPdfInput) {
  const orientation = input.columns.length > 6 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const logo = await imageDataUrl(input.logo);
  const left = 14;

  if (logo) {
    try {
      const format = logo.startsWith("data:image/jpeg") || logo.startsWith("data:image/jpg") ? "JPEG" : "PNG";
      doc.addImage(logo, format, left, 12, 18, 18, undefined, "FAST");
    } catch {
      // A broken or unsupported logo must not block report generation.
    }
  }

  const textLeft = logo ? 37 : left;
  doc.setTextColor(74, 50, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(input.daycareName, textLeft, 17);
  doc.setTextColor(28, 25, 26);
  doc.setFontSize(12);
  doc.text(input.title, textLeft, 23);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(102, 94, 96);
  doc.setFontSize(9);
  doc.text(`Periode: ${input.period}`, textLeft, 28);
  doc.setDrawColor(225, 213, 216);
  doc.line(left, 34, pageWidth - left, 34);

  autoTable(doc, {
    startY: 40,
    margin: { left, right: left, bottom: 24 },
    head: [input.columns.map((column) => column.label)],
    body: input.rows.map((row) => input.columns.map((column) => String(row[column.key] ?? "-"))),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: input.columns.length > 7 ? 7 : 8,
      cellPadding: 2.4,
      lineColor: [231, 222, 224],
      lineWidth: 0.15,
      textColor: [48, 43, 44],
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [126, 82, 90],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      lineColor: [126, 82, 90],
    },
    alternateRowStyles: { fillColor: [250, 247, 248] },
  });

  const tableEnd = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 40;
  if (input.summary.length) {
    let summaryY = tableEnd + 7;
    const pageHeight = doc.internal.pageSize.getHeight();
    if (summaryY > pageHeight - 32) {
      doc.addPage();
      summaryY = 18;
    }
    doc.setFillColor(247, 241, 242);
    doc.roundedRect(left, summaryY, pageWidth - left * 2, 10 + input.summary.length * 5, 1.5, 1.5, "F");
    doc.setTextColor(74, 50, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Ringkasan", left + 4, summaryY + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(65, 60, 61);
    input.summary.forEach((item, index) => doc.text(item, left + 4, summaryY + 12 + index * 5));
  }

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(225, 213, 216);
    doc.line(left, pageHeight - 15, pageWidth - left, pageHeight - 15);
    doc.setTextColor(115, 106, 108);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Dicetak ${formatPrintDate()} oleh ${input.printedBy}`, left, pageHeight - 9);
    doc.text(`Halaman ${page} dari ${totalPages}`, pageWidth - left, pageHeight - 9, { align: "right" });
  }

  return doc;
}

export async function downloadReportPdf(input: ReportPdfInput, filename: string) {
  const doc = await buildReportPdf(input);
  doc.save(filename);
}
