"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { returnAsset } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function ReturnButton({
  assignmentId,
  assetId,
  employeeEmail,
}: {
  assignmentId: string;
  assetId: string;
  employeeEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleReturn() {
    startTransition(async () => {
      await returnAsset(assignmentId, assetId, notes);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Return
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="font-semibold text-lg">Return Asset</h2>
            <p className="text-sm text-muted-foreground">
              Asset status will be set to <strong>Vacant</strong>.
              {employeeEmail && " A confirmation email will be sent to the employee to sign."}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="return-notes">Condition / Notes (optional)</Label>
              <Textarea
                id="return-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Good condition, charger included..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleReturn} disabled={isPending}>
                {isPending && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                Confirm Return
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
