"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { resendAssignmentEmail } from "@/lib/actions";

export function ResendEmailButton({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleClick() {
    startTransition(async () => {
      try {
        await resendAssignmentEmail(assignmentId);
        setStatus("sent");
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        // Try to parse Resend error JSON
        let msg = raw;
        try {
          const parsed = JSON.parse(raw);
          msg = parsed.message ?? raw;
        } catch { /* not JSON */ }
        setErrorMsg(msg);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isPending || status === "sent"}
        title="Send acknowledgment email"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : status === "sent" ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Mail className="w-3.5 h-3.5" />
        )}
      </Button>
      {status === "error" && (
        <span className="flex items-center gap-1 text-xs text-red-600 max-w-[180px]" title={errorMsg}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMsg.length > 40 ? errorMsg.slice(0, 40) + "…" : errorMsg}
        </span>
      )}
    </div>
  );
}
