"use client";

import { useEffect, useState } from "react";
import { Megaphone, Clock, User, AlertTriangle, ArrowLeft, PenTool, CheckCircle2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchDetail();
    
    // Log okuma suresini sayfadan ayrılırken at
    return () => {
       const durationSeconds = Math.round((Date.now() - startTime) / 1000);
       fetch(`/api/announcements/${id}/log`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ durationSeconds: durationSeconds, versionRead: 1 }), 
         keepalive: true 
       }).catch(() => {});
    };
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/announcements/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncement(data.data);
      } else {
        router.push('/panel/announcements');
      }
    } catch {
      router.push('/panel/announcements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;
  }

  if (!announcement) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
       <Link href="/panel/announcements" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium">
         <ArrowLeft className="w-5 h-5" />
         Duyurulara Dön
       </Link>

       <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className={`p-8 border-b ${announcement.priority === 'URGENT' ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
             <div className="flex flex-wrap items-center gap-3 mb-4">
               {announcement.priority === 'URGENT' && (
                 <span className="flex items-center gap-1.5 text-red-700 font-bold bg-red-100 px-3 py-1 rounded-lg text-sm border border-red-200">
                   <AlertTriangle className="w-4 h-4" /> Acil / Önemli
                 </span>
               )}
               <span className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1 rounded-lg text-sm border font-medium">
                 No: {announcement.number || 'Taslak'}
               </span>
               <span className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1 rounded-lg text-sm border font-medium">
                 <Clock className="w-4 h-4" /> 
                 {format(new Date(announcement.createdAt), 'dd MMMM yyyy - HH:mm', { locale: tr })}
               </span>
               {announcement.status === 'PENDING_APPROVAL' && (
                 <span className="flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1 rounded-lg text-sm border border-amber-200 font-bold">
                   <AlertTriangle className="w-4 h-4" /> Admin Onayı Bekliyor
                 </span>
               )}
             </div>

             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
               {announcement.title}
             </h1>
          </div>

          <div className="p-8 min-h-[300px]">
             <div 
               className="max-w-none text-lg text-slate-700 font-medium leading-relaxed border-none focus:outline-none"
               dangerouslySetInnerHTML={{ __html: announcement.content }}
             />
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 font-medium">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Sisteme okundu olarak kaydedilmektedir.
             </div>
             {announcement.version > 1 && (
                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm font-bold">
                  <PenTool className="w-4 h-4" />
                  Düzeltildi ({announcement.version})
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
