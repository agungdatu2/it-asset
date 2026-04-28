"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { returnAsset } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function ReturnButton({ assignmentId, assetId }: { assignmentId: string; assetId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleReturn() {
    if (!confirm("Mark this asset as returned?")) return;
    startTransition(async () => {
      await returnAsset(assignmentId, assetId);
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReturn} disabled={isPending}>
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Return"}
    </Button>
  );
}
