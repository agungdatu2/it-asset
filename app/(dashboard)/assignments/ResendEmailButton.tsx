"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { resendAssignmentEmail } from "@/lib/actions";

export function ResendEmailButton({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleClick() {
    startTransition(async () => {
      try {
        await resendAssignmentEmail(assignmentId);
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } catch {
        alert("Failed to send email. Make sure RESEND_API_KEY is configured.");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending || sent}
      title="Resend acknowledgment email"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : sent ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Mail className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
