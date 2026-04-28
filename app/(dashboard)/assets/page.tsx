import Link from "next/link";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DeleteAssetButton } from "./DeleteAssetButton";
import { GenerateCodesButton } from "./GenerateCodesButton";
import { CompanyFilter } from "@/components/shared/CompanyFilter";
import { cn } from "@/lib/utils";

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

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const { company: companyId } = await searchParams;

  const [assets, companies] = await Promise.all([
    db.asset.findMany({
      where: companyId ? { companyId } : {},
      include: {
        category: true,
        company: true,
        assignments: { where: { returnedAt: null }, include: { employee: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="flex items-center gap-2">
          <CompanyFilter companies={companies} />
          <GenerateCodesButton />
          <Link href="/assets/new" className={cn(buttonVariants({ size: "sm" }), "gap-1")}>
            <Plus className="w-4 h-4" />Add Asset
          </Link>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Asset ID</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Company</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Serial</th>
              <th className="text-left px-4 py-3 font-medium">Xero</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Assigned To</th>
              <th className="text-left px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 && (
              <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No assets found.</td></tr>
            )}
            {assets.map((asset) => {
              const holder = asset.assignments[0]?.employee;
              return (
                <tr key={asset.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{asset.assetCode || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{asset.name}</div>
                    {asset.brand && <div className="text-xs text-muted-foreground">{asset.brand} {asset.model}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{asset.company?.name || "—"}</td>
                  <td className="px-4 py-3">{asset.category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{asset.serialNumber || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{asset.xeroCode || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[asset.status]}>
                      {STATUS_LABELS[asset.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{holder ? holder.name : "—"}</td>
                  <td className="px-4 py-3">
                    {asset.invoiceUrl
                      ? <a href={asset.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">View</a>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
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
    </div>
  );
}
