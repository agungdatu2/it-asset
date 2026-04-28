import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { Monitor, LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <aside className="flex flex-col w-56 border-r bg-card shrink-0">
        <div className="flex items-center gap-2 px-4 py-5 border-b">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Monitor className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">IT Software</span>
        </div>

        <SidebarNav />

        <div className="p-3 border-t space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
