import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/master-data")({
  head: () => ({
    meta: [
      { title: "Master Data — Lumi Daycare" },
      { name: "description", content: "Submenu master data operasional daycare." },
    ],
  }),
  component: MasterDataPage,
});

function MasterDataPage() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  if (path === "/master-data") {
    return <Navigate to="/master/$resource" params={{ resource: "pengasuh" }} replace />;
  }
  return <Outlet />;
}
