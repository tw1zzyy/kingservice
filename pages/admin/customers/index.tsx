import { AdminLayout } from '@/components/admin/AdminLayout';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Users, UserPlus, Tag, Edit2, Phone, Building2, Mail, CreditCard, ChevronRight } from 'lucide-react';

export default function AdminCustomers({ customers }: { customers: any[] }) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    ico: '',
    dic: '',
    creditLimit: '0',
    password: '', // Optional: if provided, a user account will be created
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({
          companyName: '',
          contactPerson: '',
          phone: '',
          email: '',
          ico: '',
          dic: '',
          creditLimit: '0',
          password: '',
        });
        router.reload();
      } else {
        const data = await res.json();
        alert(`Chyba: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Chyba: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Správa zákazníků</h1>
          <p className="text-sm text-slate-500">Velkoobchodní partneři, platební bilance a individuální ceníky</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <UserPlus size={18} /> {showAddForm ? 'Zrušit' : 'Nový zákazník'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-emerald-100 mb-10 transition-all animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Building2 size={20} className="text-emerald-600" /> Registrace nového velkoobchodního partnera
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Název firmy *</label>
                <input
                  required
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Např. THE BOSS KEBAB DĚČÍN"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Kontaktní osoba</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Jméno a příjmení"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Telefon *</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+420 000 000 000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="zakaznik@email.cz"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">IČO</label>
                <input
                  type="text"
                  value={formData.ico}
                  onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Kreditní limit (CZK)</label>
                <input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Heslo pro portál</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Vytvoří uživatelský účet"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? 'Vytvářím...' : 'Vytvořit partnera a uložit'} <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Zákazník / Firma</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kontakt</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bilance</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Akce</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      {customer.companyName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{customer.companyName}</div>
                      <div className="text-xs text-slate-400">IČO: {customer.ico || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {customer.email}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><Phone size={14} className="text-slate-400" /> {customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-slate-400" /> {Number(customer.currentBalance).toLocaleString()} CZK
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Limit: {Number(customer.creditLimit).toLocaleString()} CZK</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link
                    href={`/admin/customers/${customer.id}/prices`}
                    className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors font-bold text-xs"
                  >
                    <Tag size={14} /> Individuální ceník
                  </Link>
                  <button className="text-slate-400 hover:text-slate-900 p-1.5 hover:bg-slate-100 rounded-md transition-all">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const customers = await prisma.customer.findMany({
    orderBy: { companyName: 'asc' }
  });

  return {
    props: {
      customers: JSON.parse(JSON.stringify(customers))
    }
  };
}
