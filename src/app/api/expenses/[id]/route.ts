import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  // Sadece yetkili yöneticiler masraf durumunu değiştirebilir (APPROVE/REJECT)
  if (!session?.user?.tenantId || session.user.role === 'EMPLOYEE') {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
     const body = await req.json();
     const { status, rejectionReason } = body;

     const expense = await prisma.expense.update({
        where: { id: params.id, tenantId: session.user.tenantId },
        data: { status, rejectionReason }
     });

     return NextResponse.json({ data: expense });
  } catch (error) {
     return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
  }
}
