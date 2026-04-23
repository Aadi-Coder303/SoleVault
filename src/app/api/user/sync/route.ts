import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: fetch user's cart & wishlist
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ cart: [], wishlist: [] });

    const data = await prisma.userData.findUnique({ where: { userId } });
    return NextResponse.json({
      cart: data?.cart ?? [],
      wishlist: data?.wishlist ?? [],
    });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ cart: [], wishlist: [] });
  }
}

// POST: save user's cart & wishlist
export async function POST(req: Request) {
  try {
    const { userId, cart, wishlist } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await prisma.userData.upsert({
      where: { userId },
      update: {
        ...(cart !== undefined ? { cart } : {}),
        ...(wishlist !== undefined ? { wishlist } : {}),
      },
      create: {
        userId,
        cart: cart ?? [],
        wishlist: wishlist ?? [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
