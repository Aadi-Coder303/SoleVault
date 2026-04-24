import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: Log a cart add event
export async function POST(req: Request) {
  try {
    const { productName, productId, size, price, visitorId } = await req.json();

    if (!productId || !visitorId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await prisma.cartEvent.create({
      data: {
        productName: productName || 'Unknown',
        productId,
        size: size || 'N/A',
        price: parseFloat(String(price)) || 0,
        visitorId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart event error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// GET: Fetch recent cart events (for dashboard)
export async function GET() {
  try {
    const events = await prisma.cartEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Fetch cart events error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
