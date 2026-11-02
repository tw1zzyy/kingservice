import { useSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function PortalDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Head>
        <title>Customer Portal | KING SERVICE</title>
      </Head>

      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-zinc-950">
            KING SERVICE
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/portal" className="font-medium text-green-700">Dashboard</Link>
            <Link href="/portal/catalog" className="font-medium hover:text-green-700">Catalog</Link>
            <Link href="/portal/orders" className="font-medium hover:text-green-700">My Orders</Link>
          </div>
          <div>
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-zinc-600 hover:text-zinc-900 text-sm font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white border border-zinc-200 rounded-xl p-8 mb-8 shadow-sm">
          <h1 className="text-3xl font-bold text-zinc-950 mb-2">
            Welcome, {session?.user?.name || "Valued Customer"}
          </h1>
          <p className="text-zinc-500">
            Manage your wholesale orders, view individual price lists, and submit new supply requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/portal/catalog"
            className="bg-white border border-zinc-200 hover:border-green-700 transition rounded-xl p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl mb-4 block">📦</span>
              <h2 className="text-xl font-bold text-zinc-950 mb-2">Wholesale Product Catalog</h2>
              <p className="text-zinc-600">
                Browse products with your guaranteed individual customized pricing and place orders.
              </p>
            </div>
            <span className="text-green-700 font-semibold mt-6 block">Open Catalog →</span>
          </Link>

          <Link
            href="/portal/orders"
            className="bg-white border border-zinc-200 hover:border-green-700 transition rounded-xl p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl mb-4 block">📋</span>
              <h2 className="text-xl font-bold text-zinc-950 mb-2">Order History & Confirmations</h2>
              <p className="text-zinc-600">
                Track your active orders, view past invoices, and review price snapshots.
              </p>
            </div>
            <span className="text-green-700 font-semibold mt-6 block">View Orders →</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
