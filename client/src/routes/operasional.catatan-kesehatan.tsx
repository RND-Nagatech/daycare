import { createFileRoute } from "@tanstack/react-router";
import { ActivityFeaturePage } from "./activities";

export const Route = createFileRoute("/operasional/catatan-kesehatan")({ component: () => <ActivityFeaturePage mode="health" /> });
