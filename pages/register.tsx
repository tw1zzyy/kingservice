import Head from "next/head";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Head>
        <title>Become a Business Customer | KING SERVICE</title>
      </Head>

      <header className="border-b border-zinc-200">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-zinc-950">KING SERVICE</a>
        </nav>
      </header>

      <main className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Become a Business Customer</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input type="text" className="w-full border border-zinc-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IČO (Registration Number)</label>
            <input type="text" className="w-full border border-zinc-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border border-zinc-300 rounded-md p-2" />
          </div>
          <button type="submit" className="w-full bg-green-700 text-white p-3 rounded-md font-semibold hover:bg-green-800">
            Submit Registration
          </button>
        </form>
      </main>
    </div>
  );
}
