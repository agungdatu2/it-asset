"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (timerRef.current) clearTimeout(timerRef.current);
    const value = e.target.value;
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value); else params.delete("q");
      params.delete("page");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }, 300);
  }

  return (
    <div className="relative">
      <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? "text-primary" : "text-muted-foreground"}`} />
      <Input
        className="pl-8 w-52"
        placeholder={placeholder}
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleChange}
      />
    </div>
  );
}
