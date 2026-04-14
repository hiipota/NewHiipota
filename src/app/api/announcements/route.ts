import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.tenantId) {
       return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
    }

    const isEmployee = user.role === 'EMPLOYEE';

    const announcements = await prisma.announcement.findMany({
      where: {
        tenantId: user.tenantId,
        isDeleted: false,
        // Standart personel sadece onaylanmış olanları görür
        ...(isEmployee ? { status: 'PUBLISHED' } : {})
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
         logs: {
             where: { userId: user.id },
             take: 1
         },
         _count: {
           select: { logs: true }
         }
      }
    });

    const enriched = announcements.map(acc => {
      const isRead = acc.logs && acc.logs.length > 0;
      return {
         ...acc,
         isRead
      };
    });

    return NextResponse.json({ data: enriched });
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Yetkiniz bulunmamaktadır.' }, { status: 403 });
    }

    const data = await request.json();
    const { title, content, priority, targetType, status, aiRiskScore } = data;

    // Numara atama simülasyonu
    let number = null;
    let finalStatus = status || 'DRAFT';
    let approveStatus = 'APPROVED';

    // AI Check
    if (aiRiskScore === 'VERY_HIGH') {
       finalStatus = 'PENDING_APPROVAL';
       approveStatus = 'PENDING';
    } 
    
    if (finalStatus === 'PUBLISHED') {
      number = `HIPO-${Date.now().toString().slice(-6)}`;
    }

    const announcement = await prisma.announcement.create({
      data: {
        tenantId: user.tenantId!,
        title,
        content,
        priority: priority || 'NORMAL',
        status: finalStatus,
        targetType: targetType || 'ALL',
        authorId: user.id,
        aiRiskScore,
        approveStatus,
        number
      }
    });

    return NextResponse.json({ data: announcement });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
