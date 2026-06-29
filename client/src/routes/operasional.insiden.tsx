import { createFileRoute } from "@tanstack/react-router";
import { ActivityFeaturePage } from "./activities";

export const Route = createFileRoute("/operasional/insiden")({ component: () => <ActivityFeaturePage mode="incident" /> });
