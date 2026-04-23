import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, brand, description, price, imageUrl, sizes } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand: brand || 'Unknown',
        description: description || '',
        price: parseFloat(price.toString()),
        imageUrl: imageUrl || null,
        sizes: sizes || {},
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, brand, description, price, imageUrl, sizes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        brand,
        description,
        price: parseFloat(price.toString()),
        imageUrl,
        sizes,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
