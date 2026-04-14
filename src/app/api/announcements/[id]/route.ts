import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement || announcement.isDeleted) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json({ data: announcement });
  } catch (error: any) {
    console.error('Error in GET /api/announcements/[id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role === 'EMPLOYEE') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const data = await request.json();
    const { title, content, priority, targetType } = data;
    const { id } = await params;

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        priority,
        targetType,
        version: existing.status === 'PUBLISHED' ? { increment: 1 } : existing.version
      }
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error('Error in PUT /api/announcements/[id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role === 'EMPLOYEE' || user.role === 'HR_ADMIN') return NextResponse.json({ error: 'Yetkisiz islem' }, { status: 403 });

    const { id } = await params;

    await prisma.announcement.update({
      where: { id },
      data: { isDeleted: true }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/announcements/[id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
