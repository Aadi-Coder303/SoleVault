import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json([], { status: 200 });
    }

    const where: any = { OR: [] };
    if (email) where.OR.push({ customerEmail: email });
    if (phone) where.OR.push({ customerPhone: phone });

    // If no conditions, return empty
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
