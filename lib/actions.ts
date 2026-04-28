"use server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AssetStatus } from "@prisma/client";

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

const CATEGORY_PREFIX: Record<string, string> = {
  "Laptop": "LAP",
  "Monitor": "MON",
  "Printer": "PRN",
  "Software License": "SFW",
  "Keyboard": "KBD",
  "Mouse": "MSE",
  "Server": "SRV",
  "Other": "OTH",
};

async function generateAssetCode(categoryName: string, brand: string): Promise<string> {
  const catPrefix = CATEGORY_PREFIX[categoryName] ?? categoryName.slice(0, 3).toUpperCase();
  const brandPrefix = brand ? brand.slice(0, 3).toUpperCase() : "GEN";
  const prefix = `${catPrefix}_${brandPrefix}_`;

  const existing = await db.asset.findMany({
    where: { assetCode: { startsWith: prefix } },
    select: { assetCode: true },
  });

  const maxSeq = existing.reduce((max, a) => {
    const num = parseInt(a.assetCode?.replace(prefix, "") ?? "0", 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);

  return `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;
}

// ── Assets ──────────────────────────────────────────────────────────────────

export async function createAsset(formData: FormData) {
  const userId = await getSession();
  const categoryName = formData.get("category") as string;

  const category = await db.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName },
  });

  const purchasePrice = formData.get("purchasePrice") as string;
  const purchaseDate = formData.get("purchaseDate") as string;

  const asset = await db.asset.create({
    data: {
      name: formData.get("name") as string,
      brand: (formData.get("brand") as string) || null,
      model: (formData.get("model") as string) || null,
      serialNumber: (formData.get("serialNumber") as string) || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      assetCode: (formData.get("assetCode") as string) || await generateAssetCode(categoryName, formData.get("brand") as string),
      xeroCode: (formData.get("xeroCode") as string) || null,
      status: (formData.get("status") as AssetStatus) || "VACANT",
      notes: (formData.get("notes") as string) || null,
      invoiceUrl: (formData.get("invoiceUrl") as string) || null,
      categoryId: category.id,
      companyId: (formData.get("companyId") as string) || null,
    },
  });

  await db.assetHistory.create({
    data: {
      assetId: asset.id,
      action: "CREATED",
      detail: "Asset created",
      changedBy: userId,
    },
  });

  revalidatePath("/assets");
  redirect("/assets");
}

export async function updateAsset(id: string, formData: FormData) {
  const userId = await getSession();
  const categoryName = formData.get("category") as string;

  const category = await db.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName },
  });

  const purchasePrice = formData.get("purchasePrice") as string;
  const purchaseDate = formData.get("purchaseDate") as string;

  await db.asset.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      brand: (formData.get("brand") as string) || null,
      model: (formData.get("model") as string) || null,
      serialNumber: (formData.get("serialNumber") as string) || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      assetCode: (formData.get("assetCode") as string) || await generateAssetCode(categoryName, formData.get("brand") as string),
      xeroCode: (formData.get("xeroCode") as string) || null,
      status: formData.get("status") as AssetStatus,
      notes: (formData.get("notes") as string) || null,
      invoiceUrl: (formData.get("invoiceUrl") as string) || null,
      categoryId: category.id,
      companyId: (formData.get("companyId") as string) || null,
    },
  });

  await db.assetHistory.create({
    data: {
      assetId: id,
      action: "UPDATED",
      detail: "Asset updated",
      changedBy: userId,
    },
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${id}`);
  redirect("/assets");
}

export async function generateMissingAssetCodes() {
  await getSession();
  const assets = await db.asset.findMany({
    where: { assetCode: null },
    include: { category: true },
  });
  for (const asset of assets) {
    const code = await generateAssetCode(asset.category.name, asset.brand ?? "");
    await db.asset.update({ where: { id: asset.id }, data: { assetCode: code } });
  }
  revalidatePath("/assets");
}

export async function deleteAsset(id: string) {
  await getSession();
  await db.assetHistory.deleteMany({ where: { assetId: id } });
  await db.assetAssignment.deleteMany({ where: { assetId: id } });
  await db.asset.delete({ where: { id } });
  revalidatePath("/assets");
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function createAdminUser(formData: FormData) {
  await getSession();
  const { default: bcrypt } = await import("bcryptjs");
  const password = formData.get("password") as string;
  const hash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: hash,
      role: (formData.get("role") as "ADMIN" | "VIEWER") || "ADMIN",
    },
  });
  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(id: string) {
  const currentUserId = await getSession();
  if (id === currentUserId) throw new Error("Cannot delete your own account");
  await db.user.delete({ where: { id } });
  revalidatePath("/users");
}

// ── Companies ────────────────────────────────────────────────────────────────

export async function createCompany(formData: FormData) {
  await getSession();
  await db.company.create({
    data: { name: formData.get("name") as string },
  });
  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(id: string, formData: FormData) {
  await getSession();
  await db.company.update({
    where: { id },
    data: { name: formData.get("name") as string },
  });
  revalidatePath("/companies");
  redirect("/companies");
}

export async function deleteCompany(id: string) {
  await getSession();
  await db.company.delete({ where: { id } });
  revalidatePath("/companies");
}

// ── Employees ────────────────────────────────────────────────────────────────

export async function createEmployee(formData: FormData) {
  await getSession();
  await db.employee.create({
    data: {
      name: formData.get("name") as string,
      department: (formData.get("department") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      companyId: (formData.get("companyId") as string) || null,
    },
  });
  revalidatePath("/employees");
  redirect("/employees");
}

export async function updateEmployee(id: string, formData: FormData) {
  await getSession();
  await db.employee.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      department: (formData.get("department") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      companyId: (formData.get("companyId") as string) || null,
    },
  });
  revalidatePath("/employees");
  redirect("/employees");
}

export async function deleteEmployee(id: string) {
  await getSession();
  await db.employee.delete({ where: { id } });
  revalidatePath("/employees");
}

// ── Assignments ──────────────────────────────────────────────────────────────

export async function assignAsset(formData: FormData) {
  const userId = await getSession();
  const assetId = formData.get("assetId") as string;

  await db.assetAssignment.create({
    data: {
      assetId,
      employeeId: formData.get("employeeId") as string,
      assignedBy: userId,
      notes: (formData.get("notes") as string) || null,
    },
  });

  await db.asset.update({
    where: { id: assetId },
    data: { status: "ACTIVE" },
  });

  await db.assetHistory.create({
    data: {
      assetId,
      action: "ASSIGNED",
      detail: "Assigned to employee",
      changedBy: userId,
    },
  });

  revalidatePath("/assignments");
  revalidatePath("/assets");
  redirect("/assignments");
}

export async function returnAsset(assignmentId: string, assetId: string) {
  const userId = await getSession();

  await db.assetAssignment.update({
    where: { id: assignmentId },
    data: { returnedAt: new Date() },
  });

  await db.asset.update({
    where: { id: assetId },
    data: { status: "VACANT" },
  });

  await db.assetHistory.create({
    data: {
      assetId,
      action: "RETURNED",
      detail: "Asset returned",
      changedBy: userId,
    },
  });

  revalidatePath("/assignments");
  revalidatePath("/assets");
}
