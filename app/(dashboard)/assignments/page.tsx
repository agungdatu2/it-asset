import { db } from "@/lib/db";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { assignAsset } from "@/lib/actions";
import { ReturnButton } from "./ReturnButton";

export default async function AssignmentsPage() {
  const [assets, companies, assignments] = await Promise.all([
    db.asset.findMany({
      where: { status: "VACANT" },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    db.company.findMany({
      orderBy: { name: "asc" },
      include: { employees: { orderBy: { name: "asc" } } },
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

  // employees without a company
  const unassignedEmployees = await db.employee.findMany({
    where: { companyId: null },
    orderBy: { name: "asc" },
  });

  const active = assignments.filter((a) => !a.returnedAt);
  const returned = assignments.filter((a) => a.returnedAt);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assignments</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Assign Asset</CardTitle></CardHeader>
        <CardContent>
          <form action={assignAsset} className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Asset (Vacant only)</Label>
              <Select name="assetId" required>
                <SelectTrigger><SelectValue placeholder="Select asset..." /></SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.category.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select name="employeeId" required>
                <SelectTrigger><SelectValue placeholder="Select employee..." /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) =>
                    c.employees.length > 0 ? (
                      <div key={c.id}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                          {c.name}
                        </div>
                        {c.employees.map((e) => (
                          <SelectItem key={e.id} value={e.id} className="pl-4">
                            {e.name}{e.department ? ` — ${e.department}` : ""}
                          </SelectItem>
                        ))}
                      </div>
                    ) : null
                  )}
                  {unassignedEmployees.length > 0 && (
                    <div>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                        No Company
                      </div>
                      {unassignedEmployees.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="pl-4">
                          {e.name}{e.department ? ` — ${e.department}` : ""}
                        </SelectItem>
                      ))}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea name="notes" rows={1} placeholder="optional..." />
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Assign</Button>
            </div>
          </form>
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
