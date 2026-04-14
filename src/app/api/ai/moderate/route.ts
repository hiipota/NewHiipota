import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    let targetTenantId = session.user.tenantId;
    if (session.user.role === 'SUPER_ADMIN') {
       const firstTenant = await prisma.tenant.findFirst();
       targetTenantId = firstTenant?.id || null;
    }

    if (!targetTenantId) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await request.json();
    const { content } = data;

    // API Key'i bulmak içi DB'ye git
    const tenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId }
    });
    
    const settings = JSON.parse(tenant?.settingsJson || "{}");
    const apiKey = settings.openaiApiKey;

    if (apiKey) {
      // -------------------------------------------------------------
      // GERÇEK OPENAI LLM BAĞLANTISI (api.openai.com)
      // -------------------------------------------------------------
      const systemPrompt = `Sen bir İK kurumsal iletişim ve güvenlik editörüsün. Sana verilen metni şu 5 kurala göre katı bir şekilde incele:
1. Küfür, Argo, Tehdit ve Şiddet var mı?
2. Mobbing, Ayrımcılık ve Bölücülük var mı?
3. Politik Söylem, Propaganda ve Marka Karalama var mı?
4. Yasa Dışı Faaliyet, Kumar ve Yasadışı Bahis var mı?
5. Aşırı Yazım/İmla Hataları veya profesyonellik dışı içerik var mı?

Eğer bu 5 kuraldan herhangi birine aykırı bir durum varsa riskScore='VERY_HIGH' de, tamamen uygunsa riskScore='LOW'.
Ayrıca metni nazikçe özetle veya tespit ettiğin ihlalleri belirt (summary alanına yaz).
Eğer riskli kelime veya yapılar bulursan, ilgili yeri tam olarak şu html formatıyla değiştir: <span class="text-red-500 font-bold bg-red-50 px-1 rounded">kelimeler</span>, metnin geri kalanına dokunma (highlightedContent alanına yaz).
Sonuçları sadece aşağıdaki formatta saf JSON olarak dön:
{
  "riskScore": "VERY_HIGH",
  "summary": "Analiz özeti...",
  "highlightedContent": "İşaretlenmiş metin"
}`;

      try {
        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // Hızlı ve ucuz analiz modeli
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (openAiResponse.ok) {
           const openAiData = await openAiResponse.json();
           const resultRaw = openAiData.choices[0].message.content;
           const result = JSON.parse(resultRaw);
           
           return NextResponse.json({
              data: {
                riskScore: result.riskScore,
                summary: result.summary + " ✨(AI Onaylı)",
                highlightedContent: result.highlightedContent
              }
           });
        }
      } catch(err) {
         console.warn("OpenAI API ulaşılamadı. Mock sisteme düşülüyor...");
      }
    }

    // -------------------------------------------------------------
    // LOCAL MOCK LLM (Eğer API Key yoksa veya bağlantı koptuysa)
    // -------------------------------------------------------------
    const lowerContent = content.toLowerCase();
    let riskScore = 'LOW';
    let summary = 'İçerik şirketin yayın kurallarına uygundur. (Not: AI Anahtarı algılanmadı veya geçersiz bir anahtar girildi. Ulaşılamadığı için Sistem dahili Mock ile analiz yaptı.)';
    let highlightedContent = content;

    const dangerousWords = ['silah', 'tehdit', 'kumar', 'hakaret', 'küfür', 'mobbing', 'yasadışı', 'politika', 'ayrımcılık', 'propaganda'];

    let foundDanger = false;
    dangerousWords.forEach(word => {
      if (lowerContent.includes(word)) {
        foundDanger = true;
        const regex = new RegExp(`(${word})`, 'gi');
        highlightedContent = highlightedContent.replace(regex, '<span class="text-red-500 font-bold bg-red-50 px-1 rounded">$1</span>');
      }
    });

    if (foundDanger) {
      riskScore = 'VERY_HIGH';
      summary = 'DİKKAT: İçerikte "Yüksek Riskli" (tehdit/şiddet unsuru vb.) tespit edilmiştir. (Local AI Modu)';
    }

    return NextResponse.json({ 
      data: { riskScore, summary, highlightedContent }
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
