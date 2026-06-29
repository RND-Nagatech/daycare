import { createFileRoute } from "@tanstack/react-router";
import { FinanceFeaturePage } from "./billing";

export const Route = createFileRoute("/keuangan/pembayaran")({ component: () => <FinanceFeaturePage mode="payments" /> });
