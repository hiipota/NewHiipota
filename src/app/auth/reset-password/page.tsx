"use client";

import { useState } from "next";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Şifreler eşleşmiyor.");
      return;
    }
    
    setLoading(true);
    // Gerçek uygulamada API'ye istek atılır
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Şifreniz Güncellendi</h2>
          <p className="text-slate-500 mb-8">Güvenlik gereği yeni şifrenizle tekrar giriş yapmanız gerekmektedir.</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Yeniden Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-wide">
          <KeyRound className="w-6 h-6" /> HİPOTA
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            {session?.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Çıkış Yap
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-indigo-900/5 border border-indigo-50 max-w-lg w-full relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-amber-500"></div>

          <div className="flex items-start gap-4 mb-8 bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Şifre Değişimi Zorunlu</h2>
              <p className="text-sm text-slate-600 mt-1">Sistem güvenliği (Bilgi Güvenliği Politikası) gereği şifrenizi her 6 ayda bir güncellemeniz gerekmektedir.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Yeni Şifreniz</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-50 text-slate-800"
                placeholder="En az 8 karakter"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Yeni Şifreniz (Tekrar)</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-50 text-slate-800"
                placeholder="Şifrenizi doğrulayın"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-70 mt-6"
            >
              {loading ? "Güncelleniyor..." : "Şifremi Güncelle ve Devam Et"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
