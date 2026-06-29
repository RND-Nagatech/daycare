import { createFileRoute } from "@tanstack/react-router";
import { ChildrenPage } from "./children";

export const Route = createFileRoute("/master/anak")({ component: ChildrenPage });
