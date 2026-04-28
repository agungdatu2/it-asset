import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCompany } from "@/lib/actions";
import { DeleteCompanyButton } from "./DeleteCompanyButton";
import { EditCompanyForm } from "./EditCompanyForm";

export default async function CompaniesPage() {
  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { employees: true } } },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Companies</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Add Company</CardTitle></CardHeader>
          <CardContent>
            <form action={createCompany} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. Acme Corp" />
              </div>
              <Button type="submit" className="w-full">Add Company</Button>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-lg border overflow-hidden h-fit">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Employees</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">No companies yet.</td></tr>
              )}
              {companies.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c._count.employees}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <EditCompanyForm company={c} />
                      <DeleteCompanyButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
