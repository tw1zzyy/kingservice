import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { getProductPricesForCustomer } from "../../../lib/pricing";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || (session.user as any).role !== "B2B_CUSTOMER") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { items, notes, addressId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  try {
    // 1. Get Customer record
    const customer = await prisma.customer.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    // 2. Re-calculate prices server-side to ensure security
    const productIds = items.map((item: any) => item.productId);
    const prices = await getProductPricesForCustomer(customer.id, productIds);

    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const priceData = prices.find((p: any) => p.productId === item.productId);
      if (!priceData) {
        throw new Error(`Price not found for product ${item.productId}`);
      }

      const unitPrice = priceData.price.toNumber();
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: priceData.price,
        totalPrice: lineTotal,
      });
    }

    const taxRate = 0.21;
    const taxTotal = subtotal * taxRate;
    const totalAmount = subtotal + taxTotal;

    // 3. Create Order in Transaction
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: customer.id,
          addressId: addressId || null,
          status: "NEW",
          paymentMethod: "BANK_TRANSFER",
          paymentStatus: "PENDING",
          subtotal,
          taxTotal,
          totalAmount,
          notes,
          items: {
            create: orderItemsData,
          },
        },
      });

      // Update customer balance if applicable or just log it
      await tx.auditLog.create({
        data: {
          userId: (session.user as any).id,
          action: "ORDER_CREATED",
          entity: "SalesOrder",
          entityId: newOrder.id,
          details: `Order ${orderNumber} created via B2B portal.`,
        },
      });

      return newOrder;
    });

    return res.status(201).json(order);
  } catch (error: any) {
    console.error("Order submission error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}
