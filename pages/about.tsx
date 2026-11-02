import Head from "next/head";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Head>
        <title>About Us | KING SERVICE</title>
      </Head>

      <header className="border-b border-zinc-200">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-zinc-950">KING SERVICE</a>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">About KING SERVICE</h1>
        <div className="prose max-w-none text-zinc-700">
          <p>
            KING SERVICE is a professional wholesale supplier focused on providing high-quality solutions for restaurants, kebab shops, pizzerias, and foodservice establishments.
          </p>
          <p>
            We pride ourselves on our reliable regional distribution, competitive pricing, and individual approach to every customer. We believe that a strong partnership is the foundation of every successful business.
          </p>
        </div>
      </main>
    </div>
  );
}
