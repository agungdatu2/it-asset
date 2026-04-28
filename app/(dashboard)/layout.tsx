import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LogOut } from "lucide-react";
import Image from "next/image";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <aside className="flex flex-col w-60 border-r bg-card shrink-0">
        {/* Logo & App name */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
          <div className="leading-tight">
            <p className="font-bold text-xs tracking-tight">IT ASSETS LIST</p>
            <p className="font-bold text-xs tracking-tight text-muted-foreground">MANAGEMENT</p>
          </div>
        </div>

        <SidebarNav />

        {/* Bottom: user info + dark mode + logout */}
        <div className="p-3 border-t space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form className="flex-1" action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
