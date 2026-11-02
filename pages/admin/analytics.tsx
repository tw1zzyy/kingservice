import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import { Download, Calendar, Filter, TrendingUp, DollarSign, Users, Package, AlertCircle } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  useEffect(() => {
    fetchInitialOptions();
    fetchAnalytics();
  }, []);

  const fetchInitialOptions = async () => {
    try {
      const [resCat, resCust] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then(() => []), // we can load customers or categories
      ]);
      // Extract unique categories from products
      if (Array.isArray(resCat)) {
        const catMap = new Map();
        resCat.forEach((p: any) => {
          if (p.category) catMap.set(p.category.id, p.category.name);
        });
        setCategories(Array.from(catMap.entries()).map(([id, name]) => ({ id, name })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      if (selectedCategory) query.append('categoryId', selectedCategory);
      if (selectedCustomer) query.append('customerId', selectedCustomer);

      const res = await fetch(`/api/admin/analytics?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    if (selectedCategory) query.append('categoryId', selectedCategory);
    if (selectedCustomer) query.append('customerId', selectedCustomer);
    query.append('format', 'excel');

    window.open(`/api/admin/analytics?${query.toString()}`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Analytics & Business Intelligence</h1>
          <p className="text-sm text-slate-500">Comprehensive revenue, profitability, and receivables analysis</p>
        </div>

        <button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download size={16} /> Export to Excel (.xlsx)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm">
          <Filter size={16} className="text-emerald-600" /> Filter Options
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAnalytics}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading analytics data...</div>
      ) : !data ? (
        <div className="text-center py-20 text-slate-500">Failed to load analytics data.</div>
      ) : (
        <>
          {/* Summary KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Total Revenue</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={18} /></div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.summary.totalRevenue)}</p>
              <p className="text-xs text-slate-500 mt-2">{data.summary.totalOrders} total sales orders</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Gross Profit</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.summary.grossProfit)}</p>
              <p className="text-xs text-slate-500 mt-2">Gross Margin: <strong className="text-emerald-700">{data.summary.grossMargin.toFixed(2)}%</strong></p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Average Order Value</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Package size={18} /></div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.summary.averageOrderValue)}</p>
              <p className="text-xs text-slate-500 mt-2">Per confirmed order</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Outstanding Receivables</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle size={18} /></div>
              </div>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(data.summary.outstandingReceivables)}</p>
              <p className="text-xs text-slate-500 mt-2">Unpaid customer invoices</p>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Customers Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Users size={18} className="text-emerald-600" /> Top Customers by Revenue
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3 text-right">Orders</th>
                      <th className="px-5 py-3 text-right">Revenue</th>
                      <th className="px-5 py-3 text-right">Gross Profit</th>
                      <th className="px-5 py-3 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.topCustomers.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-500">No customer sales data</td></tr>
                    ) : (
                      data.topCustomers.map((cust: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-5 py-3.5 font-semibold text-slate-900">{cust.companyName}</td>
                          <td className="px-5 py-3.5 text-right font-mono">{cust.orderCount}</td>
                          <td className="px-5 py-3.5 text-right font-semibold">{formatCurrency(cust.revenue)}</td>
                          <td className="px-5 py-3.5 text-right text-emerald-600 font-semibold">{formatCurrency(cust.grossProfit)}</td>
                          <td className="px-5 py-3.5 text-right">{cust.grossMargin.toFixed(1)}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Best Selling Products Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Package size={18} className="text-emerald-600" /> Best-Selling Products
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3 text-right">Qty</th>
                      <th className="px-5 py-3 text-right">Revenue</th>
                      <th className="px-5 py-3 text-right">Gross Profit</th>
                      <th className="px-5 py-3 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.bestSellingProducts.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-500">No product sales data</td></tr>
                    ) : (
                      data.bestSellingProducts.map((prod: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            <div>{prod.name}</div>
                            <div className="text-xs text-slate-400 font-mono">SKU: {prod.sku}</div>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono">{prod.quantity}</td>
                          <td className="px-5 py-3.5 text-right font-semibold">{formatCurrency(prod.revenue)}</td>
                          <td className="px-5 py-3.5 text-right text-emerald-600 font-semibold">{formatCurrency(prod.grossProfit)}</td>
                          <td className="px-5 py-3.5 text-right">{prod.grossMargin.toFixed(1)}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Daily Sales Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" /> Daily Revenue & Gross Profit Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Orders</th>
                    <th className="px-6 py-3 text-right">Gross Revenue</th>
                    <th className="px-6 py-3 text-right">Purchasing Cost</th>
                    <th className="px-6 py-3 text-right">Gross Profit</th>
                    <th className="px-6 py-3 text-right">Gross Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.dailyTrends.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No daily sales trends recorded in this period</td></tr>
                  ) : (
                    data.dailyTrends.map((day: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-slate-900">{day.date}</td>
                        <td className="px-6 py-4 text-right font-mono">{day.orderCount}</td>
                        <td className="px-6 py-4 text-right font-semibold">{formatCurrency(day.revenue)}</td>
                        <td className="px-6 py-4 text-right text-slate-500">{formatCurrency(day.cost)}</td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-bold">{formatCurrency(day.grossProfit)}</td>
                        <td className="px-6 py-4 text-right font-medium">{day.grossMargin.toFixed(2)}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
