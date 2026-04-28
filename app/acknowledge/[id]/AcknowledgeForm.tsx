"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { acknowledgeAssignment } from "@/lib/actions";

export function AcknowledgeForm({ assignmentId }: { assignmentId: string }) {
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await acknowledgeAssignment(assignmentId, note);
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <h2 className="text-xl font-semibold">Thank you!</h2>
        <p className="text-muted-foreground">Your acknowledgment has been recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="note">Notes (optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any notes about the condition of the asset..."
          rows={3}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        I confirm I have received this asset
      </Button>
    </form>
  );
}
