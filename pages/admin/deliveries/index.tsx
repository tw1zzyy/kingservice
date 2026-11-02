import { AdminLayout } from '@/components/admin/AdminLayout';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { useState } from 'react';
import { Truck, Plus, CheckCircle, Clock, AlertTriangle, MapPin, Phone, User, Calendar, FileText } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminDeliveriesPage({ deliveries, drivers, orders }: { deliveries: any[], drivers: any[], orders: any[] }) {
  const router = useRouter();
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [stopOrder, setStopOrder] = useState('1');

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedDriver) return;

    const res = await fetch('/api/admin/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: selectedOrder,
        driverId: selectedDriver,
        scheduledDate,
        stopOrder: parseInt(stopOrder) || 1,
      }),
    });

    if (res.ok) {
      router.reload();
    } else {
      alert('Chyba při přiřazování dodávky');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Správa rozvozů a dopravy</h1>
          <p className="text-sm text-slate-500">Přiřazování objednávek řidičům a sledování tras</p>
        </div>
        <Link
          href="/driver"
          target="_blank"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
        >
          <Truck size={16} /> Otevřít řidičský terminál
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assign Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-emerald-600" /> Naplánovat rozvoz
          </h2>

          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Objednávka</label>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Vyberte objednávku...</option>
                {orders.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customer.companyName} ({Number(o.totalAmount).toLocaleString()} CZK)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Řidič</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Vyberte řidiče...</option>
                {drivers.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.user.firstName} {d.user.lastName} ({d.vehicle || 'Bez vozidla'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Datum rozvozu</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pořadí zastávky (Stop #)</label>
              <input
                type="number"
                value={stopOrder}
                onChange={(e) => setStopOrder(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-md text-sm transition-colors"
            >
              Přiřadit řidiči
            </button>
          </form>
        </div>

        {/* Deliveries List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Aktivní rozvozy</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full">
              {deliveries.length} naplánováno
            </span>
          </div>

          <div className="divide-y divide-gray-200">
            {deliveries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Žádné naplánované rozvozy.</div>
            ) : (
              deliveries.map((del: any) => (
                <div key={del.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{del.deliveryNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        del.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        del.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {del.status}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Zastávka #{del.stopOrder || 1}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {del.order.customer.companyName}
                    </p>

                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {del.order.address ? `${del.order.address.street}, ${del.order.address.city}` : 'Adresa neuvedena'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                      <User size={12} /> {del.driver ? `${del.driver.user.firstName} ${del.driver.user.lastName}` : 'Nepřiřazeno'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 justify-end mt-1">
                      <Calendar size={12} /> {del.scheduledDate ? new Date(del.scheduledDate).toLocaleDateString('cs-CZ') : 'Dnes'}
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {Number(del.order.totalAmount).toLocaleString()} CZK
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const [deliveries, drivers, orders] = await Promise.all([
    prisma.delivery.findMany({
      include: {
        order: {
          include: {
            customer: true,
            address: true,
          },
        },
        driver: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    }),
    prisma.driver.findMany({
      include: {
        user: true,
      },
    }),
    prisma.salesOrder.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY'] },
      },
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    props: {
      deliveries: JSON.parse(JSON.stringify(deliveries)),
      drivers: JSON.parse(JSON.stringify(drivers)),
      orders: JSON.parse(JSON.stringify(orders)),
    },
  };
}
