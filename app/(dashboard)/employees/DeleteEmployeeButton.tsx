"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { deleteEmployee } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function DeleteEmployeeButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this employee?")) return;
    startTransition(async () => {
      await deleteEmployee(id);
      router.refresh();
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
    </Button>
  );
}
