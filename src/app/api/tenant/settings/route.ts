import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  let targetTenantId = session.user.tenantId;
  // Süper admin test ediyorsa ilk şirkete yönlendir
  if (session.user.role === 'SUPER_ADMIN') {
     const firstTenant = await prisma.tenant.findFirst();
     targetTenantId = firstTenant?.id || null;
  }

  if (!targetTenantId || (session.user.role !== 'COMPANY_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId }
    });

    if (!tenant) return NextResponse.json({ error: "Tenant bulunamadı" }, { status: 404 });

    const settings = JSON.parse(tenant.settingsJson || "{}");
    const isAiKeySet = !!settings.openaiApiKey;
    
    return NextResponse.json({ data: { isAiKeySet } });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  let targetTenantId = session.user.tenantId;
  // Süper admin test ediyorsa ilk şirkete yönlendir
  if (session.user.role === 'SUPER_ADMIN') {
     const firstTenant = await prisma.tenant.findFirst();
     targetTenantId = firstTenant?.id || null;
  }

  if (!targetTenantId || (session.user.role !== 'COMPANY_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { openaiApiKey } = body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId }
    });

    if (!tenant) return NextResponse.json({ error: "Tenant bulunamadı" }, { status: 404 });

    const settings = JSON.parse(tenant.settingsJson || "{}");
    
    if (openaiApiKey !== undefined) {
      if (openaiApiKey === "") {
         delete settings.openaiApiKey;
      } else {
         settings.openaiApiKey = openaiApiKey;
      }
    }

    await prisma.tenant.update({
      where: { id: targetTenantId },
      data: { settingsJson: JSON.stringify(settings) }
    });

    return NextResponse.json({ success: true, message: "Ayarlar güncellendi" });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
