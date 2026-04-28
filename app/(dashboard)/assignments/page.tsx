import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignForm } from "./AssignForm";
import { ReturnButton } from "./ReturnButton";

export default async function AssignmentsPage() {
  const [companies, assignments] = await Promise.all([
    db.company.findMany({
      orderBy: { name: "asc" },
      include: {
        assets: {
          where: { status: "VACANT" },
          include: { category: true },
          orderBy: { name: "asc" },
        },
        employees: { orderBy: { name: "asc" } },
      },
    }),
    db.assetAssignment.findMany({
      orderBy: { assignedAt: "desc" },
      include: {
        asset: { include: { category: true } },
        employee: { include: { company: true } },
        assignedByUser: true,
      },
    }),
  ]);

  const active = assignments.filter((a) => !a.returnedAt);
  const returned = assignments.filter((a) => a.returnedAt);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assignments</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Assign Asset</CardTitle></CardHeader>
        <CardContent>
          <AssignForm companies={companies} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold">Currently Assigned ({active.length})</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Asset</th>
                <th className="text-left px-4 py-3 font-medium">Employee</th>
                <th className="text-left px-4 py-3 font-medium">Company</th>
                <th className="text-left px-4 py-3 font-medium">Assigned</th>
                <th className="text-left px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {active.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No active assignments.</td></tr>
              )}
              {active.map((a) => (
                <tr key={a.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.asset.name}</div>
                    <div className="text-xs text-muted-foreground">{a.asset.category.name}</div>
                  </td>
                  <td className="px-4 py-3">{a.employee.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.employee.company?.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(a.assignedAt).toLocaleDateString("en-US")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <ReturnButton assignmentId={a.id} assetId={a.assetId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-muted-foreground">Return History ({returned.length})</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Asset</th>
                <th className="text-left px-4 py-3 font-medium">Employee</th>
                <th className="text-left px-4 py-3 font-medium">Company</th>
                <th className="text-left px-4 py-3 font-medium">Assigned</th>
                <th className="text-left px-4 py-3 font-medium">Returned</th>
              </tr>
            </thead>
            <tbody>
              {returned.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No returns yet.</td></tr>
              )}
              {returned.map((a) => (
                <tr key={a.id} className="border-t hover:bg-muted/30 opacity-70">
                  <td className="px-4 py-3">{a.asset.name}</td>
                  <td className="px-4 py-3">{a.employee.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.employee.company?.name || "—"}</td>
                  <td className="px-4 py-3">{new Date(a.assignedAt).toLocaleDateString("en-US")}</td>
                  <td className="px-4 py-3">{new Date(a.returnedAt!).toLocaleDateString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
