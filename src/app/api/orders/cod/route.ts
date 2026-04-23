import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, address, amount, items, codRequest } = await req.json();

    const txnid = `COD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // If codRequest is true, mark as 'cod_requested' (needs owner approval)
    // Otherwise mark as 'cod_pending' (direct COD)
    const status = codRequest ? 'cod_requested' : 'cod_pending';

    await prisma.order.create({
      data: {
        txnid,
        status,
        amount: parseFloat(amount),
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        address,
        items: items || [],
      },
    });

    return NextResponse.json({ success: true, txnid });
  } catch (error) {
    console.error('COD order creation error:', error);
    return NextResponse.json({ error: 'Failed to place COD order' }, { status: 500 });
  }
}
