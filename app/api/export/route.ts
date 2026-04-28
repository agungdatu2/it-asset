import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assets = await db.asset.findMany({
    include: {
      category: true,
      company: true,
      assignments: {
        where: { returnedAt: null },
        include: { employee: true },
      },
    },
    orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
  });

  const rows = [
    ["Asset ID", "Xero Code", "Name", "Company", "Category", "Brand", "Model", "Serial Number", "Status", "Assigned To", "Purchase Date", "Purchase Price", "Invoice URL", "Notes"],
    ...assets.map((a) => [
      a.assetCode ?? "",
      a.xeroCode ?? "",
      a.name,
      a.company?.name ?? "",
      a.category.name,
      a.brand ?? "",
      a.model ?? "",
      a.serialNumber ?? "",
      a.status,
      a.assignments[0]?.employee.name ?? "",
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString("en-US") : "",
      a.purchasePrice ? Number(a.purchasePrice).toString() : "",
      a.invoiceUrl ?? "",
      a.notes ?? "",
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="assets-${date}.csv"`,
    },
  });
}
