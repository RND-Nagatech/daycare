import { createFileRoute } from "@tanstack/react-router";
import { MasterResourceView } from "./master-data.$resource";

export const Route = createFileRoute("/komunikasi/pengumuman")({ component: () => <MasterResourceView resource="pengumuman" /> });
