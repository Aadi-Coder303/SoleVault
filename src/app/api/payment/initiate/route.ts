import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, productinfo, firstname, email, phone, address } = body;

    if (!amount || !productinfo || !firstname || !email) {
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
    }

    const key = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_MERCHANT_SALT!;
    const payuBase = process.env.PAYU_BASE_URL!;

    // Generate a unique transaction ID
    const txnid = `SV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // PayU hash format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
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
