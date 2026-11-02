import { prisma } from "../lib/prisma";
import Head from "next/head";

export default function EquipmentPage({ products }: { products: any[] }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Head>
        <title>Professional Catering Equipment | KING SERVICE</title>
      </Head>

      <header className="border-b border-zinc-200">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-zinc-950">KING SERVICE</a>
          <div className="flex gap-6">
            <a href="/catalog" className="hover:text-green-700">All Products</a>
            <a href="/equipment" className="font-semibold text-green-700">Equipment</a>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">Professional Catering Equipment</h1>
        <p className="text-zinc-600 mb-10 max-w-2xl">
          High-performance commercial kitchen machinery. We provide durable grills, ovens, and refrigeration equipment for professional kitchens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="border border-zinc-200 p-6 rounded-lg shadow-sm">
                <div className="aspect-square bg-zinc-100 mb-4 flex items-center justify-center rounded">
                   <span className="text-zinc-400">Product Image</span>
                </div>
                <h2 className="font-bold text-xl">{product.name}</h2>
                <p className="text-zinc-600 text-sm mt-2 line-clamp-2">{product.description}</p>
                <div className="mt-6 flex justify-between items-center">
                  <span className="font-bold text-2xl text-green-700">{Number(product.standardPrice).toLocaleString('cs-CZ')} CZK</span>
                </div>
                <button className="w-full mt-6 bg-zinc-900 text-white py-2 rounded font-medium hover:bg-zinc-800 transition">
                  Enquire Now
                </button>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center py-20 text-zinc-500">No equipment found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        slug: 'professional-catering-equipment'
      }
    },
    orderBy: { name: 'asc' },
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}
