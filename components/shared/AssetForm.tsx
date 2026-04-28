"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["Laptop", "Monitor", "Printer", "Software License", "Keyboard", "Mouse", "Server", "Other"];
const STATUSES = [
  { value: "VACANT", label: "Vacant" },
  { value: "ACTIVE", label: "Active" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "BROKEN", label: "Broken" },
  { value: "RETIRED", label: "Retired" },
];

interface Company { id: string; name: string; }

interface Props {
  action: (formData: FormData) => Promise<void>;
  companies: Company[];
  defaultValues?: {
    name?: string;
    brand?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    purchaseDate?: Date | null;
    assetCode?: string | null;
    xeroCode?: string | null;
    purchasePrice?: number | null;
    status?: string;
    notes?: string | null;
    invoiceUrl?: string | null;
    companyId?: string | null;
    category?: { name: string };
  };
}

export function AssetForm({ action, companies, defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  const purchaseDateStr = defaultValues?.purchaseDate
    ? new Date(defaultValues.purchaseDate).toISOString().split("T")[0]
    : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">Asset Name *</Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name} placeholder="e.g. MacBook Pro 14" />
        </div>

        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select name="category" defaultValue={defaultValues?.category?.name || "Laptop"} required>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Company</Label>
          <Select name="companyId" defaultValue={defaultValues?.companyId ?? ""}>
            <SelectTrigger><SelectValue placeholder="Select company..." /></SelectTrigger>
            <SelectContent>
              {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select name="status" defaultValue={defaultValues?.status || "VACANT"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" defaultValue={defaultValues?.brand ?? ""} placeholder="e.g. Apple" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" defaultValue={defaultValues?.model ?? ""} placeholder="e.g. MBP M3 Pro" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input id="serialNumber" name="serialNumber" defaultValue={defaultValues?.serialNumber ?? ""} placeholder="e.g. C02XG1JHJGH6" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="assetCode">Asset ID</Label>
          <Input id="assetCode" name="assetCode" defaultValue={defaultValues?.assetCode ?? ""} placeholder="e.g. AST-001" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="xeroCode">Xero Code</Label>
          <Input id="xeroCode" name="xeroCode" defaultValue={defaultValues?.xeroCode ?? ""} placeholder="e.g. FA-001" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input id="purchaseDate" name="purchaseDate" type="date" defaultValue={purchaseDateStr} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="purchasePrice">Purchase Price</Label>
          <Input id="purchasePrice" name="purchasePrice" type="number" defaultValue={defaultValues?.purchasePrice ?? ""} placeholder="e.g. 1500" />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="invoiceUrl">Invoice URL</Label>
          <Input id="invoiceUrl" name="invoiceUrl" type="url" defaultValue={defaultValues?.invoiceUrl ?? ""} placeholder="https://drive.google.com/..." />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} rows={3} />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {defaultValues ? "Save Changes" : "Add Asset"}
      </Button>
    </form>
  );
}
