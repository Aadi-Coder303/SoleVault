import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const params: Record<string, string> = {};
    body.forEach((value, key) => { params[key] = value.toString(); });

    const salt = process.env.PAYU_MERCHANT_SALT!;

    // Verify reverse hash from PayU
    // Reverse hash: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    const reverseHashStr = `${salt}|${params.status}|||||||||||${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${params.key}`;
    const expectedHash = crypto.createHash('sha512').update(reverseHashStr).digest('hex');

    if (params.hash !== expectedHash) {
      console.error('PayU hash mismatch — possible tampered response');
      // Redirect to failure even if hash mismatched for security
      return NextResponse.redirect(new URL('/checkout?payment_failed=true&reason=tampered', req.url));
    }

    if (params.status === 'success') {
      // TODO: Save order to DB here with txnid + status
      return NextResponse.redirect(
        new URL(`/orders/confirmation?txnid=${params.txnid}&amount=${params.amount}`, req.url)
      );
    } else {
      return NextResponse.redirect(
        new URL('/checkout?payment_failed=true', req.url)
      );
    }
  } catch (error) {
    console.error('Payment success callback error:', error);
    return NextResponse.redirect(new URL('/checkout?payment_failed=true', req.url));
  }
}
