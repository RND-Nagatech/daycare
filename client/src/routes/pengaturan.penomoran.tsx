import { createFileRoute } from "@tanstack/react-router";
import { SettingsPlaceholder } from "@/components/settings-placeholder";

export const Route = createFileRoute("/pengaturan/penomoran")({ component: () => <SettingsPlaceholder type="numbering" /> });
