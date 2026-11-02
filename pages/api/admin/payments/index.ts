import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { invoiceId, amount, method, reference } = req.body;

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method: method || 'BANK_TRANSFER',
        reference,
        paidAt: new Date(),
      },
      include: {
        invoice: true,
      },
    });

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    await prisma.customer.update({
      where: { id: payment.invoice.customerId },
      data: {
        currentBalance: {
          decrement: amount,
        },
      },
    });

    return res.status(200).json({ success: true, payment });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
