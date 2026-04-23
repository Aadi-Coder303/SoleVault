import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderId, email, status } = await req.json();

    if (!orderId || !email || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real MVP, you would integrate Resend or SendGrid here:
    // await resend.emails.send({
    //   from: 'updates@solevault.com',
    //   to: email,
    //   subject: `Order Update: ${status}`,
    //   html: `<p>Your order #${orderId} is now ${status}.</p>`
    // });

    console.log(`[Mock Notification] Email sent to ${email} for Order #${orderId}. Status: ${status}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({ success: true, message: `Notification sent to ${email}` }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
