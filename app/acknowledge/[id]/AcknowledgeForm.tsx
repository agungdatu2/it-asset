"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Eraser } from "lucide-react";
import { acknowledgeAssignment } from "@/lib/actions";
import SignaturePad from "signature_pad";

export function AcknowledgeForm({ assignmentId }: { assignmentId: string }) {
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isPending, startTransition] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePad(canvas, {
      penColor: "#111",
      backgroundColor: "rgb(249,250,251)",
    });
    padRef.current = pad;

    pad.addEventListener("endStroke", () => setIsEmpty(pad.isEmpty()));

    function resize() {
      if (!canvas) return;
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);
      pad.clear();
      setIsEmpty(true);
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function clearPad() {
    padRef.current?.clear();
    setIsEmpty(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) return;
    const signature = pad.toDataURL("image/png");
    startTransition(async () => {
      await acknowledgeAssignment(assignmentId, note, signature);
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="note">Notes (optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any notes about the condition of the asset..."
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Signature <span className="text-red-500">*</span></Label>
          <button type="button" onClick={clearPad} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Eraser className="w-3 h-3" /> Clear
          </button>
        </div>
        <div className="rounded-lg border bg-gray-50 overflow-hidden" style={{ height: 140 }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">Sign above using your mouse or finger</p>
      </div>

      <Button type="submit" disabled={isPending || isEmpty} className="w-full">
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        I confirm I have received this asset
      </Button>
    </form>
  );
}
