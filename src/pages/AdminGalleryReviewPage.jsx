import React, { useEffect, useState } from "react";
import { Check, X as XIcon, RefreshCw, Image as ImageIcon } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/eventHub-backend";

async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default function AdminGalleryReviewPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const img = (p) => (p?.startsWith("http") ? p : `${API_BASE}${p}`);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchJSON(`/photos.php?status=pending`);
      setRows(Array.isArray(r?.data) ? r.data : r);
    } catch (e) {
      alert(e.message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    try {
      await fetchJSON(`/photos.php/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      alert(e.message || "Failed to update");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Review Photos</h1>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-500 text-center py-16 border rounded-xl">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          No pending photos
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {rows.map((p) => (
            <div key={p.id} className="border rounded-lg overflow-hidden">
              <img
                src={img(p.path)}
                alt={p.caption || `photo-${p.id}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-2 text-xs">
                {p.caption && <div className="line-clamp-2">{p.caption}</div>}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => update(p.id, "rejected")}
                    className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                    title="Reject"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => update(p.id, "approved")}
                    className="p-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
