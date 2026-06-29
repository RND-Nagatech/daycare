import { createFileRoute } from "@tanstack/react-router";
import { OperationalPage } from "./checkin";

export const Route = createFileRoute("/operasional/check-out")({ component: () => <OperationalPage mode="check-out" /> });
