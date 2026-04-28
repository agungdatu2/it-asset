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
    window.print();
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
