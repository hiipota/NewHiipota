"use client";

import { useState } from "react";
import { Megaphone, Save, Send, AlertTriangle, CheckCircle, Loader2, Sparkles, User, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewAnnouncementPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [targetType, setTargetType] = useState("ALL");
  const [saving, setSaving] = useState(false);
  
  // AI Status
  const [aiChecking, setAiChecking] = useState(false);
  const [aiScore, setAiScore] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiHighlightedContent, setAiHighlightedContent] = useState<string | null>(null);

  const router = useRouter();

  const handleAiCheck = async () => {
    if (!content) return;
    setAiChecking(true);
    try {
      const res = await fetch("/api/ai/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const { data } = await res.json();
      setAiScore(data.riskScore);
      setAiSummary(data.summary);
      setAiHighlightedContent(data.highlightedContent);
    } catch {
      alert("AI bağlantısında hata oluştu.");
    } finally {
      setAiChecking(false);
    }
  };

  const handleSave = async (status: string) => {
    if (!title || !content) {
      alert("Lütfen başlık ve içerik alanlarını doldurun.");
      return;
    }

    setSaving(true);
    let finalStatus = status;

    // Eğer publish deniyorsa ve AI kontrol edilmemişse uyar
    if (status === 'PUBLISHED' && !aiScore) {
       alert("Lütfen önce Yapay Zeka (AI) denetiminden geçirin.");
       setSaving(false);
       return;
    }

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          priority,
          targetType,
          status: finalStatus,
          aiRiskScore: aiScore
        })
      });

      if (res.ok) {
        router.push("/panel/announcements");
      } else {
        const err = await res.json();
        alert("Hata: " + err.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-600" />
            Yeni Duyuru Oluştur
          </h1>
          <p className="text-slate-500 mt-2">Şirket çalışanlarınıza duyuru metninizi hazırlayın.</p>
        </div>
        <Link href="/panel/announcements" className="text-slate-500 hover:text-slate-900 font-medium">İptal</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sol Form Alanı */}
        <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Duyuru Başlığı</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2026 Yılı Yaz Tatili Hakkında" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700">İçerik Editörü (Zengin Metin)</label>
             </div>
             
             {/* Mock Rich Text Toolbar */}
             <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded hover:bg-slate-200 transition">B</button>
                <button className="px-3 py-1 bg-slate-100 text-slate-700 italic rounded hover:bg-slate-200 transition">I</button>
                <button className="px-3 py-1 bg-slate-100 text-slate-700 underline rounded hover:bg-slate-200 transition">U</button>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <button className="text-sm px-3 py-1 text-slate-600 hover:bg-slate-100 rounded flex items-center gap-1 transition">
                  Aa Yazı Tipi
                </button>
             </div>

             {aiHighlightedContent ? (
                <div 
                   className="w-full min-h-[300px] p-4 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                   dangerouslySetInnerHTML={{ __html: aiHighlightedContent }}
                />
             ) : (
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Duyurunuzun detaylarını yazın..." 
                  className="w-full h-[300px] px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                ></textarea>
             )}

             {aiHighlightedContent && (
               <div className="flex justify-end">
                  <button onClick={() => setAiHighlightedContent(null)} className="text-sm text-blue-600 font-medium hover:underline">
                    Düzenlemeye Devam Et
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* Sağ Ayarlar & AI Paneli */}
        <div className="space-y-6">
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
             <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-slate-500" />
                Yayın Ayarları
             </h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Öncelik</label>
                   <select 
                     value={priority}
                     onChange={(e) => setPriority(e.target.value)}
                     className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                   >
                     <option value="NORMAL">Normal Seviye</option>
                     <option value="URGENT">Acil & Önemli (Kırmızı Kategori)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Hedef Kitle</label>
                   <select 
                     value={targetType}
                     onChange={(e) => setTargetType(e.target.value)}
                     className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                   >
                     <option value="ALL">Tüm Şirket (Herkes)</option>
                     <option value="DEPARTMENTS">Belirli Departmanlar</option>
                     <option value="USERS">Belirli Kişiler Seçimi</option>
                   </select>
                </div>
             </div>
          </div>

          {/* AI Panel */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
             <div className="flex items-center justify-between mb-2">
               <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Yapay Zeka (AI) Denetimi
               </h3>
               <Link href="/panel/announcements/settings" className="px-2 py-1 text-xs font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition" title="AI Ayarları">
                  Ayarlar
               </Link>
             </div>
             <p className="text-xs text-slate-600 mb-4">
               Yayınlamadan önce içeriğin uygunluğunu kontrol ettirmeniz zorunludur.
             </p>
             
             {aiScore ? (
                <div className={`p-4 rounded-xl border mb-4 text-sm font-medium ${
                   aiScore === 'VERY_HIGH' 
                     ? 'bg-red-50 text-red-700 border-red-200' 
                     : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                   <p className="mb-2">{aiSummary}</p>
                   {aiScore === 'VERY_HIGH' && (
                     <p className="text-xs text-red-600 font-bold border-t border-red-200 pt-2 mt-2">
                        Bu içerik Admin Onayına takılacaktır!
                     </p>
                   )}
                </div>
             ) : (
               <button 
                  onClick={handleAiCheck}
                  disabled={aiChecking || !content}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
               >
                  {aiChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "AI Kontrol Başlat"}
               </button>
             )}
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
             <button 
               onClick={() => handleSave('DRAFT')}
               disabled={saving}
               className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
             >
                <Save className="w-5 h-5" /> Taslak Olarak Kaydet
             </button>

             <button 
               onClick={() => handleSave('PUBLISHED')}
               disabled={saving || !aiScore}
               className={`w-full py-3 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  !aiScore 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : aiScore === 'VERY_HIGH' 
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 shadow-lg' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg'
               }`}
             >
                <Send className="w-5 h-5" /> 
                {aiScore === 'VERY_HIGH' ? 'Onaya Gönder (Riskli)' : 'Duyuruyu Yayımla'}
             </button>
             {!aiScore && (
                <p className="text-[10px] text-center text-slate-400">Yayımlamak için önce AI kontrolü yapınız.</p>
             )}
          </div>

        </div>

      </div>
    </div>
  );
}
