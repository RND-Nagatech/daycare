import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/report-view";

export const Route = createFileRoute("/laporan/$report")({ component: ReportPage });

function ReportPage() {
  const { report } = Route.useParams();
  return <ReportView report={report} />;
}
