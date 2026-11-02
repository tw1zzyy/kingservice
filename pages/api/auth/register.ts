import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { companyName, ico, dic, contactPerson, email, phone, password, street, city, postalCode } = req.body;

  if (!companyName || !email || !password || !phone || !street || !city || !postalCode) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: contactPerson.split(" ")[0] || contactPerson,
          lastName: contactPerson.split(" ").slice(1).join(" ") || "Customer",
          role: "B2B_CUSTOMER",
          phone,
        },
      });

      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          companyName,
          ico,
          dic,
          contactPerson,
          phone,
          email,
          creditLimit: 25000.00,
        },
      });

      await tx.customerAddress.create({
        data: {
          customerId: customer.id,
          street,
          city,
          postalCode,
          isDefault: true,
        },
      });

      return { user, customer };
    });

    return res.status(201).json({ message: "Registration successful", customerId: result.customer.id });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}
