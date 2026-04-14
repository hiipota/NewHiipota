"use client";

import { useEffect, useState } from "react";
import { Megaphone, Save, ArrowLeft, Key, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AnnouncementSettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/tenant/settings");
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.data?.isAiKeySet);
      }
    } catch {
       // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openaiApiKey: apiKey })
      });
      if (res.ok) {
        setIsSaved(!!apiKey);
        if(!apiKey) setIsSaved(false); // If they wanted to clear
        setApiKey("");
        setMessage("API Key başarıyla " + (apiKey ? "kaydedildi!" : "silindi!"));
      } else {
        setMessage("Kaydedilirken hata oluştu");
      }
    } catch {
      setMessage("Sunucu bağlantı hatası");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="p-8 text-slate-500 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <Link href="/panel/announcements" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium">
         <ArrowLeft className="w-5 h-5" />
         Duyurulara Dön
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          Yapay Zeka (AI) Ayarları
        </h1>
        <p className="text-slate-500 mt-2">Duyuru modülündeki risk analizi için gerçek LLM bağlantısını buradan kurabilirsiniz.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 z-0"></div>
        
        <div className="relative z-10 space-y-6">
           <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="mt-1"><AlertCircle className="w-6 h-6 text-blue-600" /></div>
              <div>
                 <h3 className="font-bold text-blue-900">Nasıl Çalışır?</h3>
                 <p className="text-sm text-blue-800/80 mt-1">
                   Sisteme bir OpenAI API Key tanımladığınızda, duyuru yayınlama ekranındaki 'AI Kontrol' butonu dışarı (OpenAI sunucularına) bağlanarak metin analizi yapar. 
                   Anahtar yoksa dahili kelime avcısı (Mock) kural seti çalışır.
                 </p>
              </div>
           </div>

           <div className="space-y-4">
              <label className="block font-semibold text-slate-800 flex items-center gap-2">
                 <Key className="w-5 h-5 text-slate-400" />
                 OpenAI API Key (sk-...)
              </label>
              {isSaved && !apiKey && (
                 <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2 bg-emerald-50 w-max px-3 py-1 rounded-lg">
                    <CheckCircle className="w-4 h-4" /> 
                    Halihazırda sisteme tanımlı ve aktif bir anahtarınız var.
                 </div>
              )}
              <input 
                 type="password"
                 value={apiKey}
                 onChange={(e) => setApiKey(e.target.value)}
                 className="w-full font-mono px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition outline-none"
                 placeholder={isSaved ? "Yeni bir anahtar ile değiştirmek (veya silmek) için buraya yapıştırın" : "sk-proj-xxxxxxxx..."}
              />
              <p className="text-xs text-slate-400">Şifreleme kullanılarak Tenant ayarlarınıza gömülür. Boş bırakıp kaydederseniz anahtar silinir.</p>
           </div>

           {message && (
             <div className={`text-sm font-medium px-4 py-2 rounded-lg border ${message.includes('hata') ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
               {message}
             </div>
           )}

           <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-200 flex items-center gap-2"
              >
                 <Save className="w-5 h-5" /> 
                 {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
