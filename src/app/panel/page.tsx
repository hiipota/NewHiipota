import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, Briefcase, Megaphone, PieChart } from "lucide-react";
import ExpandableSummaryCard from "@/components/ExpandableSummaryCard";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Example queries tailored to Tenant / Super Admin
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const tenantFilter = isSuperAdmin ? {} : { tenantId: session?.user?.tenantId! };

  const [empCount, activeCount, assetCount] = await Promise.all([
    prisma.employee.count({ where: tenantFilter }),
    prisma.employee.count({ where: { ...tenantFilter, employmentStatus: "ACTIVE" } }),
    prisma.asset.count({ where: tenantFilter })
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-full bg-white/10 skew-x-12 translate-x-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz, {session?.user?.email}</h1>
          <p className="text-blue-100 max-w-xl">
            Sistemdeki rolünüz: <span className="font-semibold text-white bg-white/20 px-2 py-0.5 rounded-full text-sm">{session?.user?.role}</span>. HİPOTA akıllı dashboard üzerinden şirketinizin en önemli verilerini hızlıca inceleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ExpandableSummaryCard
          title="Toplam Personel"
          value={empCount}
          subtitle={`${activeCount} Aktif`}
          icon={<Users className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          details={
            <div className="text-sm text-slate-600 space-y-2">
              <p>Departman Bazlı Dağılım (Özet):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Yazılım: Hızlı Bakış Yakında</li>
                <li>Satış: Hızlı Bakış Yakında</li>
              </ul>
              <button className="text-blue-600 font-medium hover:underline text-xs mt-2 inline-block">
                Tümünü Gör &rarr;
              </button>
            </div>
          }
        />

        <ExpandableSummaryCard
          title="Aktif Zimmetler"
          value={assetCount}
          icon={<Briefcase className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
          details={
            <div className="text-sm text-slate-600">
              <p>Bekleyen bakım onarım işlemleriniz bulunmuyor.</p>
              <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-100 text-purple-700">
                <p className="font-medium">İpucu:</p>
                <p className="text-xs">Yeni verilen zimmetleri zimmet modülü üzerinden onaylatabilirsiniz.</p>
              </div>
            </div>
          }
        />
        
        <ExpandableSummaryCard
          title="Son Duyurular"
          value="3"
          subtitle="Okunmamış"
          icon={<Megaphone className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-amber-500 to-orange-500"
          details={
            <div className="text-sm text-slate-600 space-y-3">
              <div className="border-l-2 border-orange-400 pl-3">
                <p className="font-semibold text-slate-800 text-xs">Aylık Değerlendirme Toplantısı</p>
                <p className="text-xs text-slate-500">2 saat önce</p>
              </div>
              <div className="border-l-2 border-orange-400 pl-3">
                <p className="font-semibold text-slate-800 text-xs">Yemekhane Menü Değişikliği</p>
                <p className="text-xs text-slate-500">1 gün önce</p>
              </div>
            </div>
          }
        />

        <ExpandableSummaryCard
          title="Performans"
          value="85%"
          subtitle="Ortalama"
          icon={<PieChart className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600"
          details={
            <div className="text-sm text-slate-600">
              <p>Bu ay için tamamlanan performans değerlendirmesi: <span className="font-bold">12</span></p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-right mt-1 text-emerald-600 font-medium">Hedef: %90</p>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Aktivite Akışı</h3>
           <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
              [ Aktivite Modülü Yükleniyor... ]
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Hızlı Kısayollar</h3>
           <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm text-left">
                 + Yeni Personel Ekle
              </button>
              <button className="p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium text-sm text-left">
                 + Yeni Zimmet Kaydı
              </button>
              <button className="p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors font-medium text-sm text-left">
                 + Duyuru Yayınla
              </button>
              <button className="p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium text-sm text-left border border-slate-200">
                 Tüm Raporlar &rarr;
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
