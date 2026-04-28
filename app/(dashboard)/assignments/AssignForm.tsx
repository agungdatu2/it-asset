"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { assignAsset } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface Asset { id: string; name: string; category: { name: string }; }
interface Employee { id: string; name: string; department: string | null; }
interface Company { id: string; name: string; assets: Asset[]; employees: Employee[]; }

export function AssignForm({ companies }: { companies: Company[] }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const company = companies.find((c) => c.id === selectedCompanyId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await assignAsset(fd);
      router.refresh();
      e.currentTarget?.reset();
      setSelectedCompanyId("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Step 1: Company — native select, not submitted */}
        <div className="space-y-1.5">
          <Label>1. Company</Label>
          <select
            className="flex h-8 w-full items-center rounded-lg border border-border bg-background px-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
          >
            <option value="">Select company...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Asset */}
        <div className="space-y-1.5">
          <Label>2. Asset (Vacant)</Label>
          <Select name="assetId" required disabled={!selectedCompanyId}>
            <SelectTrigger>
              <SelectValue placeholder={selectedCompanyId ? (company?.assets.length ? "Select asset..." : "No vacant assets") : "Select company first"} />
            </SelectTrigger>
            <SelectContent>
              {company?.assets.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name} ({a.category.name})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 3: Employee */}
        <div className="space-y-1.5">
          <Label>3. Employee</Label>
          <Select name="employeeId" required disabled={!selectedCompanyId}>
            <SelectTrigger>
              <SelectValue placeholder={selectedCompanyId ? (company?.employees.length ? "Select employee..." : "No employees") : "Select company first"} />
            </SelectTrigger>
            <SelectContent>
              {company?.employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}{e.department ? ` — ${e.department}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea name="notes" rows={1} placeholder="optional..." />
        </div>
      </div>

      <Button type="submit" disabled={!selectedCompanyId || isPending}>
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Assign
      </Button>
    </form>
  );
}
