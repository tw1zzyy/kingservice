import { AdminLayout } from '@/components/admin/AdminLayout';
import { prisma } from '@/lib/prisma';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Plus, Trash2, CheckCircle, User, ArrowRight } from 'lucide-react';

export default function ManualOrder({ customers, products }: any) {
  const router = useRouter();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomerId(e.target.value);
    setItems([]);
  };

  const addProduct = async (product: any) => {
    if (!selectedCustomerId) {
      alert('Prosím, nejprve vyberte zákazníka pro načtení jeho individuálního ceníku.');
      return;
    }

    setLoadingPrice(true);
    try {
      const res = await fetch(`/api/products`);
      // We can fetch prices for specific product for customer
      const existingIdx = items.findIndex((i) => i.productId === product.id);

      if (existingIdx >= 0) {
        const updated = [...items];
        updated[existingIdx].quantity += 1;
        updated[existingIdx].totalPrice = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
        setItems(updated);
      } else {
        // Get customer custom price from product or API
        const custRes = await fetch(`/api/products`);
        const allProds = await custRes.json();
        const found = allProds.find((p: any) => p.id === product.id);
        const unitPrice = found ? Number(found.resolvedPrice) : Number(product.standardPrice);

        setItems([
          ...items,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            unitOfMeasure: product.unitOfMeasure,
            unitPrice,
            quantity: 1,
            totalPrice: unitPrice,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrice(false);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxTotal = subtotal * 0.21;
  const totalAmount = subtotal + taxTotal;

  const handleSubmitOrder = async () => {
    if (!selectedCustomerId) {
      alert('Vyberte zákazníka');
      return;
    }
    if (items.length === 0) {
      alert('Přidejte alespoň jednu položku do objednávky');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items,
          notes,
        }),
      });

      if (res.ok) {
        alert('Objednávka byla úspěšně vytvořena a potvrditena!');
        router.push('/admin/deliveries');
      } else {
        const data = await res.json();
        alert(`Chyba při vytváření objednávky: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Chyba: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nová objednávka (Administrace)</h1>
          <p className="text-sm text-slate-500">Ruční zadání objednávky s automatickým načtením individuálního ceníku</p>
        </div>
      </div>

      {/* Customer Selection Header */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <User size={18} className="text-emerald-600" /> Vyberte velkoobchodního zákazníka
        </label>
        <select
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium bg-white"
        >
          <option value="">-- Vyberte zákazníka --</option>
          {customers.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.companyName} ({c.contactPerson || c.phone})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Catalog Side */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-emerald-600" /> Katalog produktů
          </h2>
          <div className="space-y-3">
            {products.map((p: any) => (
              <div
                key={p.id}
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 transition-colors shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-slate-400">SKU: {p.sku}</span>
                  <h3 className="font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500">{p.category?.name} • Standard: {formatCurrency(p.standardPrice)}</p>
                </div>
                <button
                  onClick={() => addProduct(p)}
                  disabled={!selectedCustomerId || loadingPrice}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Plus size={14} /> Přidat
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Order Summary Side */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600" /> Obsah objednávky
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            {items.length === 0 ? (
              <p className="text-slate-400 text-center py-12">Žádné položky v objednávce. Vyberte zákazníka a přidejte produkty.</p>
            ) : (
              <div>
                <div className="divide-y divide-gray-100 mb-6">
                  {items.map((item, i) => (
                    <div key={i} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        <p className="text-xs text-emerald-600 font-medium">Cena: {formatCurrency(item.unitPrice)} / {item.unitOfMeasure}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          className="w-16 p-1.5 border border-gray-300 rounded text-center text-sm font-semibold"
                        />
                        <span className="font-bold text-sm w-24 text-right">{formatCurrency(item.totalPrice)}</span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Poznámka k doručení</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={2}
                    placeholder="Instrukce pro řidiče..."
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-slate-600 mb-6">
                  <div className="flex justify-between">
                    <span>Mezisoučet (bez DPH)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DPH (21%)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(taxTotal)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-gray-100">
                    <span>Celkem k úhradě</span>
                    <span className="text-emerald-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? 'Vytváření objednávky...' : 'Potvrdit a Vytvořit Objednávku'} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { companyName: 'asc' } }),
    prisma.product.findMany({ include: { category: true }, orderBy: { name: 'asc' } }),
  ]);

  return {
    props: {
      customers: JSON.parse(JSON.stringify(customers)),
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}
