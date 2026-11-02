import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getProductPricesForCustomer } from '@/lib/pricing';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, items, notes } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer ID and at least one item are required' });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const productIds = items.map((i: any) => i.productId);
    const resolvedPrices = await getProductPricesForCustomer(customerId, productIds);

    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const pData = resolvedPrices.find((p) => p.productId === item.productId);
      const unitPrice = pData ? pData.price.toNumber() : 0;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: pData ? pData.price : 0,
        totalPrice,
      });
    }

    const taxRate = 0.21;
    const taxTotal = subtotal * taxRate;
    const totalAmount = subtotal + taxTotal;

    const orderNumber = `ORD-ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId,
        status: 'CONFIRMED',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PENDING',
        subtotal,
        taxTotal,
        totalAmount,
        notes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    return res.status(201).json({ success: true, order });
  } catch (error: any) {
    console.error('Admin create order error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create order' });
  }
}
