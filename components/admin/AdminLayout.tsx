import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Tag,
  Truck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Upload,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Price Lists', href: '/admin/price-lists', icon: Tag },
  { name: 'Deliveries', href: '/admin/deliveries', icon: Truck },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-emerald-500">KING</span> SERVICE
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Administration</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white w-full transition-colors">
            <Settings size={18} />
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-red-400 w-full transition-colors mt-1">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-800">
            {navItems.find(item => router.pathname === item.href)?.name || 'Admin Panel'}
          </h2>

          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">Super Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              AU
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
