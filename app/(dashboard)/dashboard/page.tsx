import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Users, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { ExportButton } from "./ExportButton";
import { CompanyFilter } from "@/components/shared/CompanyFilter";

const STATUS_LABELS: Record<string, string> = {
  VACANT: "Vacant",
  ACTIVE: "Active",
  MAINTENANCE: "Maintenance",
  BROKEN: "Broken",
  RETIRED: "Retired",
};

const STATUS_COLORS: Record<string, string> = {
  VACANT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-green-100 text-green-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  BROKEN: "bg-red-100 text-red-800",
  RETIRED: "bg-gray-100 text-gray-500",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const { company: companyId } = await searchParams;

  const [assets, employeeCount, activeAssignments, recentHistories, companies] = await Promise.all([
    db.asset.findMany({
      where: companyId ? { companyId } : {},
      include: { category: true, company: true },
    }),
    db.employee.count(companyId ? { where: { companyId } } : undefined),
    db.assetAssignment.count({
      where: companyId
        ? { returnedAt: null, employee: { companyId } }
        : { returnedAt: null },
    }),
    db.assetHistory.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      where: companyId ? { asset: { companyId } } : {},
      include: { asset: true, changedByUser: true },
    }),
    db.company.findMany({
      orderBy: { name: "asc" },
      include: { assets: true },
    }),
  ]);

  const byStatus = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const byCategory = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category.name] = (acc[a.category.name] || 0) + 1;
    return acc;
  }, {});

  // per-company breakdown (always show all companies unfiltered for the table)
  const companyStats = companies.map((c) => {
    const vacant = c.assets.filter((a) => a.status === "VACANT").length;
    const active = c.assets.filter((a) => a.status === "ACTIVE").length;
    const other = c.assets.filter((a) => !["VACANT", "ACTIVE"].includes(a.status)).length;
    return { name: c.name, total: c.assets.length, vacant, active, other };
  });

  const noCompanyAssets = companyId ? [] : assets.filter((a) => !a.companyId);
  const noCompanyVacant = noCompanyAssets.filter((a) => a.status === "VACANT").length;
  const noCompanyActive = noCompanyAssets.filter((a) => a.status === "ACTIVE").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <CompanyFilter companies={companies} />
          <ExportButton />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Monitor className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{assets.length}</p>
                <p className="text-xs text-muted-foreground">Total Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{employeeCount}</p>
                <p className="text-xs text-muted-foreground">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activeAssignments}</p>
                <p className="text-xs text-muted-foreground">Active (In Use)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{byStatus["BROKEN"] || 0}</p>
                <p className="text-xs text-muted-foreground">Broken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-company breakdown — only show when no company filter active */}
      {!companyId && (
        <Card>
          <CardHeader><CardTitle className="text-base">Assets by Company</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Company</th>
                    <th className="text-center px-4 py-2.5 font-medium">Total</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-500">Vacant</th>
                    <th className="text-center px-4 py-2.5 font-medium text-green-700">Active</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Other</th>
                  </tr>
                </thead>
                <tbody>
                  {companyStats.map((c) => (
                    <tr key={c.name} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{c.name}</td>
                      <td className="px-4 py-2.5 text-center">{c.total}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{c.vacant}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">{c.active}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{c.other}</td>
                    </tr>
                  ))}
                  {noCompanyAssets.length > 0 && (
                    <tr className="border-t hover:bg-muted/30 italic">
                      <td className="px-4 py-2.5 text-muted-foreground">No Company</td>
                      <td className="px-4 py-2.5 text-center">{noCompanyAssets.length}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{noCompanyVacant}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">{noCompanyActive}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{noCompanyAssets.length - noCompanyVacant - noCompanyActive}</td>
                    </tr>
                  )}
                  {companyStats.length === 0 && noCompanyAssets.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">No assets yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Assets by Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
                  {STATUS_LABELS[status] || status}
                </span>
                <span className="font-semibold text-sm">{count}</span>
              </div>
            ))}
            {Object.keys(byStatus).length === 0 && (
              <p className="text-sm text-muted-foreground">No assets.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Assets by Category</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byCategory).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm">{cat}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
            {Object.keys(byCategory).length === 0 && (
              <p className="text-sm text-muted-foreground">No assets.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {recentHistories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {recentHistories.map((h) => (
                <div key={h.id} className="flex items-start justify-between text-sm py-1 border-b last:border-0">
                  <div>
                    <span className="font-medium">{h.asset.name}</span>
                    <span className="text-muted-foreground ml-2">{h.detail}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    {new Date(h.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
