import { AdminLayout } from '@/components/admin/AdminLayout';
import { prisma } from '@/lib/prisma';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Save, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function CustomerPriceList({ customer, products, customerPrices }: any) {
  const router = useRouter();
  const [prices, setPrices] = useState(
    products.map((p: any) => ({
      ...p,
      customPrice: customerPrices.find((cp: any) => cp.productId === p.id)?.price || p.standardPrice,
      isChanged: false
    }))
  );
  const [saving, setSaving] = useState(false);

  const handlePriceChange = (productId: string, value: string) => {
    setPrices((prev: any[]) =>
      prev.map((p: any) =>
        p.id === productId ? { ...p, customPrice: value, isChanged: true } : p
      )
    );
  };

  const savePrices = async () => {
    setSaving(true);
    try {
      const changedPrices = prices
        .filter((p: any) => p.isChanged)
        .map((p: any) => ({
          productId: p.id,
          price: parseFloat(p.customPrice),
        }));

      if (changedPrices.length === 0) {
        alert('Žádné změny k uložení.');
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/customers/${customer.id}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: changedPrices }),
      });

      if (res.ok) {
        alert('Ceník byl úspěšně aktualizován.');
        router.reload();
      } else {
        const data = await res.json();
        alert(`Chyba: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Chyba: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/customers" className="hover:text-emerald-600 flex items-center gap-1">
              <ArrowLeft size={14} /> Zpět na zákazníky
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Individuální ceník: {customer.companyName}</h1>
          <p className="text-sm text-slate-500">Nastavte specifické ceny pro tohoto zákazníka. Pokud není nastavena, použije se standardní cena.</p>
        </div>
        <button
          onClick={savePrices}
          disabled={saving || !prices.some((p: any) => p.isChanged)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Ukládám...' : 'Uložit změny'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex items-start gap-3">
        <Info className="text-blue-600 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Jak to funguje?</p>
          <p>Změňte hodnotu v poli "Individuální cena". Jakmile kliknete na uložit, tyto ceny budou automaticky použity při vytváření objednávek pro tohoto zákazníka (v administraci i v zákaznickém portálu).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Produkt</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Standardní cena</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Individuální cena (CZK)</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prices.map((p: any) => {
              const isCustom = customerPrices.some((cp: any) => cp.productId === p.id);
              return (
                <tr key={p.id} className={p.isChanged ? "bg-emerald-50/30" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400 font-mono">SKU: {p.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {Number(p.standardPrice).toLocaleString()} CZK
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      value={p.customPrice}
                      onChange={(e) => handlePriceChange(p.id, e.target.value)}
                      className={`w-36 px-4 py-2 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                        p.isChanged ? "border-emerald-500 bg-white" : "border-gray-300"
                      }`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isCustom ? (
                      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                        Aktivní sleva
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                        Standardní
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  const customerPrices = await prisma.customerPrice.findMany({ where: { customerId: params.id } });

  if (!customer) {
    return { notFound: true };
  }

  return {
    props: {
      customer: JSON.parse(JSON.stringify(customer)),
      products: JSON.parse(JSON.stringify(products)),
      customerPrices: JSON.parse(JSON.stringify(customerPrices)),
    },
  };
}
