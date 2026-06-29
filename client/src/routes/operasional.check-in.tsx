import { createFileRoute } from "@tanstack/react-router";
import { OperationalPage } from "./checkin";

export const Route = createFileRoute("/operasional/check-in")({ component: () => <OperationalPage mode="check-in" /> });
