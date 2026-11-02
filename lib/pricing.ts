import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export async function getProductPricesForCustomer(customerId: string, productIds: string[]) {
  // 1. Get customer-specific prices
  const customerPrices = await prisma.customerPrice.findMany({
    where: {
      customerId,
      productId: { in: productIds },
      OR: [
        { validFrom: null, validTo: null },
        { validFrom: { lte: new Date() }, validTo: { gte: new Date() } },
        { validFrom: { lte: new Date() }, validTo: null },
        { validFrom: null, validTo: { gte: new Date() } },
      ],
    },
  });

  // 2. Get promotional prices
  const promotionalPrices = await prisma.promotionalPrice.findMany({
    where: {
      productId: { in: productIds },
      validFrom: { lte: new Date() },
      validTo: { gte: new Date() },
    },
  });

  // 3. Get products for standard prices
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, standardPrice: true },
  });

  // Map to final prices
  return productIds.map((productId) => {
    const customerPrice = customerPrices.find((cp) => cp.productId === productId);
    const promotionalPrice = promotionalPrices.find((pp) => pp.productId === productId);
    const product = products.find((p) => p.id === productId);

    let finalPrice = product?.standardPrice || new Prisma.Decimal(0);

    if (customerPrice) {
      finalPrice = customerPrice.price;
    } else if (promotionalPrice) {
      finalPrice = promotionalPrice.price;
    }

    return {
      productId,
      price: finalPrice,
      isCustom: !!customerPrice,
      isPromo: !customerPrice && !!promotionalPrice,
    };
  });
}

export async function getCustomerPrice(customerId: string, productId: string) {
  const prices = await getProductPricesForCustomer(customerId, [productId]);
  return prices[0];
}

export async function getResolvedPrice(customerId: string, productId: string) {
  const res = await getCustomerPrice(customerId, productId);
  return res ? res.price : new Prisma.Decimal(0);
}
