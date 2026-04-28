import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface AssignmentEmailData {
  to: string;
  employeeName: string;
  assetName: string;
  assetCode: string | null;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  assignedAt: Date;
  notes: string | null;
  acknowledgeUrl: string;
}

export async function sendAssignmentEmail(data: AssignmentEmailData) {
  const assetLabel = [data.brand, data.model].filter(Boolean).join(" ") || data.assetName;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
  <h2 style="margin-bottom:4px">IT Asset Assignment</h2>
  <p style="color:#666;margin-top:0">Please review and acknowledge receipt of the following asset.</p>

  <table style="width:100%;border-collapse:collapse;margin:24px 0">
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:600;width:40%">Employee</td>
      <td style="padding:10px 14px">${data.employeeName}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;font-weight:600">Asset</td>
      <td style="padding:10px 14px">${data.assetName}</td>
    </tr>
    ${data.assetCode ? `
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:600">Asset ID</td>
      <td style="padding:10px 14px;font-family:monospace">${data.assetCode}</td>
    </tr>` : ""}
    <tr${data.assetCode ? "" : ' style="background:#f5f5f5"'}>
      <td style="padding:10px 14px;font-weight:600">Category</td>
      <td style="padding:10px 14px">${data.category}</td>
    </tr>
    ${assetLabel !== data.assetName ? `
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:600">Brand / Model</td>
      <td style="padding:10px 14px">${assetLabel}</td>
    </tr>` : ""}
    ${data.serialNumber ? `
    <tr>
      <td style="padding:10px 14px;font-weight:600">Serial Number</td>
      <td style="padding:10px 14px;font-family:monospace">${data.serialNumber}</td>
    </tr>` : ""}
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:600">Assigned Date</td>
      <td style="padding:10px 14px">${new Date(data.assignedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
    </tr>
    ${data.notes ? `
    <tr>
      <td style="padding:10px 14px;font-weight:600">Notes</td>
      <td style="padding:10px 14px">${data.notes}</td>
    </tr>` : ""}
  </table>

  <p style="margin-bottom:24px">By clicking the button below, you confirm that you have received the above asset and agree to take responsibility for it.</p>

  <a href="${data.acknowledgeUrl}"
     style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
    Acknowledge Receipt
  </a>

  <p style="margin-top:32px;color:#999;font-size:12px">
    If you did not receive this asset, please contact your IT department.<br>
    This link is unique to this assignment.
  </p>
</body>
</html>`;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "IT Assets <onboarding@resend.dev>",
    to: data.to,
    subject: `Asset Assignment: ${data.assetName}`,
    html,
  });
}

interface ReturnEmailData {
  to: string;
  employeeName: string;
  assetName: string;
  assetCode: string | null;
  category: string;
  returnNotes: string | null;
  returnedAt: Date;
  confirmUrl: string;
}

export async function sendReturnEmail(data: ReturnEmailData) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
  <h2 style="margin-bottom:4px">Asset Return Confirmation</h2>
  <p style="color:#666;margin-top:0">Please confirm that you have returned the following asset.</p>

  <table style="width:100%;border-collapse:collapse;margin:24px 0">
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:600;width:40%">Employee</td>
      <td style="padding:10px 14px">${data.employeeName}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;font-weight:600">Asset</td>
      <td style="padding:10px 14px">${data.assetName}</td>
    </tr>
    ${data.assetCode ? `
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:600">Asset ID</td>
      <td style="padding:10px 14px;font-family:monospace">${data.assetCode}</td>
    </tr>` : ""}
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:600">Category</td>
      <td style="padding:10px 14px">${data.category}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;font-weight:600">Return Date</td>
      <td style="padding:10px 14px">${new Date(data.returnedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
    </tr>
    ${data.returnNotes ? `
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:600">Condition Notes</td>
      <td style="padding:10px 14px">${data.returnNotes}</td>
    </tr>` : ""}
  </table>

  <p style="margin-bottom:24px">By clicking the button below, you confirm that you have returned the above asset to the IT department.</p>

  <a href="${data.confirmUrl}"
     style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
    Confirm Return
  </a>

  <p style="margin-top:32px;color:#999;font-size:12px">
    If you did not return this asset, please contact your IT department immediately.<br>
    This link is unique to this return.
  </p>
</body>
</html>`;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "IT Assets <onboarding@resend.dev>",
    to: data.to,
    subject: `Asset Return: ${data.assetName}`,
    html,
  });
}
