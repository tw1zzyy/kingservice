import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || (session.user as any).role !== "B2B_CUSTOMER") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const orders = await prisma.salesOrder.findMany({
      where: { customerId: customer.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(orders);
  } catch (error: any) {
    console.error("Orders fetch error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}
