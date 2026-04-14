import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId || !session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(session.user.role === 'EMPLOYEE' ? {
           employee: { email: session.user.email } 
        } : {})
      },
      include: {
        employee: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: expenses });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId || !session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, amount, category, receiptUrl } = body;

    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email }
    });

    if(!employee) return NextResponse.json({error: "Personel kaydı bulunamadı"}, {status: 404});

    const expense = await prisma.expense.create({
      data: {
        tenantId: session.user.tenantId,
        employeeId: employee.id,
        title,
        amount: parseFloat(amount),
        category,
        receiptUrl,
        status: "PENDING"
      }
    });

    return NextResponse.json({ data: expense });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
