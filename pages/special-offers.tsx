import { prisma } from "../lib/prisma";
import Head from "next/head";

export default function SpecialOffersPage({ products }: { products: any[] }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Head>
        <title>Special Offers | KING SERVICE</title>
      </Head>

      <header className="border-b border-zinc-200">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-zinc-950">KING SERVICE</a>
          <div className="flex gap-6">
            <a href="/catalog" className="hover:text-green-700">Catalog</a>
            <a href="/special-offers" className="font-semibold text-green-700">Special Offers</a>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-950">Special Wholesale Offers</h1>
        <p className="text-zinc-600 mb-10 max-w-2xl">
          Limited time deals and bulk discounts for our business partners.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="border-2 border-green-100 p-4 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-700 text-white text-xs px-2 py-1 rounded-bl">PROMO</div>
                <h2 className="font-semibold text-lg">{product.name}</h2>
                <div className="mt-4">
                  <span className="text-sm text-zinc-400 line-through">{(Number(product.standardPrice) * 1.2).toLocaleString('cs-CZ')} CZK</span>
                  <div className="font-bold text-xl text-green-700">{Number(product.standardPrice).toLocaleString('cs-CZ')} CZK</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-20 bg-zinc-50 rounded-lg">
                <p className="text-zinc-500">Check back later for new offers!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  // In a real scenario, we might query PromotionalPrice table.
  // For now, we'll just show some products as "offers" or empty.
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 4,
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}
