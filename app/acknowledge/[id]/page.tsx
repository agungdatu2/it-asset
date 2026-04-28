import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AcknowledgeForm } from "./AcknowledgeForm";

export default async function AcknowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assignment = await db.assetAssignment.findUnique({
    where: { id },
    include: {
      asset: { include: { category: true } },
      employee: true,
    },
  });

  if (!assignment) notFound();

  const asset = assignment.asset;
  const employee = assignment.employee;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl border shadow-sm w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Asset Receipt</h1>
          <p className="text-muted-foreground text-sm mt-1">Please confirm you have received the following asset.</p>
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
          {(asset.brand || asset.model) && (
            <div className="grid grid-cols-2 divide-x border-t">
              <div className="bg-muted/50 px-4 py-2.5 font-medium">Brand / Model</div>
              <div className="px-4 py-2.5">{[asset.brand, asset.model].filter(Boolean).join(" ")}</div>
            </div>
          )}
          {asset.serialNumber && (
            <div className="grid grid-cols-2 divide-x border-t">
              <div className="bg-muted/50 px-4 py-2.5 font-medium">Serial</div>
              <div className="px-4 py-2.5 font-mono text-xs">{asset.serialNumber}</div>
            </div>
          )}
          <div className="grid grid-cols-2 divide-x border-t">
            <div className="bg-muted/50 px-4 py-2.5 font-medium">Date</div>
            <div className="px-4 py-2.5">{new Date(assignment.assignedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          {assignment.notes && (
            <div className="grid grid-cols-2 divide-x border-t">
              <div className="bg-muted/50 px-4 py-2.5 font-medium">Notes</div>
              <div className="px-4 py-2.5">{assignment.notes}</div>
            </div>
          )}
        </div>

        {assignment.acknowledgedAt ? (
          <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Already acknowledged</p>
              <p className="text-green-700">{new Date(assignment.acknowledgedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        ) : (
          <AcknowledgeForm assignmentId={id} />
        )}
      </div>
    </div>
  );
}
