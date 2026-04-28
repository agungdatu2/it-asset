import Link from "next/link";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAssetButton } from "./DeleteAssetButton";
import { GenerateCodesButton } from "./GenerateCodesButton";
import { AssetExportButton } from "./AssetExportButton";
import { CompanyFilter } from "@/components/shared/CompanyFilter";
import { AssetForm } from "@/components/shared/AssetForm";
import { createAsset } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  VACANT: "Vacant",
  ACTIVE: "Active",
  MAINTENANCE: "Maintenance",
  BROKEN: "Broken",
  RETIRED: "Retired",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  VACANT: "outline",
  ACTIVE: "default",
  MAINTENANCE: "secondary",
  BROKEN: "destructive",
  RETIRED: "outline",
};

const PAGE_SIZE = 10;

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; page?: string }>;
}) {
  const { company: companyId, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const where = companyId ? { companyId } : {};

  const [total, assets, companies] = await Promise.all([
    db.asset.count({ where }),
    db.asset.findMany({
      where,
      include: {
        category: true,
        company: true,
        assignments: { where: { returnedAt: null }, include: { employee: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (companyId) params.set("company", companyId);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/assets${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="flex flex-wrap items-center gap-2">
          <CompanyFilter companies={companies} />
          <AssetExportButton />
          <GenerateCodesButton />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Asset form */}
        <Card>
          <CardHeader><CardTitle className="text-base">Add Asset</CardTitle></CardHeader>
          <CardContent>
            <AssetForm action={createAsset} companies={companies} />
          </CardContent>
        </Card>

        {/* Asset list */}
        <div className="space-y-3">
          <div className="rounded-lg border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Asset</th>
                  <th className="text-left px-4 py-3 font-medium">Company</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Holder</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No assets found.</td>
                  </tr>
                )}
                {assets.map((asset) => {
                  const holder = asset.assignments[0]?.employee;
                  return (
                    <tr key={asset.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.category.name}</div>
                        {asset.assetCode && (
                          <div className="text-xs font-mono text-muted-foreground">{asset.assetCode}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{asset.company?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANTS[asset.status]}>
                          {STATUS_LABELS[asset.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{holder ? holder.name : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/assets/${asset.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                            Edit
                          </Link>
                          <DeleteAssetButton id={asset.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href={pageUrl(page - 1)}
                  aria-disabled={page <= 1}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page <= 1 && "pointer-events-none opacity-50"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <span className="px-2 text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Link
                  href={pageUrl(page + 1)}
                  aria-disabled={page >= totalPages}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page >= totalPages && "pointer-events-none opacity-50"
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-right">
            {total} asset{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>
    </div>
  );
}
