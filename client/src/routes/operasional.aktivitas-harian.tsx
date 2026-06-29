import { createFileRoute } from "@tanstack/react-router";
import { ActivityFeaturePage } from "./activities";

export const Route = createFileRoute("/operasional/aktivitas-harian")({ component: () => <ActivityFeaturePage mode="activity" /> });
