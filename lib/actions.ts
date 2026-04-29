"use server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AssetStatus } from "@prisma/client";
import { sendAssignmentEmail, sendReturnEmail } from "@/lib/email";
import { put } from "@vercel/blob";

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const blob = await put(`assets/${Date.now()}.${ext}`, file, { access: "private" });
  return blob.url;
}

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

const CATEGORY_PREFIX: Record<string, string> = {
  "Laptop": "LAP",
  "Computer": "COMP",
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

  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) imageUrl = await uploadImage(imageFile);

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
      imageUrl,
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

  const imageFile = formData.get("image") as File | null;
  const existingImageUrl = formData.get("existingImageUrl") as string | null;
  let imageUrl: string | null = existingImageUrl || null;
  if (imageFile && imageFile.size > 0) imageUrl = await uploadImage(imageFile);

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
      imageUrl,
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
  const employeeId = formData.get("employeeId") as string;

  const [asset, employee] = await Promise.all([
    db.asset.findUnique({ where: { id: assetId }, include: { category: true } }),
    db.employee.findUnique({ where: { id: employeeId } }),
  ]);

  const assignment = await db.assetAssignment.create({
    data: {
      assetId,
      employeeId,
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

  // Send acknowledgment email if employee has an email address
  if (employee?.email && asset) {
    const baseUrl = process.env.NEXTAUTH_URL
      ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    try {
      await sendAssignmentEmail({
        to: employee.email,
        employeeName: employee.name,
        assetName: asset.name,
        assetCode: asset.assetCode,
        category: asset.category.name,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        assignedAt: assignment.assignedAt,
        notes: assignment.notes,
        acknowledgeUrl: `${baseUrl}/acknowledge/${assignment.id}`,
      });
      await db.assetAssignment.update({
        where: { id: assignment.id },
        data: { emailSentAt: new Date() },
      });
    } catch (err) {
      console.error("Assignment email failed:", err);
      // Email failure does not block the assignment
    }
  }

  revalidatePath("/assignments");
  revalidatePath("/assets");
  redirect("/assignments");
}

export async function resendAssignmentEmail(assignmentId: string) {
  await getSession();

  const assignment = await db.assetAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      asset: { include: { category: true } },
      employee: true,
    },
  });

  if (!assignment?.employee.email) throw new Error("No email address for employee");

  const baseUrl = process.env.NEXTAUTH_URL
    ? process.env.NEXTAUTH_URL
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const result = await sendAssignmentEmail({
    to: assignment.employee.email,
    employeeName: assignment.employee.name,
    assetName: assignment.asset.name,
    assetCode: assignment.asset.assetCode,
    category: assignment.asset.category.name,
    brand: assignment.asset.brand,
    model: assignment.asset.model,
    serialNumber: assignment.asset.serialNumber,
    assignedAt: assignment.assignedAt,
    notes: assignment.notes,
    acknowledgeUrl: `${baseUrl}/acknowledge/${assignment.id}`,
  });

  if ("error" in result && result.error) {
    throw new Error(JSON.stringify(result.error));
  }

  await db.assetAssignment.update({
    where: { id: assignmentId },
    data: { emailSentAt: new Date() },
  });

  revalidatePath("/assignments");
}

export async function acknowledgeAssignment(assignmentId: string, note: string, signature: string) {
  await db.assetAssignment.update({
    where: { id: assignmentId },
    data: {
      acknowledgedAt: new Date(),
      acknowledgmentNote: note || null,
      acknowledgmentSignature: signature || null,
    },
  });
}

export async function returnAsset(assignmentId: string, assetId: string, returnNotes: string) {
  const userId = await getSession();

  const returnedAt = new Date();

  const assignment = await db.assetAssignment.update({
    where: { id: assignmentId },
    data: { returnedAt, returnNotes: returnNotes || null },
    include: {
      asset: { include: { category: true } },
      employee: true,
    },
  });

  await db.asset.update({
    where: { id: assetId },
    data: { status: "VACANT" },
  });

  await db.assetHistory.create({
    data: {
      assetId,
      action: "RETURNED",
      detail: returnNotes ? `Asset returned — ${returnNotes}` : "Asset returned",
      changedBy: userId,
    },
  });

  // Send return confirmation email if employee has email
  if (assignment.employee.email) {
    const baseUrl = process.env.NEXTAUTH_URL
      ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    try {
      await sendReturnEmail({
        to: assignment.employee.email,
        employeeName: assignment.employee.name,
        assetName: assignment.asset.name,
        assetCode: assignment.asset.assetCode,
        category: assignment.asset.category.name,
        returnNotes: returnNotes || null,
        returnedAt,
        confirmUrl: `${baseUrl}/return-confirm/${assignmentId}`,
      });
      await db.assetAssignment.update({
        where: { id: assignmentId },
        data: { returnEmailSentAt: new Date() },
      });
    } catch (err) {
      console.error("Return email failed:", err);
    }
  }

  revalidatePath("/assignments");
  revalidatePath("/assets");
}

export async function confirmReturn(assignmentId: string, signature: string) {
  await db.assetAssignment.update({
    where: { id: assignmentId },
    data: {
      returnAcknowledgedAt: new Date(),
      returnSignature: signature || null,
    },
  });
}

export async function deleteAssignment(assignmentId: string) {
  await getSession();
  await db.assetAssignment.delete({ where: { id: assignmentId } });
  revalidatePath("/assignments");
}
