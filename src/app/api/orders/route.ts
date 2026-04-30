import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const all = searchParams.get('all');

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const isOwner = session?.user?.email && OWNER_EMAILS.includes(session.user.email);

    // Dashboard: fetch all orders
    if (all === 'true') {
      if (!isOwner) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      return NextResponse.json(orders);
    }

    // Customer: fetch by email/phone
    if (!email && !phone) {
      return NextResponse.json([], { status: 200 });
    }

    // Security check: Must be logged in, and if not an owner, can only fetch their own email
    if (!isOwner) {
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // If they provided an email that doesn't match their session, or if they only provided a phone
      if (email !== session.user.email) {
        return NextResponse.json({ error: 'Unauthorized to view these orders' }, { status: 403 });
      }
    }

    const where: any = { OR: [] };
    if (email) where.OR.push({ customerEmail: email });
    // We only allow phone lookup if they also proved email ownership (which we did above) or if they are owner
    if (phone) where.OR.push({ customerPhone: phone });

    if (where.OR.length === 0) {
      return NextResponse.json([]);
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
