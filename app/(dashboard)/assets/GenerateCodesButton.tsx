"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { generateMissingAssetCodes } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function GenerateCodesButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleGenerate() {
    if (!confirm("Auto-generate Asset IDs for all assets that don't have one?")) return;
    startTransition(async () => {
      await generateMissingAssetCodes();
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isPending}>
      {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
      Generate Missing IDs
    </Button>
  );
}
