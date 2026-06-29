import { createFileRoute } from "@tanstack/react-router";
import { FinanceFeaturePage } from "./billing";

export const Route = createFileRoute("/keuangan/pembelian-paket")({ component: () => <FinanceFeaturePage mode="purchase" /> });
