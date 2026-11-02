import { AdminLayout } from '@/components/admin/AdminLayout';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard({ stats }: { stats: any }) {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Sales', value: formatCurrency(stats.totalSales), color: 'bg-emerald-500' },
          { title: 'Pending Orders', value: stats.pendingOrders, color: 'bg-amber-500' },
          { title: 'Active Customers', value: stats.activeCustomers, color: 'bg-blue-500' },
          { title: 'Low Stock Items', value: stats.lowStockItems, color: 'bg-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const [totalSales, pendingOrders, activeCustomers, lowStockItems] = await Promise.all([
    prisma.salesOrder.aggregate({ _sum: { totalAmount: true } }),
    prisma.salesOrder.count({ where: { status: 'NEW' } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.stock.count({ where: { quantity: { lte: 10 } } }),
  ]);

  return {
    props: {
      stats: {
        totalSales: totalSales._sum.totalAmount?.toNumber() || 0,
        pendingOrders,
        activeCustomers,
        lowStockItems,
      },
    },
  };
}
