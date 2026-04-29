import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { AssetForm } from "@/components/shared/AssetForm";
import { updateAsset } from "@/lib/actions";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [asset, companies] = await Promise.all([
    db.asset.findUnique({
      where: { id },
      include: {
        category: true,
        company: true,
        histories: { include: { changedByUser: true }, orderBy: { createdAt: "desc" } },
        assignments: { include: { employee: true }, orderBy: { assignedAt: "desc" } },
      },
    }),
    db.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!asset) notFound();

  async function action(fd: FormData) {
    "use server";
    await updateAsset(id, fd);
  }

  const defaultValues = {
    ...asset,
    purchasePrice: asset.purchasePrice ? Number(asset.purchasePrice) : null,
    invoiceUrl: asset.invoiceUrl,
    imageUrl: asset.imageUrl,
    companyId: asset.companyId,
    assetCode: asset.assetCode,
    xeroCode: asset.xeroCode,
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <Link href="/assets" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ChevronLeft className="w-4 h-4" />Back
      </Link>
      <h1 className="text-2xl font-bold">Edit Asset — {asset.name}</h1>

      <AssetForm action={action} companies={companies} defaultValues={defaultValues} />

      <div className="grid md:grid-cols-2 gap-6 pt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Assignment History</CardTitle></CardHeader>
          <CardContent>
            {asset.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Never assigned.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {asset.assignments.map((a) => (
                  <div key={a.id} className="flex justify-between border-b pb-1 last:border-0">
                    <span>{a.employee.name}</span>
                    <span className="text-muted-foreground">
                      {new Date(a.assignedAt).toLocaleDateString("en-US")}
                      {a.returnedAt && ` → ${new Date(a.returnedAt).toLocaleDateString("en-US")}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Change History</CardTitle></CardHeader>
          <CardContent>
            {asset.histories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No changes yet.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {asset.histories.map((h) => (
                  <div key={h.id} className="flex justify-between border-b pb-1 last:border-0">
                    <div>
                      <span className="font-medium">{h.action}</span>
                      {h.detail && <span className="text-muted-foreground ml-2">{h.detail}</span>}
                    </div>
                    <span className="text-muted-foreground shrink-0 ml-4">
                      {new Date(h.createdAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
