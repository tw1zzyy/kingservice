import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { getProductPricesForCustomer } from "../../../lib/pricing";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  let customerId: string | null = null;

  if (session && (session.user as any).role === "B2B_CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { userId: (session.user as any).id },
    });
    if (customer) {
      customerId = customer.id;
    }
  }

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
    });

    if (customerId) {
      const productIds = products.map((p) => p.id);
      const customPrices = await getProductPricesForCustomer(customerId, productIds);

      const enrichedProducts = products.map((product) => {
        const cp = customPrices.find((p) => p.productId === product.id);
        return {
          ...product,
          resolvedPrice: cp ? cp.price.toNumber() : product.standardPrice.toNumber(),
          isCustom: cp?.isCustom || false,
          isPromo: cp?.isPromo || false,
        };
      });

      return res.status(200).json(enrichedProducts);
    } else {
      const standardProducts = products.map((product) => ({
        ...product,
        resolvedPrice: product.standardPrice.toNumber(),
        isCustom: false,
        isPromo: false,
      }));
      return res.status(200).json(standardProducts);
    }
  } catch (error: any) {
    console.error("Catalog fetch error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}
