"use client";
import { useSearchParams } from "next/navigation";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";

export function AssetExportButton() {
  const companyId = useSearchParams().get("company") ?? undefined;
  return <ExportCsvButton companyId={companyId} />;
}
