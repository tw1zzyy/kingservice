import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { companyName, ico, dic, contactPerson, phone, email, password, creditLimit } = req.body;

      if (!companyName || !email || !phone) {
        return res.status(400).json({ error: 'Company Name, Email, and Phone are required' });
      }

      let userId: string | undefined = undefined;

      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        const nameParts = (contactPerson || companyName).split(' ');
        const user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            firstName: nameParts[0] || 'Customer',
            lastName: nameParts.slice(1).join(' ') || 'User',
            role: 'B2B_CUSTOMER',
            phone,
          },
        });
        userId = user.id;
      }

      const customer = await prisma.customer.create({
        data: {
          companyName,
          ico,
          dic,
          contactPerson,
          phone,
          email,
          userId,
          creditLimit: creditLimit ? parseFloat(creditLimit) : 0,
        },
      });

      return res.status(201).json({ success: true, customer });
    } catch (error: any) {
      console.error('Customer create error:', error);
      return res.status(500).json({ error: error.message || 'Failed to create customer' });
    }
  }

  if (req.method === 'GET') {
    try {
      const customers = await prisma.customer.findMany({
        orderBy: { companyName: 'asc' },
      });
      return res.status(200).json(customers);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
