import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const sort = searchParams.get('sort'); // price_asc, price_desc, newest
    
    const ids = searchParams.get('ids');
    
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const where: any = {};

    // Support fetching by specific IDs (for stock validation)
    if (ids) {
      where.id = { in: ids.split(',').filter(Boolean) };
    }

    if (category && category.toLowerCase() !== 'sale') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
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
    const { name, brand, description, price, imageUrl, sizes, category } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand: brand || 'Unknown',
        description: description || '',
        price: parseFloat(String(price)),
        imageUrl: imageUrl || null,
        category: category || 'Men',
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
    const { id, name, brand, description, price, imageUrl, sizes, category } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
    }

    if (price === undefined || price === null) {
      return NextResponse.json({ error: 'Price is required' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        brand,
        description,
        price: parseFloat(String(price)),
        imageUrl: imageUrl || null,
        category,
        sizes,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
