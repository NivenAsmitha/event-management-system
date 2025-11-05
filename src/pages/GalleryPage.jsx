// src/pages/GalleryPage.jsx
import React, { useEffect, useState } from "react";
import { Image as ImageIcon, RefreshCcw } from "lucide-react";
import bannerImg from "../assets/about us.jpg"; // if possible rename to about-us.jpg

// ✅ use the same env var everywhere
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/eventHub-backend";

// small helper to normalize backend responses
async function getApprovedPhotos() {
  const res = await fetch(`${API_BASE}/photos.php?status=approved`);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to fetch approved photos");
  }
  const json = await res.json();
  // backend returns { success, data: [...] } – but also allow raw arrays
  const rows = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : [];
  // normalize for UI
  return rows.map((p) => ({
    id: p.id,
    // path can be relative; make it absolute
    url:
      typeof p.path === "string" && p.path.startsWith("http")
        ? p.path
        : `${API_BASE}${p.path}`,
    title: p.caption || "Untitled",
    createdAt: p.approved_at || p.created_at, // show approved time if present
  }));
}

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const list = await getApprovedPhotos();
      setItems(list);
    } catch (e) {
      setErr(e?.message || "Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Banner */}
      <section
        className="relative h-72 md:h-80 overflow-hidden text-white"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full border border-white/25 mb-2">
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm font-medium">EventHub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold">Gallery</h1>
          <p className="text-blue-100 mt-2">
            Approved photos curated by Admin.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {loading ? "Loading…" : `${items.length} photos`}
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {err && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 mb-4">
            {err}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600">Loading gallery…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600">
              No photos yet. Once Admin approves uploads, they will appear here.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {items.map((p) => (
              <figure key={p.id} className="mb-4 break-inside-avoid">
                <img
                  onClick={() => setActive(p)}
                  src={p.url}
                  alt={p.title}
                  className="w-full rounded-xl shadow-sm hover:shadow-lg transition cursor-zoom-in"
                />
                <figcaption className="mt-2 text-sm text-gray-700">
                  {p.title} <span className="text-gray-400">•</span>{" "}
                  <span className="text-gray-500">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <img
            src={active.url}
            alt={active.title}
            className="max-h-[85vh] rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
