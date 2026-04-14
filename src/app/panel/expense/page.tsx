"use client";

import { useEffect, useState } from "react";
import { Receipt, Search, Plus, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useSession } from "next-auth/react";

export default function ExpensesPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Model Admin Reject/Approve States
  const [actingExpenseId, setActingExpenseId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const isAdmin = session?.user?.role === "COMPANY_ADMIN" || session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data.data || []);
    } catch {
       // err
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, status: string) => {
     if (status === 'REJECTED' && !rejectionReason) {
        return;
     }

     try {
       const res = await fetch(`/api/expenses/${id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ status, rejectionReason: status === 'REJECTED' ? rejectionReason : null })
       });
       
       if (res.ok) {
         setActingExpenseId(null);
         setRejectionReason("");
         fetchExpenses();
       } else {
         alert("İşlem yapılamadı.");
       }
     } catch (e) {
       console.error(e);
     }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-sm font-semibold border border-amber-200"><Clock className="w-4 h-4"/> Bekliyor</span>;
      case 'APPROVED': return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-sm font-semibold border border-emerald-200"><CheckCircle2 className="w-4 h-4"/> Onaylandı</span>;
      case 'REJECTED': return <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg text-sm font-semibold border border-red-200"><XCircle className="w-4 h-4"/> Reddedildi</span>;
      default: return null;
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-emerald-600" />
            Masraf Yönetimi
          </h1>
          <p className="text-slate-500 mt-2">
            {isAdmin ? 'Şirket personellerinin masraf girişlerini yönetin ve onaylayın.' : 'Kendi masraf girişlerinizi takip edin ve yenilerini ekleyin.'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/panel/expense/new" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" />
            Yeni Masraf Fişi
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="İsim, başlık veya kategori ara..." 
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
        />
      </div>

      {isLoading ? (
         <div className="text-center py-12 text-slate-500">Masraflar Yükleniyor...</div>
      ) : (
        <div className="grid gap-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-slate-300">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between xl:justify-start gap-4">
                    <h3 className="text-xl font-bold text-slate-800">
                      {expense.title}
                    </h3>
                    {getStatusBadge(expense.status)}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">Tutar: {expense.amount.toFixed(2)} {expense.currency}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">{expense.category}</span>
                    <span>{format(new Date(expense.createdAt), 'dd MMMM yyyy', { locale: tr })}</span>
                    {isAdmin && (
                       <span className="flex items-center gap-1.5 font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                         <FileText className="w-4 h-4" /> Pers: {expense.employee?.firstName} {expense.employee?.lastName}
                       </span>
                    )}
                  </div>

                  {expense.status === 'REJECTED' && expense.rejectionReason && (
                     <div className="mt-3 bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100">
                        <span className="font-bold">Red Nedeni:</span> {expense.rejectionReason}
                     </div>
                  )}

                  {actingExpenseId === expense.id && isAdmin && expense.status === 'PENDING' && (
                     <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <label className="block text-sm font-bold text-slate-700">Reddetme Gerekçesi (Sadece Ret İçin)</label>
                        <input 
                          type="text" 
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          placeholder="Fatura tarihi geçersiz vb."
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        <div className="flex gap-2">
                           <button onClick={() => handleAction(expense.id, 'APPROVED')} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm">Onayla (Approve)</button>
                           <button onClick={() => handleAction(expense.id, 'REJECTED')} disabled={!rejectionReason} className="px-4 py-2 bg-red-600 disabled:opacity-50 text-white font-bold rounded-lg text-sm">Reddet (Reject)</button>
                           <button onClick={() => { setActingExpenseId(null); setRejectionReason(""); }} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-sm">İptal</button>
                        </div>
                     </div>
                  )}
                </div>
                
                {isAdmin && expense.status === 'PENDING' && actingExpenseId !== expense.id && (
                   <button 
                     onClick={() => setActingExpenseId(expense.id)}
                     className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition whitespace-nowrap"
                   >
                      Yönetici İşlemi
                   </button>
                )}

              </div>
            </div>
          ))}
          
          {expenses.length === 0 && (
            <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-700">Masraf kaydı bulunamadı</p>
              <p className="mt-1">Sisteme girilmiş henüz bir masraf belgesi yok.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
