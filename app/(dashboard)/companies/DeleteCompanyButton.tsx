"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { deleteCompany } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function DeleteCompanyButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this company? Employees will be unlinked.")) return;
    startTransition(async () => {
      await deleteCompany(id);
      router.refresh();
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
    </Button>
  );
}
