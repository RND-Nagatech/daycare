import { createFileRoute } from "@tanstack/react-router";
import { OperationalPage } from "./checkin";

export const Route = createFileRoute("/operasional/booking")({ component: () => <OperationalPage mode="booking" /> });
