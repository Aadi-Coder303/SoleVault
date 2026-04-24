import prisma from '@/lib/prisma';
import ProductClient from '@/components/ProductClient';
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
    // This product is part of a color group
    const groupId = product.parentId || product.id;
    
    const variants = await prisma.product.findMany({
      where: {
        OR: [
          { id: groupId },           // the parent
          { parentId: groupId },     // all children of the parent
        ],
      },
      select: { id: true, name: true, colorName: true, imageUrl: true },
      orderBy: { createdAt: 'asc' },
    });

    // Only show swatches if there are 2+ variants
    if (variants.length >= 2) {
      colorVariants = variants;
    }
  }

  return <ProductClient product={product} colorVariants={colorVariants} />;
}
