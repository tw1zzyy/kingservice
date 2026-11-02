import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    companyName: "",
    ico: "",
    dic: "",
    contactPerson: "",
    email: "",
    phone: "",
    password: "",
    street: "",
    city: "",
    postalCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      router.push("/auth/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <Head>
        <title>Become a Customer | KING SERVICE B2B</title>
      </Head>

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg border border-zinc-200 p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-zinc-950">
            KING SERVICE
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-900 mt-4">B2B Customer Registration</h1>
          <p className="text-zinc-500 text-sm mt-1">Apply for wholesale access and individual price lists</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Contact Person</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">IČO (Registration No.)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                value={form.ico}
                onChange={(e) => setForm({ ...form, ico: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">DIČ (VAT No.)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                value={form.dic}
                onChange={(e) => setForm({ ...form, dic: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Phone</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="border-t border-zinc-200 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Delivery Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md outline-none focus:ring-2 focus:ring-green-500"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-md font-semibold hover:bg-green-800 transition mt-6"
          >
            {loading ? "Submitting..." : "Register Business Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-green-700 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
