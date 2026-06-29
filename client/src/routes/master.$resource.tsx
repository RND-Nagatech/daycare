import { createFileRoute } from "@tanstack/react-router";
import { MasterResourceView } from "./master-data.$resource";

export const Route = createFileRoute("/master/$resource")({
  component: MasterPage,
});

function MasterPage() {
  const { resource } = Route.useParams();
  return <MasterResourceView resource={resource} />;
}
