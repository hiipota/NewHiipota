"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function NewExpensePage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("YEMEK");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!title || !amount) {
       alert("Lütfen başlık ve tutarı doldurun!");
       return;
    }
    
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ title, amount, category, receiptUrl })
      });
      if(res.ok) {
         router.push("/panel/expense");
      } else {
         alert("Masraf kaydedilemedi.");
      }
    } catch {
       alert("Bir hata oluştu");
    } finally {
       setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <Link href="/panel/expense" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium">
         <ArrowLeft className="w-5 h-5" />
         Masraflara Dön
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Receipt className="w-8 h-8 text-emerald-600" />
          Yeni Masraf Fişi Ekle
        </h1>
        <p className="text-slate-500 mt-2">Şirket harcamalarınızı sisteme girin ve yöneticinize onaya gönderin.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 md:col-span-2">
               <label className="block text-sm font-semibold text-slate-700">Masraf Açıklaması (Örn: Müşteri Yemeği, Taksi)</label>
               <input 
                 type="text" 
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition outline-none"
                 placeholder="Masraf sebebini kısaca açıklayın"
               />
            </div>

            <div className="space-y-3">
               <label className="block text-sm font-semibold text-slate-700">Tutar (TRY)</label>
               <div className="relative">
                 <span className="absolute left-4 top-3.5 font-bold text-slate-400">₺</span>
                 <input 
                   type="number" 
                   step="0.01"
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition outline-none"
                   placeholder="0.00"
                 />
               </div>
            </div>

            <div className="space-y-3">
               <label className="block text-sm font-semibold text-slate-700">Kategori</label>
               <select 
                 value={category}
                 onChange={(e) => setCategory(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition outline-none"
               >
                 <option value="YEMEK">Yemek İkram</option>
                 <option value="ULASIM">Ulaşım / Taksi / Yakıt</option>
                 <option value="KONAKLAMA">Konaklama</option>
                 <option value="OFIS">Ofis Malzemesi</option>
                 <option value="DIGER">Diğer</option>
               </select>
            </div>

            <div className="space-y-3 md:col-span-2">
               <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                 Belge / Fiş Fotoğrafı URL (Opsiyonel)
               </label>
               <div className="relative">
                 <ImageIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                 <input 
                   type="url" 
                   value={receiptUrl}
                   onChange={(e) => setReceiptUrl(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition outline-none"
                   placeholder="https://..."
                 />
               </div>
               <p className="text-xs text-slate-500 pl-1">Mevcut versiyonda fiş linki olarak dosya sunucu bağımsız girilebilir.</p>
            </div>
         </div>

         <div className="pt-6 border-t border-slate-100 flex justify-end">
             <button 
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                 <Save className="w-5 h-5" /> 
                 {saving ? "Onaya Gönderiliyor..." : "Masrafı Onaya Gönder"}
              </button>
         </div>
      </form>
    </div>
  );
}
