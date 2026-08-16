import { NextRequest, NextResponse } from 'next/server';
import { getOrdersStore } from '@/lib/ai-agent-engine';
import { requireApiUser, isApiError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Orders require a durable authenticated data service.' }, { status: 501 });
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customer_id');
  const orderId = searchParams.get('order_id');

  const orders = getOrdersStore();

  if (orderId) {
    const single = orders.find((o) => o.order_id.toLowerCase() === orderId.toLowerCase());
    return NextResponse.json({ orders: single ? [single] : [] });
  }

  if (customerId) {
    const filtered = orders.filter((o) => o.customer_id.toLowerCase() === customerId.toLowerCase());
    return NextResponse.json({ orders: filtered });
  }

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser(req);
    if (isApiError(auth)) return auth;
    if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Orders require a durable authenticated data service.' }, { status: 501 });
    const body = await req.json();
    const { action, order_id, customer_id, address, reason } = body;

    if (!order_id || !customer_id) {
      return NextResponse.json({ error: 'Missing order_id or customer_id' }, { status: 400 });
    }

    const orders = getOrdersStore();
    const targetOrder = orders.find((o) => o.order_id.toUpperCase() === order_id.toUpperCase());

    if (!targetOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ownership Verification Security Check
    if (targetOrder.customer_id.toUpperCase() !== customer_id.toUpperCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: Order does not belong to the specified customer.' },
        { status: 403 }
      );
    }

    if (action === 'cancel_order') {
      if (targetOrder.status === 'shipped' || targetOrder.status === 'delivered') {
        return NextResponse.json(
          { error: 'Order has already shipped and cannot be cancelled.' },
          { status: 400 }
        );
      }
      targetOrder.status = 'cancelled';
      targetOrder.updated_at = new Date().toISOString();
      return NextResponse.json({ success: true, order: targetOrder });
    }

    if (action === 'change_address') {
      if (!address) {
        return NextResponse.json({ error: 'New shipping address required' }, { status: 400 });
      }
      targetOrder.shipping_address = address;
      targetOrder.updated_at = new Date().toISOString();
      return NextResponse.json({ success: true, order: targetOrder });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process order action' }, { status: 500 });
  }
}
