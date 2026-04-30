import prisma from '@/lib/prisma';
import ProductClient from '@/components/ProductClient';
import ProductRecommendationsServer from '@/components/ProductRecommendationsServer';
import { Suspense } from 'react';
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
  
  const hasChildren = await prisma.product.count({ where: { parentId: product.id } });
  
  if (product.parentId || product.colorName || hasChildren > 0) {
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

  const colorVariantIds = colorVariants.map(v => v.id);

  return (
    <>
      <ProductClient product={product} colorVariants={colorVariants} />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      }>
        <ProductRecommendationsServer
          productId={product.id}
          brand={product.brand}
          category={product.category}
          colorVariantIds={colorVariantIds}
        />
      </Suspense>
    </>
  );
}
