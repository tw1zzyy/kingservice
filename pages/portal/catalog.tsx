import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../lib/utils";

export default function CatalogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const cart = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    cart.addToCart({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity: product.minOrderQty || 1,
      unitPrice: Number(product.resolvedPrice),
    });
    setAddedMessage(`Added ${product.name} to cart`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Head>
        <title>Wholesale Catalog | KING SERVICE</title>
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-zinc-950">
            KING SERVICE
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/portal" className="font-medium hover:text-green-700">Dashboard</Link>
            <Link href="/portal/catalog" className="font-medium text-green-700">Catalog</Link>
            <Link href="/portal/orders" className="font-medium hover:text-green-700">My Orders</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/portal/cart"
              className="bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-md font-medium flex items-center gap-2"
            >
              <span>🛒 Cart</span>
              <span className="bg-green-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {cart.count}
              </span>
            </Link>
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-zinc-600 hover:text-zinc-900 text-sm font-medium"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth/login" className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-950">Wholesale Product Catalog</h1>
            <p className="text-zinc-500 mt-1">
              {session ? "Showing your personalized individual wholesale prices." : "Please log in to see your individual custom prices."}
            </p>
          </div>
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search products or SKU..."
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {addedMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6 flex items-center justify-between">
            <span>{addedMessage}</span>
            <Link href="/portal/cart" className="underline font-semibold">View Cart</Link>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                      SKU: {product.sku}
                    </span>
                    {product.isCustom && (
                      <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                        Your Custom Price
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{product.name}</h3>
                  <p className="text-zinc-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                </div>

                <div className="border-t border-zinc-100 pt-4 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-zinc-950">
                      {formatCurrency(product.resolvedPrice)}
                    </span>
                    <span className="text-xs text-zinc-500 block">excl. VAT / {product.unitOfMeasure}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md font-semibold text-sm transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
