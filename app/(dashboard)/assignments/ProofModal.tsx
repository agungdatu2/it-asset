"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";

interface Props {
  assignment: {
    id: string;
    assignedAt: Date;
    acknowledgedAt: Date | null;
    acknowledgmentNote: string | null;
    acknowledgmentSignature: string | null;
    notes: string | null;
    asset: {
      name: string;
      assetCode: string | null;
      brand: string | null;
      model: string | null;
      serialNumber: string | null;
      xeroCode: string | null;
      category: { name: string };
    };
    employee: {
      name: string;
      email: string | null;
      department: string | null;
      company: { name: string } | null;
    };
    assignedByUser: { name: string | null };
  };
}

export function ProofModal({ assignment: a }: Props) {
  const [open, setOpen] = useState(false);

  if (!a.acknowledgedAt) return null;

  function handlePrint() {
    const assignedDate = new Date(a.assignedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const acknowledgedDate = new Date(a.acknowledgedAt!).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const assetLabel = [a.asset.brand, a.asset.model].filter(Boolean).join(" ");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Asset Receipt Proof – ${a.employee.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; padding: 48px; max-width: 680px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 28px; }
    .title { font-size: 22px; font-weight: 700; }
    .subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .badge { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 99px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
    .full { grid-column: 1 / -1; }
    .label { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
    .value { font-size: 13px; font-weight: 500; }
    .mono { font-family: monospace; font-size: 12px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .sig-box { border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; padding: 12px; display: inline-block; margin-top: 8px; }
    .sig-box img { max-height: 100px; display: block; }
    .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">Asset Receipt Proof</div>
      <div class="subtitle">Official acknowledgment of asset handover</div>
    </div>
    <div class="badge">✓ Acknowledged</div>
  </div>

  <div class="section">
    <div class="section-title">Employee</div>
    <div class="grid">
      <div><div class="label">Name</div><div class="value">${a.employee.name}</div></div>
      ${a.employee.company ? `<div><div class="label">Company</div><div class="value">${a.employee.company.name}</div></div>` : ""}
      ${a.employee.department ? `<div><div class="label">Department</div><div class="value">${a.employee.department}</div></div>` : ""}
      ${a.employee.email ? `<div><div class="label">Email</div><div class="value">${a.employee.email}</div></div>` : ""}
    </div>
  </div>

  <hr class="divider">

  <div class="section">
    <div class="section-title">Asset</div>
    <div class="grid">
      <div class="full"><div class="label">Name</div><div class="value">${a.asset.name}</div></div>
      <div><div class="label">Category</div><div class="value">${a.asset.category.name}</div></div>
      ${a.asset.assetCode ? `<div><div class="label">Asset ID</div><div class="value mono">${a.asset.assetCode}</div></div>` : ""}
      ${a.asset.xeroCode ? `<div><div class="label">Xero Code</div><div class="value mono">${a.asset.xeroCode}</div></div>` : ""}
      ${assetLabel ? `<div><div class="label">Brand / Model</div><div class="value">${assetLabel}</div></div>` : ""}
      ${a.asset.serialNumber ? `<div><div class="label">Serial Number</div><div class="value mono">${a.asset.serialNumber}</div></div>` : ""}
    </div>
  </div>

  <hr class="divider">

  <div class="section">
    <div class="section-title">Timeline</div>
    <div class="grid">
      <div><div class="label">Assigned</div><div class="value">${assignedDate}</div></div>
      <div><div class="label">Acknowledged</div><div class="value">${acknowledgedDate}</div></div>
      ${a.assignedByUser.name ? `<div><div class="label">Assigned by</div><div class="value">${a.assignedByUser.name}</div></div>` : ""}
    </div>
  </div>

  ${(a.notes || a.acknowledgmentNote) ? `
  <hr class="divider">
  <div class="section">
    <div class="section-title">Notes</div>
    ${a.notes ? `<p style="font-size:13px;color:#374151;margin-bottom:6px;"><span style="color:#9ca3af">Assignment: </span>${a.notes}</p>` : ""}
    ${a.acknowledgmentNote ? `<p style="font-size:13px;color:#374151"><span style="color:#9ca3af">Employee: </span>${a.acknowledgmentNote}</p>` : ""}
  </div>` : ""}

  <hr class="divider">

  <div class="section">
    <div class="section-title">Employee Signature</div>
    ${a.acknowledgmentSignature
      ? `<div class="sig-box"><img src="${a.acknowledgmentSignature}" alt="Signature"></div>`
      : `<p style="font-size:13px;color:#9ca3af;font-style:italic">No signature captured</p>`}
  </div>

  <div class="footer">
    Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} title="View proof">
        <FileCheck className="w-3.5 h-3.5 text-green-600" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:bg-transparent print:p-0 print:block"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            id="proof-content"
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto print:shadow-none print:max-h-none print:rounded-none"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Asset Receipt Proof</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Official acknowledgment of asset handover</p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                  ✓ Acknowledged
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-6">
              {/* Employee */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Employee</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  <div><span className="text-gray-500">Name</span><div className="font-medium">{a.employee.name}</div></div>
                  {a.employee.company && <div><span className="text-gray-500">Company</span><div className="font-medium">{a.employee.company.name}</div></div>}
                  {a.employee.department && <div><span className="text-gray-500">Department</span><div className="font-medium">{a.employee.department}</div></div>}
                  {a.employee.email && <div><span className="text-gray-500">Email</span><div className="font-medium">{a.employee.email}</div></div>}
                </div>
              </div>

              {/* Asset */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Asset</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  <div className="col-span-2"><span className="text-gray-500">Name</span><div className="font-medium">{a.asset.name}</div></div>
                  <div><span className="text-gray-500">Category</span><div className="font-medium">{a.asset.category.name}</div></div>
                  {a.asset.assetCode && <div><span className="text-gray-500">Asset ID</span><div className="font-medium font-mono text-xs">{a.asset.assetCode}</div></div>}
                  {a.asset.xeroCode && <div><span className="text-gray-500">Xero Code</span><div className="font-medium font-mono text-xs">{a.asset.xeroCode}</div></div>}
                  {(a.asset.brand || a.asset.model) && <div><span className="text-gray-500">Brand / Model</span><div className="font-medium">{[a.asset.brand, a.asset.model].filter(Boolean).join(" ")}</div></div>}
                  {a.asset.serialNumber && <div><span className="text-gray-500">Serial Number</span><div className="font-medium font-mono text-xs">{a.asset.serialNumber}</div></div>}
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Timeline</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  <div>
                    <span className="text-gray-500">Assigned</span>
                    <div className="font-medium">{new Date(a.assignedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Acknowledged</span>
                    <div className="font-medium">{new Date(a.acknowledgedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  {a.assignedByUser.name && (
                    <div><span className="text-gray-500">Assigned by</span><div className="font-medium">{a.assignedByUser.name}</div></div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {(a.notes || a.acknowledgmentNote) && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                  {a.notes && <p className="text-sm text-gray-700 mb-1"><span className="text-gray-400">Assignment: </span>{a.notes}</p>}
                  {a.acknowledgmentNote && <p className="text-sm text-gray-700"><span className="text-gray-400">Employee: </span>{a.acknowledgmentNote}</p>}
                </div>
              )}

              {/* Signature */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Employee Signature</h3>
                {a.acknowledgmentSignature ? (
                  <div className="rounded-lg border bg-gray-50 p-3 inline-block">
                    <img
                      src={a.acknowledgmentSignature}
                      alt="Employee signature"
                      className="max-h-24 object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No signature captured</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t bg-gray-50 flex justify-between items-center rounded-b-xl print:hidden">
              <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
              <Button size="sm" onClick={handlePrint}>Print / Save PDF</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
