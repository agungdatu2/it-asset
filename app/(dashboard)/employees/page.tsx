import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEmployee } from "@/lib/actions";
import { DeleteEmployeeButton } from "./DeleteEmployeeButton";
import { EditEmployeeForm } from "./EditEmployeeForm";
import { CompanyFilter } from "@/components/shared/CompanyFilter";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const { company: companyId } = await searchParams;

  const [employees, companies] = await Promise.all([
    db.employee.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { name: "asc" },
      include: {
        company: true,
        _count: { select: { assignments: { where: { returnedAt: null } } } },
      },
    }),
    db.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <CompanyFilter companies={companies} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Add Employee</CardTitle></CardHeader>
          <CardContent>
            <form action={createEmployee} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. John Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Select name="companyId" defaultValue={companyId ?? ""}>
                  <SelectTrigger><SelectValue placeholder="Select company..." /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" placeholder="e.g. IT" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="e.g. +1 234 567 890" />
              </div>
              <Button type="submit" className="w-full">Add Employee</Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Company</th>
                  <th className="text-left px-4 py-3 font-medium">Dept</th>
                  <th className="text-left px-4 py-3 font-medium">Holds</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No employees found.</td></tr>
                )}
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{emp.name}</div>
                      {emp.email && <div className="text-xs text-muted-foreground">{emp.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.company?.name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.department || "—"}</td>
                    <td className="px-4 py-3">{emp._count.assignments}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <EditEmployeeForm employee={emp} companies={companies} />
                        <DeleteEmployeeButton id={emp.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
