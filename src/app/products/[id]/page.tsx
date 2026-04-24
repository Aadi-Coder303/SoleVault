import prisma from '@/lib/prisma';
import ProductClient from '@/components/ProductClient';
import ProductRecommendations from '@/components/ProductRecommendations';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    return notFound();
  }

  // Fetch color variants: find all products in the same color group
  let colorVariants: { id: string; name: string; colorName: string | null; imageUrl: string | null }[] = [];
  
  if (product.parentId || product.colorName) {
    const groupId = product.parentId || product.id;
    
    const variants = await prisma.product.findMany({
      where: {
        OR: [
          { id: groupId },
          { parentId: groupId },
        ],
      },
      select: { id: true, name: true, colorName: true, imageUrl: true },
      orderBy: { createdAt: 'asc' },
    });

    if (variants.length >= 2) {
      colorVariants = variants;
    }
  }

  // --- Recommendations ---

  // 1. "More From [Brand]" — same brand, exclude current + color variants
  const colorVariantIds = colorVariants.map(v => v.id);
  const excludeIds = [id, ...colorVariantIds];
  
  const moreBrand = await prisma.product.findMany({
    where: {
      brand: { equals: product.brand, mode: 'insensitive' },
      id: { notIn: excludeIds },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  // 2. "People Also Bought" — find orders that contain this product, extract other productIds
  let alsoBoought: typeof moreBrand = [];
  try {
    const ordersWithProduct = await prisma.order.findMany({
      where: {
        status: { in: ['paid', 'confirmed', 'shipped', 'delivered'] },
      },
      select: { items: true },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    // Filter orders that contain current product and extract other product IDs
    const coProductIds = new Set<string>();
    for (const order of ordersWithProduct) {
      const items = order.items as Array<{ productId: string }>;
      if (!Array.isArray(items)) continue;
      const hasThisProduct = items.some(i => i.productId === id);
      if (hasThisProduct) {
        items.forEach(i => {
          if (i.productId && i.productId !== id && !excludeIds.includes(i.productId)) {
            coProductIds.add(i.productId);
          }
        });
      }
    }

    if (coProductIds.size > 0) {
      alsoBoought = await prisma.product.findMany({
        where: { id: { in: Array.from(coProductIds).slice(0, 4) } },
      });
    }
  } catch (e) {
    console.error('Also bought query error:', e);
  }

  // 3. "You May Also Like" — same category, different products, fill remaining slots
  const alreadyShownIds = [...excludeIds, ...moreBrand.map(p => p.id), ...alsoBoought.map(p => p.id)];
  
  const youMayLike = await prisma.product.findMany({
    where: {
      category: { equals: product.category, mode: 'insensitive' },
      id: { notIn: alreadyShownIds },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <ProductClient product={product} colorVariants={colorVariants} />
      <ProductRecommendations
        moreBrand={moreBrand}
        alsoBought={alsoBoought}
        youMayLike={youMayLike}
        brandName={product.brand}
      />
    </>
  );
}
