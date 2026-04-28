"use client";
import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAssignment } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function DeleteAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this return record permanently?")) return;
    startTransition(async () => {
      await deleteAssignment(assignmentId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete record"
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
