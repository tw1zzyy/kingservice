import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDFBuffer } from '@/lib/pdf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: String(id) },
      include: {
        customer: true,
        order: {
          include: {
            items: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).send('Invoice not found');
    }

    const pdfBuffer = await generateInvoicePDFBuffer(invoice as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Faktura-${invoice.invoiceNumber}.pdf`);
    return res.send(pdfBuffer);
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
}
