import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ConfirmReturnForm } from "./ConfirmReturnForm";

export default async function ReturnConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assignment = await db.assetAssignment.findUnique({
    where: { id },
    include: {
      asset: { include: { category: true } },
      employee: true,
    },
  });

  if (!assignment || !assignment.returnedAt) notFound();

  const asset = assignment.asset;
  const employee = assignment.employee;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl border shadow-sm w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Asset Return</h1>
          <p className="text-muted-foreground text-sm mt-1">Please confirm that you have returned the following asset.</p>
        </div>

        <div className="rounded-lg border overflow-hidden text-sm">
          <div className="grid grid-cols-2 divide-x">
            <div className="bg-muted/50 px-4 py-2.5 font-medium">Employee</div>
            <div className="px-4 py-2.5">{employee.name}</div>
          </div>
          <div className="grid grid-cols-2 divide-x border-t">
            <div className="bg-muted/50 px-4 py-2.5 font-medium">Asset</div>
            <div className="px-4 py-2.5">{asset.name}</div>
          </div>
          {asset.assetCode && (
            <div className="grid grid-cols-2 divide-x border-t">
              <div className="bg-muted/50 px-4 py-2.5 font-medium">Asset ID</div>
              <div className="px-4 py-2.5 font-mono text-xs">{asset.assetCode}</div>
            </div>
          )}
          <div className="grid grid-cols-2 divide-x border-t">
            <div className="bg-muted/50 px-4 py-2.5 font-medium">Category</div>
            <div className="px-4 py-2.5">{asset.category.name}</div>
          </div>
          <div className="grid grid-cols-2 divide-x border-t">
            <div className="bg-muted/50 px-4 py-2.5 font-medium">Return Date</div>
            <div className="px-4 py-2.5">{new Date(assignment.returnedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          {assignment.returnNotes && (
            <div className="grid grid-cols-2 divide-x border-t">
              <div className="bg-muted/50 px-4 py-2.5 font-medium">Condition</div>
              <div className="px-4 py-2.5">{assignment.returnNotes}</div>
            </div>
          )}
        </div>

        {assignment.returnAcknowledgedAt ? (
          <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Already confirmed</p>
              <p className="text-green-700">{new Date(assignment.returnAcknowledgedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        ) : (
          <ConfirmReturnForm assignmentId={id} />
        )}
      </div>
    </div>
  );
}
