import { AdminLayout } from '@/components/admin/AdminLayout';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Download, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminInvoicesPage({ invoices, orders }: { invoices: any[], orders: any[] }) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState('');
  const [dueDateDays, setDueDateDays] = useState('14');

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const res = await fetch('/api/admin/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: selectedOrder,
        dueDateDays: parseInt(dueDateDays) || 14,
      }),
    });

    if (res.ok) {
      router.reload();
    } else {
      alert('Chyba při generování faktury');
    }
  };

  const handleRecordPayment = async (invoiceId: string, amount: number) => {
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId,
        amount,
        method: 'BANK_TRANSFER',
      }),
    });

    if (res.ok) {
      router.reload();
    } else {
      alert('Chyba při zaznamenání platby');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fakturace a správa plateb</h1>
          <p className="text-sm text-slate-500">Daňové doklady, dodací listy a sledování úhrad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Create Invoice Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-emerald-600" /> Vygenerovat fakturu z objednávki
          </h2>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Splatnost (dny)</label>
              <input
                type="number"
                value={dueDateDays}
                onChange={(e) => setDueDateDays(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-md text-sm transition-colors"
            >
              Vystavit daňový doklad
            </button>
          </form>
        </div>

        {/* Quick Ledger stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Celková fakturace</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0).toLocaleString()} CZK
              </p>
            </div>
            <span className="text-xs text-emerald-600 font-medium mt-4">Všechny vystavené faktury</span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Uhrazeno</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {invoices.filter(i => i.status === 'PAID').reduce((acc, inv) => acc + Number(inv.totalAmount), 0).toLocaleString()} CZK
              </p>
            </div>
            <span className="text-xs text-emerald-600 font-medium mt-4">Připsané platby</span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Po splatnosti / Čekající</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {invoices.filter(i => i.status !== 'PAID').reduce((acc, inv) => acc + Number(inv.totalAmount), 0).toLocaleString()} CZK
              </p>
            </div>
            <span className="text-xs text-amber-600 font-medium mt-4">Nezaplacené faktury</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Seznam faktur</h2>
          <span className="text-xs bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-full">
            {invoices.length} dokladů
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Číslo faktury</th>
                <th className="px-6 py-3">Zákazník</th>
                <th className="px-6 py-3">Vystaveno</th>
                <th className="px-6 py-3">Splatnost</th>
                <th className="px-6 py-3">Částka</th>
                <th className="px-6 py-3">Stav</th>
                <th className="px-6 py-3 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Žádné vystavené faktury.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">{inv.customer.companyName}</td>
                    <td className="px-6 py-4">{new Date(inv.createdAt).toLocaleDateString('cs-CZ')}</td>
                    <td className="px-6 py-4">{new Date(inv.dueDate).toLocaleDateString('cs-CZ')}</td>
                    <td className="px-6 py-4 font-semibold">{Number(inv.totalAmount).toLocaleString()} CZK</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/api/admin/invoices/${inv.id}/pdf`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded font-medium transition-colors"
                      >
                        <Download size={13} /> PDF
                      </Link>
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => handleRecordPayment(inv.id, Number(inv.totalAmount))}
                          className="inline-flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded font-medium transition-colors"
                        >
                          Zaslat úhradu
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const [invoices, orders] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        customer: true,
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.salesOrder.findMany({
      where: {
        status: { in: ['CONFIRMED', 'DELIVERED'] },
      },
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    props: {
      invoices: JSON.parse(JSON.stringify(invoices)),
      orders: JSON.parse(JSON.stringify(orders)),
    },
  };
}
