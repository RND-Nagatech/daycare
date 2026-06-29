import { createFileRoute } from "@tanstack/react-router";
import { MasterResourceView } from "./master-data.$resource";

export const Route = createFileRoute("/pengaturan/hari-libur")({ component: () => <MasterResourceView resource="hari-libur" /> });
