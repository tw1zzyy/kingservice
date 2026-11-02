import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, dueDateDays } = req.body;

    const order = await prisma.salesOrder.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const count = await prisma.invoice.count();
    const invoiceNumber = `FV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (dueDateDays || 14));

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        customerId: order.customerId,
        type: 'STANDARD',
        status: 'PENDING',
        subtotal: order.subtotal,
        taxTotal: order.taxTotal,
        totalAmount: order.totalAmount,
        dueDate,
      },
    });

    return res.status(200).json({ success: true, invoice });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
