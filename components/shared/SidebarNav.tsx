"use client";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { LayoutDashboard, Monitor, Users, ArrowLeftRight, Building2, ShieldCheck, Loader2 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/assets",      label: "Assets",      icon: Monitor },
  { href: "/companies",   label: "Companies",   icon: Building2 },
  { href: "/employees",   label: "Employees",   icon: Users },
  { href: "/assignments", label: "Assignments", icon: ArrowLeftRight },
  { href: "/users",       label: "Admin Users", icon: ShieldCheck },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  function handleClick(href: string) {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    if (active) return;
    setPendingHref(href);
    startTransition(() => { router.push(href); });
  }

  if (!isPending && pendingHref) setPendingHref(null);

  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        const isLoading = isPending && pendingHref === href;
        return (
          <button
            key={href}
            onClick={() => handleClick(href)}
            className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
              active
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              : <Icon className="w-4 h-4 shrink-0" />
            }
            {label}
          </button>
        );
      })}
    </nav>
  );
}
