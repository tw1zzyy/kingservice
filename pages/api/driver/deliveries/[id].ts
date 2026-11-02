import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const { status, paymentMethod } = req.body;

    const delivery = await prisma.delivery.findUnique({
      where: { id: String(id) },
      include: { order: true },
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: String(id) },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    if (status === 'COMPLETED') {
      await prisma.salesOrder.update({
        where: { id: delivery.orderId },
        data: {
          status: 'DELIVERED',
          paymentStatus: paymentMethod === 'CASH' ? 'PAID' : delivery.order.paymentStatus,
        },
      });

      if (paymentMethod === 'CASH') {
        const invoice = await prisma.invoice.findFirst({
          where: { orderId: delivery.orderId },
        });

        if (invoice) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: delivery.order.totalAmount,
              method: 'CASH',
              reference: `Hotově u řidiče - ${delivery.deliveryNumber}`,
            },
          });

          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PAID', paidAt: new Date() },
          });
        }
      }
    }

    return res.status(200).json({ success: true, delivery: updatedDelivery });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
