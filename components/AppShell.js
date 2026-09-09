"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import NavLinks from "@/components/NavLinks";
import ThemeToggle from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";

export default function AppShell({ children, userEmail }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    showToast("Berhasil keluar.");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 transition-colors">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen fixed left-0 top-0 flex-col text-white z-30 bg-gradient-to-b from-navy-900 to-navy-800">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <Logo size={36} />
          <div>
            <div className="font-display font-bold text-sm leading-tight">Monitoring LPS</div>
            <div className="text-[11px] text-white/50">PT Taspen</div>
          </div>
        </div>
        <NavLinks />
        <div className="px-5 py-4 border-t border-white/10">
          {userEmail && (
            <p className="text-[11px] text-white/50 mb-2 truncate" title={userEmail}>
              {userEmail}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-navy-900 text-white shadow-sm">
        <div className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="font-display font-bold text-sm">Monitoring LPS</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setDrawerOpen(true)} aria-label="Buka menu" className="p-2">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-navy-900 to-navy-800 text-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Logo size={32} />
                <span className="font-display font-bold text-sm">Monitoring LPS</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Tutup menu">
                <X size={20} />
              </button>
            </div>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
            <div className="px-5 py-4 border-t border-white/10">
              {userEmail && (
                <p className="text-[11px] text-white/50 mb-2 truncate" title={userEmail}>
                  {userEmail}
                </p>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition"
              >
                <LogOut size={14} /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop topbar (theme toggle) */}
      <div className="hidden md:flex md:ml-64 items-center justify-end px-8 py-4">
        <ThemeToggle />
      </div>

      <main className="md:ml-64 px-4 py-6 md:px-8 md:pt-0 md:pb-8 max-w-7xl">{children}</main>
    </div>
  );
}
