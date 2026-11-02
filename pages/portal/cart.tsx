import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useCart, CartItem } from "../../hooks/useCart";
import { formatCurrency } from "../../lib/utils";
import { formatWhatsAppCartMessage, generateWhatsAppLink } from "../../lib/whatsapp";

export default function CartPage() {
  const { data: session } = useSession();
  const cart = useCart();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmitOrder = async () => {
    if (!session) {
      router.push("/auth/login?callbackUrl=/portal/cart");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit order");
      }

      setSuccess(true);
      cart.clearCart();
      setTimeout(() => {
        router.push("/portal/orders");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Head>
        <title>Shopping Cart | KING SERVICE</title>
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-zinc-950">
            KING SERVICE
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/portal" className="font-medium hover:text-green-700">Dashboard</Link>
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

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-950 mb-8">Wholesale Shopping Cart</h1>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-2">Order Submitted Successfully!</h2>
            <p className="text-zinc-600">Redirecting to your order history...</p>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
            <p className="text-zinc-500 text-lg mb-6">Your cart is currently empty.</p>
            <Link
              href="/portal/catalog"
              className="bg-green-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-800 transition"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.items.map((item: CartItem) => (
                <div key={item.productId} className="bg-white border border-zinc-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-semibold text-zinc-400">SKU: {item.sku}</span>
                    <h3 className="text-lg font-bold text-zinc-900">{item.name}</h3>
                    <p className="text-zinc-600 text-sm mt-1">{formatCurrency(item.unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-zinc-300 rounded-md">
                      <button
                        onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-zinc-100 text-zinc-600 font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-zinc-100 text-zinc-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-lg w-28 text-right">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                    <button
                      onClick={() => cart.removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 font-bold text-sm ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Delivery Instructions / Notes</label>
                <textarea
                  className="w-full border border-zinc-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional delivery notes or specific instructions..."
                />
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 h-fit shadow-sm">
              <h2 className="text-xl font-bold text-zinc-950 mb-6">Order Summary</h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-3 text-zinc-600 mb-6 border-b border-zinc-100 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal (excl. VAT)</span>
                  <span className="font-semibold text-zinc-900">{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (21%)</span>
                  <span className="font-semibold text-zinc-900">{formatCurrency(cart.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-zinc-955 pt-3 border-t border-zinc-100">
                  <span>Total Amount</span>
                  <span className="text-green-700">{formatCurrency(cart.total)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-md font-semibold transition disabled:opacity-50 text-center"
              >
                {submitting ? "Submitting Order..." : "Confirm & Submit Order"}
              </button>

              <a
                href={generateWhatsAppLink("", formatWhatsAppCartMessage({
                  customerName: session?.user?.name || "",
                  items: cart.items.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, sku: i.sku })),
                  subtotal: cart.subtotal,
                  taxTotal: cart.taxTotal,
                  totalAmount: cart.total,
                  notes: notes
                }))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-md font-semibold transition flex items-center justify-center gap-2"
              >
                <span>Share via WhatsApp 💬</span>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
