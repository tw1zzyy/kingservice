import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateExcel } from '@/lib/excel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, categoryId, customerId, format } = req.query;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const orderWhere: any = {
      status: { not: 'CANCELLED' },
    };

    if (Object.keys(dateFilter).length > 0) {
      orderWhere.createdAt = dateFilter;
    }

    if (customerId) {
      orderWhere.customerId = customerId as string;
    }

    // Fetch orders matching filters
    const orders = await prisma.salesOrder.findMany({
      where: orderWhere,
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter items by category if provided
    let totalRevenue = 0;
    let totalCost = 0;
    const customerSalesMap: Record<string, { companyName: string; revenue: number; cost: number; orderCount: number }> = {};
    const productSalesMap: Record<string, { name: string; sku: string; categoryName: string; quantity: number; revenue: number; cost: number }> = {};
    const dailySalesMap: Record<string, { date: string; revenue: number; cost: number; orderCount: number }> = {};

    for (const order of orders) {
      const orderDateStr = order.createdAt.toISOString().split('T')[0];
      if (!dailySalesMap[orderDateStr]) {
        dailySalesMap[orderDateStr] = { date: orderDateStr, revenue: 0, cost: 0, orderCount: 0 };
      }
      dailySalesMap[orderDateStr].orderCount += 1;

      const custId = order.customerId;
      const custName = order.customer.companyName;
      if (!customerSalesMap[custId]) {
        customerSalesMap[custId] = { companyName: custName, revenue: 0, cost: 0, orderCount: 0 };
      }
      customerSalesMap[custId].orderCount += 1;

      for (const item of order.items) {
        if (categoryId && item.product.categoryId !== categoryId) {
          continue;
        }

        const itemRevenue = Number(item.totalPrice);
        const unitPurchasePrice = Number(item.product.purchasePrice || 0);
        const itemCost = unitPurchasePrice * item.quantity;

        totalRevenue += itemRevenue;
        totalCost += itemCost;

        // Daily map
        dailySalesMap[orderDateStr].revenue += itemRevenue;
        dailySalesMap[orderDateStr].cost += itemCost;

        // Customer map
        customerSalesMap[custId].revenue += itemRevenue;
        customerSalesMap[custId].cost += itemCost;

        // Product map
        const prodId = item.productId;
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = {
            name: item.product.name,
            sku: item.product.sku,
            categoryName: item.product.category?.name || 'Uncategorized',
            quantity: 0,
            revenue: 0,
            cost: 0,
          };
        }
        productSalesMap[prodId].quantity += item.quantity;
        productSalesMap[prodId].revenue += itemRevenue;
        productSalesMap[prodId].cost += itemCost;
      }
    }

    const grossProfit = totalRevenue - totalCost;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Outstanding Receivables
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE', 'PARTIALLY_PAID'] },
      },
      include: { customer: true },
    });

    const outstandingReceivables = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    const topCustomers = Object.values(customerSalesMap)
      .map((c) => ({
        ...c,
        grossProfit: c.revenue - c.cost,
        grossMargin: c.revenue > 0 ? ((c.revenue - c.cost) / c.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const bestSellingProducts = Object.values(productSalesMap)
      .map((p) => ({
        ...p,
        grossProfit: p.revenue - p.cost,
        grossMargin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const dailyTrends = Object.values(dailySalesMap)
      .map((d) => ({
        ...d,
        grossProfit: d.revenue - d.cost,
        grossMargin: d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue) * 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const responseData = {
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        grossMargin,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        outstandingReceivables,
      },
      dailyTrends,
      topCustomers,
      bestSellingProducts,
      unpaidInvoices: unpaidInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer.companyName,
        totalAmount: Number(inv.totalAmount),
        dueDate: inv.dueDate,
        status: inv.status,
      })),
    };

    // If Excel download requested
    if (format === 'excel') {
      const excelRows = bestSellingProducts.map((p) => ({
        SKU: p.sku,
        Název: p.name,
        Kategorie: p.categoryName,
        Prodané_Množství: p.quantity,
        Tržby_CZK: p.revenue,
        Nákupní_Náklady_CZK: p.cost,
        Hrubý_Zisk_CZK: p.grossProfit,
        Marže_Percent: `${p.grossMargin.toFixed(2)}%`,
      }));

      const buffer = generateExcel(excelRows, 'Financial_Analytics');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Financial_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
      return res.status(200).send(buffer);
    }

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
