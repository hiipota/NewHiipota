"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import IdleTimer from "./IdleTimer";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Search or breadcrumbs could go here */}
        <h2 className="text-xl font-semibold text-slate-800">
          Kurumsal Yönetim
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <IdleTimer />

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold border-2 border-white shadow-sm">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-700">
              {session?.user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {session?.user?.role?.replace('_', ' ').toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
            title="Çıkış Yap"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}
