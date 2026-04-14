import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await params;
    const bodyText = await request.text();
    let data : any = {};
    if (bodyText) {
       data = JSON.parse(bodyText);
    }
    
    const { durationSeconds, versionRead } = data;

    const log = await prisma.announcementLog.create({
      data: {
        announcementId: id,
        userId: user.id,
        durationSeconds: durationSeconds || 0,
        versionRead: versionRead || 1,
        readAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    console.error('Error in POST /api/announcements/[id]/log', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
