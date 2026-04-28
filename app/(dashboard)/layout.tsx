import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { LogOut } from "lucide-react";
import Image from "next/image";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex flex-col w-60 border-r bg-card shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-5 border-b">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
            <Image src="/logo.png" alt="Logo" width={34} height={34} className="object-contain" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-xs tracking-tight">IT ASSETS LIST</p>
            <p className="font-bold text-xs tracking-tight text-muted-foreground">MANAGEMENT</p>
          </div>
        </div>

        <SidebarNav />

        <div className="p-3 border-t space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form className="flex-1" action={handleSignOut}>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar + drawer */}
      <MobileSidebar
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
        signOutAction={handleSignOut}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
