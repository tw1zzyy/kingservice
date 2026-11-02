import { prisma } from "../lib/prisma";
import Head from "next/head";

export default function CatalogPage({ products }: { products: any[] }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Head>
        <title>Product Catalog | KING SERVICE</title>
      </Head>

      <header className="border-b border-zinc-200">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-zinc-950">KING SERVICE</a>
          <a href="/catalog" className="font-semibold text-green-700">Catalog</a>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Product Catalog</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border border-zinc-200 p-4 rounded-lg">
              <h2 className="font-semibold text-lg">{product.name}</h2>
              <p className="text-zinc-600 text-sm mt-1">{product.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold text-green-700">{Number(product.standardPrice).toLocaleString('cs-CZ')} CZK</span>
                <span className="text-xs bg-zinc-100 px-2 py-1 rounded">{product.unitOfMeasure}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}
