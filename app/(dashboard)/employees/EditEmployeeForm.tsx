"use client";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { updateEmployee } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  name: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  companyId: string | null;
}

interface Company {
  id: string;
  name: string;
}

export function EditEmployeeForm({ employee, companies }: { employee: Employee; companies: Company[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateEmployee(employee.id, fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Edit</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Employee</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input name="name" required defaultValue={employee.name} />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Select name="companyId" defaultValue={employee.companyId ?? ""}>
              <SelectTrigger><SelectValue placeholder="Select company..." /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input name="department" defaultValue={employee.department ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue={employee.email ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input name="phone" defaultValue={employee.phone ?? ""} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
