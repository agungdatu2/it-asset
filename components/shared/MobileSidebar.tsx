"use client";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { ThemeToggle } from "./ThemeToggle";
import Image from "next/image";

interface Props {
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
}

export function MobileSidebar({ userName, userEmail, signOutAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar — mobile only */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
            <Image src="/logo.png" alt="Logo" width={26} height={26} className="object-contain" />
          </div>
          <span className="font-bold text-xs tracking-tight">IT ASSETS LIST MANAGEMENT</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-accent">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col bg-card border-r shadow-xl">
            <div className="flex items-center justify-between px-4 py-5 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Image src="/logo.png" alt="Logo" width={34} height={34} className="object-contain" />
                </div>
                <div className="leading-tight">
                  <p className="font-bold text-xs tracking-tight">IT ASSETS LIST</p>
                  <p className="font-bold text-xs tracking-tight text-muted-foreground">MANAGEMENT</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div onClick={() => setOpen(false)} className="flex-1">
              <SidebarNav />
            </div>

            <div className="p-3 border-t space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <form className="flex-1" action={signOutAction}>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
