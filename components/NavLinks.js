"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus2, Table2, BarChart3 } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tambah-lps", label: "Tambah LPS", icon: FilePlus2 },
  { href: "/data-lps", label: "Data LPS", icon: Table2 },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
];

export default function NavLinks({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-5 space-y-1">
      {links.map((l) => {
        const active = pathname === l.href;
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              active
                ? "bg-amber-500/15 text-white border-l-[3px] border-amber-500"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={18} />
            <span>{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
