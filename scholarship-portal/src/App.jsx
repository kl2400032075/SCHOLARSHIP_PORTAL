import React, { useEffect, useState } from "react";
import './App.css';

// Default export App component (single-file React + Tailwind UI)
// Assumptions: Tailwind is available. Replace fetch endpoints with your own API routes.

export default function App() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, []);

  async function fetchScholarships() {
    setLoading(true);
    setError(null);
    try {
      // change this URL to your real API or provide a static JSON file in public/
      const res = await fetch("/api/scholarships");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setScholarships(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
      // fallback: sample data so UI still works
      setScholarships([
        { id: 1, title: "Merit Scholarship", provider: "Govt", amount: 5000, deadline: "2025-12-31" },
        { id: 2, title: "STEM Excellence", provider: "University", amount: 10000, deadline: "2025-11-30" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function filtered() {
    const q = query.trim().toLowerCase();
    if (!q) return scholarships;
    return scholarships.filter((s) =>
      `${s.title} ${s.provider}`.toLowerCase().includes(q)
    );
  }

  function openDetails(item) {
    setSelected(item);
    setShowForm(false);
  }

  function openForm(item = null) {
    setSelected(item);
    setShowForm(true);
  }

  async function handleSave(formData) {
    // This is a simplified save handler. Replace with real POST/PUT.
    const isEdit = !!formData.id;
    if (isEdit) {
      setScholarships((prev) => prev.map((p) => (p.id === formData.id ? formData : p)));
    } else {
      formData.id = Date.now();
      setScholarships((prev) => [formData, ...prev]);
    }
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Scholarship Portal</h1>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scholarships or provider..."
            className="px-3 py-2 border rounded-md shadow-sm"
          />
          <button onClick={() => openForm()} className="px-4 py-2 rounded-md shadow bg-indigo-600 text-white">
            Add Scholarship
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading && <div className="mb-4">Loading...</div>}
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Title</th>
                <th className="px-4 py-3 text-left text-sm">Provider</th>
                <th className="px-4 py-3 text-left text-sm">Amount</th>
                <th className="px-4 py-3 text-left text-sm">Deadline</th>
                <th className="px-4 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered().map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{s.title}</td>
                  <td className="px-4 py-3">{s.provider}</td>
                  <td className="px-4 py-3">{s.amount}</td>
                  <td className="px-4 py-3">{s.deadline}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => openDetails(s)} className="text-sm underline">
                      View
                    </button>
                    <button onClick={() => openForm(s)} className="text-sm underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered().length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No scholarships found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Details / Right column */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {selected ? (
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">{selected.title}</h2>
                <p className="text-sm text-gray-600 mb-4">Provider: {selected.provider}</p>
                <p className="mb-2">Amount: {selected.amount}</p>
                <p className="mb-2">Deadline: {selected.deadline}</p>
                <div className="mt-4">
                  <button className="px-3 py-2 rounded border" onClick={() => alert('Apply flow here')}>
                    Apply
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-gray-500">Select a scholarship to see details.</div>
            )}
          </div>

          <aside>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Quick Stats</h3>
              <div className="text-sm text-gray-700">Total: {scholarships.length}</div>
              <div className="text-sm text-gray-700">Filtered: {filtered().length}</div>
            </div>
          </aside>
        </div>
      </main>

      {/* Form modal (simple) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow p-6">
            <ScholarshipForm initial={selected} onCancel={() => setShowForm(false)} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
}

function ScholarshipForm({ initial = null, onCancel, onSave }) {
  const [form, setForm] = useState(
    initial || { title: "", provider: "", amount: "", deadline: "" }
  );

  function change(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    // basic validation
    if (!form.title || !form.provider) return alert("Please add title and provider");
    onSave({ ...form, amount: Number(form.amount || 0) });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-lg font-semibold">{initial ? "Edit" : "Add"} Scholarship</h2>
      <div>
        <label className="block text-sm">Title</label>
        <input value={form.title} onChange={(e) => change("title", e.target.value)} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm">Provider</label>
        <input value={form.provider} onChange={(e) => change("provider", e.target.value)} className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm">Amount</label>
          <input value={form.amount} onChange={(e) => change("amount", e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Deadline</label>
          <input type="date" value={form.deadline} onChange={(e) => change("deadline", e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">
          Save
        </button>
      </div>
    </form>
  );
}
