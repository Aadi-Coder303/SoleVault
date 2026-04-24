import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

interface CartItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  imageUrl?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, productinfo, firstname, email, phone, address, items, couponCode, discount } = body;

    if (!amount || !productinfo || !firstname || !email) {
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
    }

    const key = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_MERCHANT_SALT!;
    const payuBase = process.env.PAYU_BASE_URL!;

    const txnid = `SV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Save a pending order to DB so we can track it on callback
    await prisma.order.create({
      data: {
        txnid,
        status: 'pending',
        amount: parseFloat(amount),
        customerName: firstname,
        customerEmail: email,
        customerPhone: phone || '',
        address: address || '',
        items: items || [],
        couponCode: couponCode || null,
        discount: parseFloat(discount) || 0,
      },
    });

    // PayU SHA-512 hash
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://website-seven-eta-98.vercel.app';

    return NextResponse.json({
      key,
      txnid,
      amount: String(amount),
      productinfo,
      firstname,
      email,
      phone: phone || '',
      surl: `${baseUrl}/api/payment/success`,
      furl: `${baseUrl}/api/payment/failure`,
      hash,
      payuBase,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
