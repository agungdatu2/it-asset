"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Company { id: string; name: string; }

export function CompanyFilter({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("company") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("company", e.target.value);
    } else {
      params.delete("company");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
      value={current}
      onChange={handleChange}
    >
      <option value="">All Companies</option>
      {companies.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
