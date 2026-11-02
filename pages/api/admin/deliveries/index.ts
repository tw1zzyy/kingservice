import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, driverId, scheduledDate, stopOrder } = req.body;

    const count = await prisma.delivery.count();
    const deliveryNumber = `DEL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const delivery = await prisma.delivery.create({
      data: {
        deliveryNumber,
        orderId,
        driverId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        stopOrder: stopOrder ? parseInt(stopOrder) : 1,
        status: 'ASSIGNED',
      },
    });

    await prisma.salesOrder.update({
      where: { id: orderId },
      data: { status: 'READY_FOR_DELIVERY' },
    });

    return res.status(200).json({ success: true, delivery });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
