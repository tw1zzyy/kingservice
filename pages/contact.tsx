import Head from "next/head";
import { generateWhatsAppLink } from "../lib/whatsapp";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Head>
        <title>Contact Us | KING SERVICE</title>
      </Head>

      <header className="border-b border-zinc-200">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-zinc-950">KING SERVICE</a>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Wholesale Inquiries</h2>
            <p className="text-lg text-zinc-700">Phone / WhatsApp: +420 776 355 386</p>
            <p className="text-lg text-zinc-700">Email: kingservice@email.cz</p>

            <div className="pt-4">
              <a
                href={generateWhatsAppLink("420776355386", "Dobrý den, mám dotaz ohledně velkoobchodní nabídky KING SERVICE.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
              >
                <span>Napsat na WhatsApp 💬</span>
              </a>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Service Area</h2>
            <p className="text-lg text-zinc-700">Ústí nad Labem Region and surrounding areas, Czech Republic</p>
          </div>
        </div>
      </main>
    </div>
  );
}

