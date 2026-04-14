"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  PieChart, 
  Megaphone,
  CreditCard,
  Briefcase,
  Wallet
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { name: "Dashboard", href: "/panel", icon: LayoutDashboard },
  { name: "Personel Bilgileri", href: "/panel/employees", icon: Users },
  { name: "Performans", href: "/panel/performance", icon: PieChart },
  { name: "Zimmet Yönetimi", href: "/panel/assets", icon: Briefcase },
  { name: "Duyurular", href: "/panel/announcements", icon: Megaphone },
  { name: "Masraf Modülü", href: "/panel/expense", icon: Wallet },
  { name: "Banka ve Kartlar", href: "/panel/bank", icon: CreditCard },
  { name: "Ayarlar", href: "/panel/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">H</span>
          HIPOTA
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modüller</p>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/panel");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-medium",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              )}
            >
              <item.icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
        HIPOTA SaaS v2.0
      </div>
    </aside>
  );
}
