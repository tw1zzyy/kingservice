import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { formatCurrency } from "../../lib/utils";
import { formatWhatsAppOrderConfirmation, generateWhatsAppLink } from "../../lib/whatsapp";

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Head>
        <title>Order History | KING SERVICE</title>
      </Head>

      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-zinc-950">
            KING SERVICE
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/portal" className="font-medium hover:text-green-700">Dashboard</Link>
            <Link href="/portal/catalog" className="font-medium hover:text-green-700">Catalog</Link>
            <Link href="/portal/orders" className="font-medium text-green-700">My Orders</Link>
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
        <h1 className="text-3xl font-bold text-zinc-950 mb-8">Order History & Confirmations</h1>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
            <p className="text-zinc-500 text-lg mb-6">You have not placed any orders yet.</p>
            <Link
              href="/portal/catalog"
              className="bg-green-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-800 transition"
            >
              Browse Catalog & Order
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-100 pb-4 mb-4 gap-4">
                  <div>
                    <span className="text-xs font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-zinc-500 ml-3">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {order.status}
                    </span>
                    <span className="font-extrabold text-lg text-zinc-950">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <a
                      href={generateWhatsAppLink("", formatWhatsAppOrderConfirmation({
                        orderNumber: order.orderNumber,
                        customerName: session?.user?.name || "Customer",
                        items: order.items.map((i: any) => ({
                          name: i.product.name,
                          quantity: i.quantity,
                          unitPrice: Number(i.unitPrice),
                          unitOfMeasure: i.product.unitOfMeasure
                        })),
                        subtotal: Number(order.subtotal),
                        taxTotal: Number(order.taxTotal),
                        totalAmount: Number(order.totalAmount),
                        deliveryDate: order.deliveryDate
                      }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1"
                    >
                      <span>Share Order 💬</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-zinc-700">Order Items (Snapshotted Prices):</h4>
                  <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="p-3 bg-zinc-50 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold text-zinc-900">{item.product.name}</span>
                          <span className="text-zinc-500 ml-2">({item.quantity} {item.product.unitOfMeasure})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-zinc-900">{formatCurrency(item.unitPrice)} each</span>
                          <span className="font-bold text-zinc-950 ml-4">{formatCurrency(item.totalPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.notes && (
                  <p className="text-xs text-zinc-500 mt-4 bg-zinc-50 p-3 rounded-md">
                    <strong>Delivery Notes:</strong> {order.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
