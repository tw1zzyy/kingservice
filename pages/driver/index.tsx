import { prisma } from '@/lib/prisma';
import { useState } from 'react';
import { Truck, MapPin, Phone, CheckCircle, Navigation, DollarSign, FileText, Clock, User } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DriverDashboard({ deliveries, drivers }: { deliveries: any[], drivers: any[] }) {
  const router = useRouter();
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');

  const filteredDeliveries = deliveries.filter((d: any) => {
    if (selectedDriverId && d.driverId !== selectedDriverId) return false;
    if (activeTab === 'assigned') return d.status !== 'COMPLETED' && d.status !== 'FAILED';
    return d.status === 'COMPLETED' || d.status === 'FAILED';
  });

  const handleUpdateStatus = async (deliveryId: string, status: string, paymentMethod?: string) => {
    const res = await fetch(`/api/driver/deliveries/${deliveryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentMethod }),
    });

    if (res.ok) {
      router.reload();
    } else {
      alert('Chyba při aktualizaci stavu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* Mobile Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-emerald-400" size={24} />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">KING SERVICE</h1>
            <p className="text-xs text-slate-400">Mobilní terminál řidiče</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-slate-700 text-white text-xs border border-slate-600 rounded px-2 py-1.5 focus:outline-none"
          >
            {drivers.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.user.firstName} {d.user.lastName}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-800/50">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
            activeTab === 'assigned'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Aktivní zastávky ({deliveries.filter(d => d.driverId === selectedDriverId && d.status !== 'COMPLETED' && d.status !== 'FAILED').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
            activeTab === 'completed'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Dokončené
        </button>
      </div>

      {/* Deliveries List */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {filteredDeliveries.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-800/50 rounded-lg border border-slate-800">
            <CheckCircle className="mx-auto text-emerald-500 mb-2" size={36} />
            <p className="text-sm font-medium">Žádné dodávky v této sekci.</p>
          </div>
        ) : (
          filteredDeliveries.map((del: any) => {
            const address = del.order.address;
            const addressString = address ? `${address.street}, ${address.city}` : 'Adresa neuvedena';
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;

            return (
              <div key={del.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                {/* Header */}
                <div className="bg-slate-700/60 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-900 font-bold text-xs px-2 py-0.5 rounded">
                      #{del.stopOrder || 1}
                    </span>
                    <span className="text-sm font-bold text-white">{del.deliveryNumber}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    del.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                    del.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {del.status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white">{del.order.customer.companyName}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin size={14} className="text-emerald-400 shrink-0" />
                      {addressString}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${del.order.customer.phone}`}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone size={14} className="text-emerald-400" /> Zavolat ({del.order.customer.phone})
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Navigation size={14} /> Navigace
                    </a>
                  </div>

                  {/* Order Items summary */}
                  <div className="bg-slate-900/50 rounded-lg p-3 text-xs space-y-1 border border-slate-700/50">
                    <p className="font-semibold text-slate-300 mb-1">Položky objednávky ({del.order.items.length}):</p>
                    {del.order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-slate-400">
                        <span>{item.product.name} x {item.quantity} {item.product.unitOfMeasure}</span>
                        <span className="font-medium text-slate-200">{Number(item.totalPrice).toLocaleString()} CZK</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white mt-2">
                      <span>Celkem k úhradě ({del.order.paymentMethod}):</span>
                      <span className="text-emerald-400">{Number(del.order.totalAmount).toLocaleString()} CZK</span>
                    </div>
                  </div>

                  {address?.notes && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-xs text-amber-300">
                      <strong>Poznámka k doručení:</strong> {address.notes}
                    </div>
                  )}

                  {/* Actions */}
                  {del.status !== 'COMPLETED' && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {del.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(del.id, 'IN_PROGRESS')}
                          className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Zahájit doručování (Start)
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'COMPLETED', 'CASH')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <DollarSign size={14} /> Doručeno + Hotovost
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'COMPLETED', 'BANK_TRANSFER')}
                        className="bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <CheckCircle size={14} /> Doručeno (Faktura)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const [deliveries, drivers] = await Promise.all([
    prisma.delivery.findMany({
      include: {
        order: {
          include: {
            customer: true,
            address: true,
            items: {
              include: { product: true },
            },
          },
        },
        driver: {
          include: { user: true },
        },
      },
      orderBy: { stopOrder: 'asc' },
    }),
    prisma.driver.findMany({
      include: { user: true },
    }),
  ]);

  return {
    props: {
      deliveries: JSON.parse(JSON.stringify(deliveries)),
      drivers: JSON.parse(JSON.stringify(drivers)),
    },
  };
}
