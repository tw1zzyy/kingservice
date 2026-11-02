import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { prices } = req.body; // Array of { productId, price }

      if (!Array.isArray(prices)) {
        return res.status(400).json({ error: 'Prices must be an array' });
      }

      // We use a transaction to update/create multiple prices
      await prisma.$transaction(
        prices.map((p: any) =>
          prisma.customerPrice.upsert({
            where: {
              customerId_productId: {
                customerId: id as string,
                productId: p.productId,
              },
            },
            update: {
              price: p.price,
            },
            create: {
              customerId: id as string,
              productId: p.productId,
              price: p.price,
            },
          })
        )
      );

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Save customer prices error:', error);
      return res.status(500).json({ error: error.message || 'Failed to save prices' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
