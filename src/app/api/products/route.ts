import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const sort = searchParams.get('sort'); // price_asc, price_desc, newest
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const requestedLimit = parseInt(searchParams.get('limit') || '24', 10);
    const limit = isNaN(requestedLimit) ? 24 : Math.min(requestedLimit, 100);
    const q = searchParams.get('q');
    
    const ids = searchParams.get('ids');
    
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const where: any = {};

    // Support fetching by specific IDs (for stock validation)
    if (ids) {
      where.id = { in: ids.split(',').filter(Boolean) };
      // When fetching by IDs, return all without pagination
      const products = await prisma.product.findMany({ where, orderBy });
      return NextResponse.json(products);
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category && category.toLowerCase() !== 'sale') {
      const categories = category.split(',').map((c: string) => c.trim());
      where.category = { in: categories, mode: 'insensitive' };
    }
    if (brand) {
      const brands = brand.split(',').map((b: string) => b.trim());
      where.brand = { in: brands, mode: 'insensitive' };
    }

    // Check if pagination is requested (page param present in URL)
    const paginated = searchParams.has('page') || searchParams.has('limit');
    
    if (paginated) {
      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
      return NextResponse.json({
        products,
        totalCount,
        page,
        hasMore: page * limit < totalCount,
      });
    } else {
      // Legacy: return flat array for backward compat (dashboard, stock checks, etc.)
      const products = await prisma.product.findMany({ where, orderBy });
      return NextResponse.json(products);
    }
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
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, brand, description, price, imageUrl, sizes, category, colorName, parentId, isSourced, sourcedDeliveryEstimate, sourcedNote } = body;

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
        colorName: colorName || null,
        parentId: parentId || null,
        isSourced: isSourced || false,
        sourcedDeliveryEstimate: sourcedDeliveryEstimate || null,
        sourcedNote: sourcedNote || null,
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
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, brand, description, price, imageUrl, sizes, category, colorName, parentId, isSourced, sourcedDeliveryEstimate, sourcedNote } = body;

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
        colorName: colorName || null,
        parentId: parentId || null,
        isSourced: isSourced ?? undefined,
        sourcedDeliveryEstimate: sourcedDeliveryEstimate ?? undefined,
        sourcedNote: sourcedNote ?? undefined,
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
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
