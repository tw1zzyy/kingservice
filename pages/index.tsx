import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Head>
        <title>KING SERVICE | Your Reliable Partner in Foodservice Supply</title>
      </Head>

      {/* Header */}
      <header className="border-b border-zinc-200">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-zinc-950">KING SERVICE</div>
          <div className="flex gap-6 font-medium">
            <a href="/catalog" className="hover:text-green-700">Catalog</a>
            <a href="/equipment" className="hover:text-green-700">Equipment</a>
            <a href="/about" className="hover:text-green-700">About Us</a>
            <a href="/contact" className="hover:text-green-700">Contact</a>
          </div>
          <div className="flex gap-4">
            <a href="/login" className="text-zinc-600 hover:text-zinc-900">Login</a>
            <a href="/register" className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800">Become a Customer</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <section className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            Your Reliable Partner in<br />
            <span className="text-green-700">Foodservice Supply</span>
          </h1>
          <p className="mt-6 text-xl text-zinc-600 max-w-2xl mx-auto">
            Complete wholesale supply solutions for restaurants, kebab shops, and pizzerias.
            Food ingredients, packaging, beverages, and professional equipment.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <a href="/catalog" className="bg-green-700 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-green-800">
              Explore Our Products
            </a>
            <a href="/contact" className="bg-zinc-100 text-zinc-900 px-8 py-4 rounded-md font-semibold text-lg hover:bg-zinc-200">
              Contact Wholesale Team
            </a>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="mt-24">
          <h2 className="text-3xl font-bold text-zinc-950 mb-10 text-center">Our Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Food Ingredients', desc: 'Premium ingredients for your kitchen' },
              { name: 'Packaging Supplies', desc: 'Durable packaging solutions' },
              { name: 'Professional Equipment', desc: 'High-quality catering machinery' },
            ].map((cat) => (
              <div key={cat.name} className="border border-zinc-200 p-8 rounded-lg hover:border-green-700 transition">
                <h3 className="text-xl font-semibold mb-2">{cat.name}</h3>
                <p className="text-zinc-600">{cat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-300 py-12 mt-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-lg font-semibold text-white">KING SERVICE</p>
          <p className="mt-2">+420 776 355 386 | kingservice@email.cz</p>
          <p className="mt-8 text-sm">© 2026 KING SERVICE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
