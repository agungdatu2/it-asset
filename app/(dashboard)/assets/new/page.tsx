import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { AssetForm } from "@/components/shared/AssetForm";
import { createAsset } from "@/lib/actions";
import { db } from "@/lib/db";

export default async function NewAssetPage() {
  const companies = await db.company.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6 space-y-4">
      <Link href="/assets" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ChevronLeft className="w-4 h-4" />Back
      </Link>
      <h1 className="text-2xl font-bold">Add Asset</h1>
      <AssetForm action={createAsset} companies={companies} />
    </div>
  );
}
