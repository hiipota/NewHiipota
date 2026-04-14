"use client";

import { useEffect, useState } from "react";
import { Megaphone, Search, AlertCircle, CheckCircle2, AlertTriangle, Eye, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setAnnouncements(data.data || []);
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = announcements.filter(a => !a.isRead && a.status === 'PUBLISHED').length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-600" />
            Şirket Duyuruları
          </h1>
          <p className="text-slate-500 mt-2">Şirketinizdeki gelişmelerden ve duyurulardan haberdar olun.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 font-medium border border-red-100">
              <AlertCircle className="w-5 h-5" />
              {unreadCount} Okunmamış Duyuru
            </div>
          )}
          <Link href="/panel/announcements/new" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Yeni Duyuru Yayımla
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Duyurularda ara..." 
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
        />
      </div>

      {isLoading ? (
         <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              onClick={() => router.push(`/panel/announcements/${announcement.id}`)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                announcement.isRead ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm' : 'bg-blue-50/50 border-blue-200 hover:border-blue-300 shadow-md'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    {!announcement.isRead && announcement.status === 'PUBLISHED' && (
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]"></span>
                    )}
                    <h3 className={`text-xl ${announcement.isRead ? 'text-slate-800' : 'text-slate-900 font-bold'}`}>
                      {announcement.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    {announcement.priority === 'URGENT' && (
                      <span className="flex items-center gap-1.5 text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Acil Öncelikli
                      </span>
                    )}
                    {announcement.priority !== 'URGENT' && (
                       <span className="flex items-center gap-1.5 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                         Standart
                       </span>
                    )}
                    
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-4 h-4" />
                      {format(new Date(announcement.createdAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                    </span>
                    
                    <span className="text-slate-500 font-mono text-xs px-2 py-1 bg-slate-100 rounded">
                      {announcement.number || 'Taslak / Numara Almadı'}
                    </span>

                    {announcement.status === 'DRAFT' && (
                       <span className="bg-slate-800 text-white px-2 py-0.5 rounded-lg text-xs font-semibold">TASLAK</span>
                    )}
                    {announcement.status === 'PENDING_APPROVAL' && (
                       <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-semibold">AI / Admin Onayı Bekliyor</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-slate-400">
                  {announcement.isRead && announcement.status === 'PUBLISHED' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Okundu
                    </span>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <Eye className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-700">Henüz hiç duyuru yok</p>
              <p className="mt-1">Mevcut sistemde yayımlanmış hiçbir duyuru bulunmamaktadır.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
