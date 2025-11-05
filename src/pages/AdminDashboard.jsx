// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalIcon,
  Users,
  Image as ImageIcon,
  BarChart3,
  NotebookPen,
  Plus,
  Edit,
  Trash2,
  Save,
  X as XIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Activity,
  Search,
  Settings,
  Bell,
  Menu,
  // NEW for photo moderation
  Eye,
  Check,
  RefreshCcw,
} from "lucide-react";

/* -------------------------- API BASE (PHP) -------------------------- */
const BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/eventHub-backend";

const qs = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return q ? `?${q}` : "";
};

/* ------------------------------ FETCH UTIL ------------------------------ */
async function handle(fetchPromise) {
  const res = await fetchPromise;
  if (!res.ok) {
    let msg = "";
    try {
      msg = await res.text();
    } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  const parsed = ct.includes("application/json")
    ? await res.json()
    : await res.text();
  if (parsed && typeof parsed === "object" && "success" in parsed) {
    return parsed.data ?? parsed;
  }
  return parsed;
}

/* ------------------------- Public Category Set ------------------------- */
const PUBLIC_CATEGORIES = [
  "Social & Fun",
  "Music & Entertainment",
  "Corporate & Professional",
  "Sports & Outdoor",
  "Cultural & Artistic",
  "Food & Drink",
  "Wedding Events",
  "Funeral & Memorial",
];

/* ---------------------------------- API ---------------------------------- */
const API = {
  events: {
    list: (params = {}) => handle(fetch(`${BASE}/events.php${qs(params)}`)),
    create: (data) => {
      if (data?._files?.length || data?._file) {
        const fd = new FormData();
        const { _files = [], _file, images = [], ...rest } = data;
        Object.entries(rest).forEach(([k, v]) => {
          if (v != null) fd.append(k, v);
        });
        if (images.length) fd.append("images_json", JSON.stringify(images));
        const files = _files.length ? _files : _file ? [_file] : [];
        files.forEach((f) => fd.append("images[]", f));
        if (files[0]) fd.append("image", files[0]);
        return handle(
          fetch(`${BASE}/events.php`, { method: "POST", body: fd })
        );
      }
      const { _files, _file, ...body } = data || {};
      return handle(
        fetch(`${BASE}/events.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
    },
    update: (id, data) => {
      if (data?._files?.length || data?._file) {
        const fd = new FormData();
        const { _files = [], _file, images = [], ...rest } = data;
        Object.entries(rest).forEach(([k, v]) => {
          if (v != null) fd.append(k, v);
        });
        if (Array.isArray(images))
          fd.append("images_json", JSON.stringify(images));
        const files = _files.length ? _files : _file ? [_file] : [];
        files.forEach((f) => fd.append("images[]", f));
        if (files[0]) fd.append("image", files[0]);
        return handle(
          fetch(`${BASE}/events.php/${id}`, { method: "PUT", body: fd })
        );
      }
      const { _files, _file, ...body } = data || {};
      return handle(
        fetch(`${BASE}/events.php/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
    },
    remove: (id) =>
      handle(fetch(`${BASE}/events.php/${id}`, { method: "DELETE" })),
  },

  photographers: {
    list: (params = {}) =>
      handle(fetch(`${BASE}/photographers.php${qs(params)}`)),
    create: (data) => {
      if (data?._file) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (k === "_file") fd.append("avatar", v);
          else if (v != null) fd.append(k, v);
        });
        return handle(
          fetch(`${BASE}/photographers.php`, { method: "POST", body: fd })
        );
      }
      return handle(
        fetch(`${BASE}/photographers.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      );
    },
    update: (id, data) => {
      if (data?._file) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (k === "_file") fd.append("avatar", v);
          else if (v != null) fd.append(k, v);
        });
        return handle(
          fetch(`${BASE}/photographers.php/${id}`, { method: "PUT", body: fd })
        );
      }
      return handle(
        fetch(`${BASE}/photographers.php/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      );
    },
    remove: (id) =>
      handle(fetch(`${BASE}/photographers.php/${id}`, { method: "DELETE" })),
  },

  users: {
    list: (params = {}) => handle(fetch(`${BASE}/users.php${qs(params)}`)),
    remove: (id) =>
      handle(fetch(`${BASE}/users.php/${id}`, { method: "DELETE" })),
  },

  sales: {
    list: (params = {}) => handle(fetch(`${BASE}/sales.php${qs(params)}`)),
  },

  photos: {
    list: (params = {}) => handle(fetch(`${BASE}/photos.php${qs(params)}`)),
    update: (id, data) =>
      handle(
        fetch(`${BASE}/photos.php/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      ),
    remove: (id) =>
      handle(fetch(`${BASE}/photos.php/${id}`, { method: "DELETE" })),
  },
};

/* --------------------------------- Helpers --------------------------------- */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function classNames(...a) {
  return a.filter(Boolean).join(" ");
}
function toCSV(rows, headers) {
  const escape = (v) =>
    `"${String(v ?? "")
      .replaceAll('"', '""')
      .replaceAll("\n", " ")}"`;
  const headerLine = headers.map((h) => escape(h.label)).join(",");
  const lines = rows.map((r) =>
    headers
      .map((h) => escape(typeof h.get === "function" ? h.get(r) : r[h.key]))
      .join(",")
  );
  return [headerLine, ...lines].join("\n");
}
function download(name, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
const todayISO = () => new Date().toISOString().slice(0, 10);

function normalizeEventImages(ev) {
  let imgs = [];
  if (Array.isArray(ev.images)) imgs = ev.images;
  else if (ev.images_json) {
    try {
      const parsed = JSON.parse(ev.images_json);
      if (Array.isArray(parsed)) imgs = parsed;
    } catch {}
  }
  if (!imgs.length && ev.image) imgs = [ev.image];
  return imgs.map((p) => (p?.startsWith("http") ? p : `${BASE}${p}`));
}

/* ------------------------------- Main Layout ------------------------------- */
export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // overview
  const [dashEvents, setDashEvents] = useState([]);
  const [dashUsers, setDashUsers] = useState([]);
  const [dashSales, setDashSales] = useState([]);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setDashLoading(true);
      setDashError("");
      try {
        const [ev, us, sl] = await Promise.allSettled([
          API.events.list().catch(() => []),
          API.users.list().catch(() => []),
          API.sales.list().catch(() => []),
        ]);
        if (!cancelled) {
          const evArr =
            ev.status === "fulfilled"
              ? Array.isArray(ev.value)
                ? ev.value
                : ev.value?.data ?? []
              : [];
          setDashEvents(
            evArr.map((e) => ({ ...e, _imagesNorm: normalizeEventImages(e) }))
          );
          setDashUsers(
            us.status === "fulfilled" && Array.isArray(us.value) ? us.value : []
          );
          setDashSales(
            sl.status === "fulfilled" && Array.isArray(sl.value) ? sl.value : []
          );
        }
      } catch (e) {
        if (!cancelled) setDashError(e.message || "Failed to load overview");
      } finally {
        if (!cancelled) setDashLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "events", label: "Events", icon: CalIcon },
    { id: "photographers", label: "Photographers", icon: ImageIcon },
    { id: "users", label: "Users", icon: Users },
    { id: "sales", label: "Sales & Reports", icon: TrendingUp },
    { id: "calendar", label: "Calendar", icon: NotebookPen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={classNames(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CalIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">EventPro</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setSidebarOpen(false);
                }}
                className={classNames(
                  "w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-colors",
                  tab === t.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <t.icon className="w-5 h-5" />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@eventpro.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {tab === "dashboard" ? "Overview" : tab}
                </h1>
                <p className="text-sm text-gray-500">
                  {tab === "dashboard" &&
                    "Welcome back! Here's what's happening today."}
                  {tab === "events" && "Manage and monitor all events"}
                  {tab === "photographers" && "Manage photographer profiles"}
                  {tab === "users" && "View and manage user accounts"}
                  {tab === "sales" &&
                    "Track sales performance and generate reports"}
                  {tab === "calendar" && "Schedule and manage important dates"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {tab === "dashboard" && (
              <DashboardPanel
                events={dashEvents}
                users={dashUsers}
                sales={dashSales}
                loading={dashLoading}
                error={dashError}
              />
            )}
            {tab === "events" && <EventsPanel />}
            {tab === "photographers" && <PhotographersPanel />}
            {tab === "users" && <UsersPanel />}
            {tab === "sales" && <SalesPanel />}
            {tab === "calendar" && <CalendarPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ----------------------- Dashboard Overview ----------------------- */
function DashboardPanel({ events, users, sales, loading, error }) {
  const totalRevenue = useMemo(
    () => sales.reduce((a, b) => a + Number(b.amount || 0), 0),
    [sales]
  );
  const tickets = useMemo(
    () => sales.reduce((a, b) => a + Number(b.tickets || 0), 0),
    [sales]
  );

  const stats = [
    {
      label: "Total Events",
      value: loading ? "—" : String(events.length ?? 0),
      icon: CalIcon,
      color: "blue",
    },
    {
      label: "Users",
      value: loading ? "—" : (users.length ?? 0).toLocaleString(),
      icon: Users,
      color: "green",
    },
    {
      label: "Revenue",
      value: loading ? "—" : `Rs ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "purple",
    },
    {
      label: "Bookings",
      value: loading ? "—" : String(tickets ?? 0),
      icon: ShoppingCart,
      color: "orange",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div
                className={classNames(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  stat.color === "blue" && "bg-blue-50 text-blue-600",
                  stat.color === "green" && "bg-emerald-50 text-emerald-600",
                  stat.color === "purple" && "bg-purple-50 text-purple-600",
                  stat.color === "orange" && "bg-orange-50 text-orange-600"
                )}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-600">
                {stat.label}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {loading ? "Loading…" : "Up to date"}
              </div>
              {error && (
                <div className="text-xs text-red-500 mt-2">{error}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
          <p className="text-sm text-gray-500">Latest event registrations</p>
        </div>
        <div className="p-6">
          {loading && <div className="text-gray-500 text-sm">Loading…</div>}
          {!loading && events.length === 0 && (
            <div className="text-gray-500 text-sm">No events yet</div>
          )}
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id || uid()}
              className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {event._imagesNorm?.length ? (
                  <img
                    src={event._imagesNorm[0]}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {event.title || "Untitled"}
                </h4>
                <p className="text-sm text-gray-500">
                  {event.date || "—"} • {event.location || "—"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {(event.registered ?? 0).toString()} registered
                </div>
                <div className="text-xs text-gray-500">
                  {event.capacity
                    ? `${Math.round(
                        ((event.registered ?? 0) / event.capacity) * 100
                      )}% full`
                    : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Events Management ----------------------- */
function EventsPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cat, setCat] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const empty = {
    title: "",
    category: "",
    date: "",
    time: "",
    location: "",
    price: 0,
    capacity: 0,
    registered: 0,
    image: "",
    images: [],
    rating: 0,
    ratingsCount: 0,
    _file: null,
    _files: [],
  };
  const [draft, setDraft] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await API.events.list();
      const listRaw = Array.isArray(data) ? data : data?.data ?? [];
      const list = listRaw.map((ev) => {
        const imgs = normalizeEventImages(ev);
        const rawPaths = imgs.map((url) =>
          url.startsWith(BASE) ? url.replace(BASE, "") : url
        );
        return {
          ...ev,
          images: rawPaths.length ? rawPaths : ev.images || [],
          image: ev.image || rawPaths[0] || "",
          _imagesNorm: imgs,
        };
      });
      setRows(list);
    } catch (e) {
      setErr(e.message || "Failed to load events");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => ["all", ...PUBLIC_CATEGORIES], []);

  const filteredList = useMemo(() => {
    let filtered =
      cat === "all" ? rows : rows.filter((r) => r.category === cat);
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          (r.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.location || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [rows, cat, searchTerm]);

  const startNew = () => {
    setDraft({ ...empty, category: cat === "all" ? "" : cat });
    setShowForm(true);
  };
  const startEdit = (ev) => {
    setDraft({ ...ev, _file: null, _files: [] });
    setShowForm(true);
  };

  const save = async () => {
    if (!draft.title || !draft.date || !draft.time || !draft.location) {
      alert("Title, Date, Time, Location are required.");
      return;
    }
    const total = (draft.images?.length || 0) + (draft._files?.length || 0);
    if (total > 4) {
      alert("Please keep a maximum of 4 photos per event.");
      return;
    }
    try {
      setSaving(true);
      if (draft.id) await API.events.update(draft.id, draft);
      else await API.events.create(draft);
      setShowForm(false);
      setDraft(empty);
      await load();
    } catch (e) {
      alert(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await API.events.remove(id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Events Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? "Loading…" : `${filteredList.length} events found`}
              </p>
              {err && <p className="text-sm text-red-500 mt-1">{err}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={startNew}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" /> Add Event
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((id) => (
              <button
                key={id}
                onClick={() => setCat(id)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  id === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {id === "all" ? "All Events" : id}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-medium text-gray-600">
                  Event
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Category
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Date & Time
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Location
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Price
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Capacity
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Rating
                </th>
                <th className="text-left p-4 font-medium text-gray-600 w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filteredList.map((event) => {
                  const imgs = event._imagesNorm?.length
                    ? event._imagesNorm
                    : normalizeEventImages(event);
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Collage (up to 4) */}
                          <div className="w-16 h-16 grid grid-cols-2 grid-rows-2 gap-0.5 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {imgs.length ? (
                              imgs
                                .slice(0, 4)
                                .map((src, i) => (
                                  <img
                                    key={i}
                                    src={src}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                  />
                                ))
                            ) : (
                              <div className="col-span-2 row-span-2 w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {event.title || "Untitled"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {event.registered ?? 0}/{event.capacity ?? 0}{" "}
                              registered
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {event.category || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">
                          {event.date || "—"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.time || "—"}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {event.location || "—"}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {event.price != null
                          ? `Rs ${Number(event.price)}`
                          : "—"}
                      </td>
                      <td className="p-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                event.capacity
                                  ? Math.min(
                                      ((event.registered ?? 0) /
                                        event.capacity) *
                                        100,
                                      100
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {event.capacity
                            ? `${Math.round(
                                ((event.registered ?? 0) / event.capacity) * 100
                              )}% full`
                            : "—"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">
                            {event.rating || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({event.ratingsCount || 0})
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(event)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Edit event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => del(event.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filteredList.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <CalIcon className="w-8 h-8 mx-auto mb-2" />
                    </div>
                    <div className="text-gray-500">No events found</div>
                    <div className="text-sm text-gray-400">
                      Try adjusting your search or filters
                    </div>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={8} className="p-6 text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <EventFormModal
          event={draft}
          isEditing={Boolean(draft.id)}
          saving={saving}
          onSave={save}
          onCancel={() => {
            setShowForm(false);
            setDraft(empty);
          }}
          onChange={setDraft}
        />
      )}
    </>
  );
}

// ...and so on with the remaining sub-components (EventFormModal, PhotographersPanel, PhotographerFormModal, PhotoReviewModal, UsersPanel, SalesPanel, CalendarPanel).
/* ----------------------- Event Form Modal ----------------------- */
function EventFormModal({
  event,
  isEditing,
  saving = false,
  onSave,
  onCancel,
  onChange,
}) {
  const [previews, setPreviews] = useState([]);

  const displayImages = useMemo(() => {
    const existing = (event.images || []).map((p) =>
      p.startsWith("http") ? p : `${BASE}${p}`
    );
    return [...existing, ...previews].slice(0, 4);
  }, [event.images, previews]);

  const handleFilesPicked = (filesList) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;
    const canAdd =
      4 - (event.images?.length || 0) - (event._files?.length || 0);
    const toAdd = files.slice(0, canAdd);
    if (toAdd.length < files.length) {
      alert("Only up to 4 photos allowed per event.");
    }
    const blobURLs = toAdd.map((f) => URL.createObjectURL(f));
    setPreviews((old) => [...old, ...blobURLs]);
    onChange({ ...event, _files: [...(event._files || []), ...toAdd] });
  };

  const removeAt = (idx) => {
    const existingCount = event.images?.length || 0;
    if (idx < existingCount) {
      const imgs = [...event.images];
      imgs.splice(idx, 1);
      onChange({ ...event, images: imgs });
    } else {
      const newFiles = [...(event._files || [])];
      newFiles.splice(idx - existingCount, 1);
      onChange({ ...event, _files: newFiles });
      setPreviews((old) => {
        const copy = [...old];
        URL.revokeObjectURL(copy[idx - existingCount]);
        copy.splice(idx - existingCount, 1);
        return copy;
      });
    }
  };

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold">
              {isEditing ? "Edit Event" : "Create Event"}
            </h3>
            <button onClick={onCancel} disabled={saving}>
              <XIcon />
            </button>
          </div>
          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Image Grid */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Photos (up to 4)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {displayImages.length === 0 && (
                  <div className="col-span-2 sm:col-span-4 border-2 border-dashed rounded-xl h-28 flex items-center justify-center text-gray-400">
                    <ImageIcon />
                    <span>No photos yet</span>
                  </div>
                )}
                {displayImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl overflow-hidden border"
                  >
                    <img
                      src={src}
                      className="w-full h-28 object-cover"
                      alt=""
                    />
                    <button
                      onClick={() => removeAt(i)}
                      className="absolute top-1 right-1 bg-white p-1 rounded-full"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer">
                  <ImageIcon />
                  <span>
                    {event.images?.length || 0} existing ·{" "}
                    {event._files?.length || 0} new
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesPicked(e.target.files)}
                    className="hidden"
                    disabled={saving}
                  />
                </label>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each.
                </p>
              </div>
            </div>
            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) =>
                    onChange({ ...event, title: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-2"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={event.category}
                  onChange={(e) =>
                    onChange({ ...event, category: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-2"
                  disabled={saving}
                >
                  <option value="">Select category</option>
                  {PUBLIC_CATEGORIES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => onChange({ ...event, date: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time *</label>
                <input
                  type="time"
                  value={event.time}
                  onChange={(e) => onChange({ ...event, time: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2"
                  disabled={saving}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <input
                type="text"
                value={event.location}
                onChange={(e) =>
                  onChange({ ...event, location: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2"
                disabled={saving}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={event.price}
                  onChange={(e) =>
                    onChange({ ...event, price: Number(e.target.value) })
                  }
                  className="w-full border rounded-xl px-4 py-2"
                  min="0"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={event.capacity}
                  onChange={(e) =>
                    onChange({ ...event, capacity: Number(e.target.value) })
                  }
                  className="w-full border rounded-xl px-4 py-2"
                  min="0"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Registered
                </label>
                <input
                  type="number"
                  value={event.registered}
                  onChange={(e) =>
                    onChange({ ...event, registered: Number(e.target.value) })
                  }
                  className="w-full border rounded-xl px-4 py-2"
                  min="0"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t">
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4" />{" "}
              {saving ? "Saving…" : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Photographers Management ------------------- */
/* -------------------- Photographers Management ------------------- */
function PhotographersPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const empty = {
    id: "",
    name: "",
    email: "",
    phone: "",
    status: "active",
    avatar: "",
    _file: null,
  };
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState("");
  const [reviewFor, setReviewFor] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await API.photographers.list();
      setRows(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) {
      setErr(e.message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const startNew = () => {
    setDraft({ ...empty, id: uid() });
    setEditingId("NEW");
  };
  const startEdit = (r) => {
    setDraft({ ...r, _file: null });
    setEditingId(r.id);
  };
  const cancel = () => setEditingId("");

  const save = async () => {
    if (!draft.name || !draft.email) {
      alert("Name & email required");
      return;
    }
    try {
      if (editingId === "NEW") await API.photographers.create(draft);
      else await API.photographers.update(editingId, draft);
      cancel();
      load();
    } catch (e) {
      alert(e.message || "Failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete photographer?")) return;
    try {
      await API.photographers.remove(id);
      load();
    } catch (e) {
      alert(e.message || "Failed");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Photographers Management</h2>
            <p className="text-sm text-gray-500">
              {loading ? "Loading…" : `${filtered.length} found`}
            </p>
            {err && <p className="text-sm text-red-500">{err}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-xl"
              />
            </div>
            <button
              onClick={startNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4">Photographer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                          {p.avatar ? (
                            <img
                              src={
                                p.avatar.startsWith("http")
                                  ? p.avatar
                                  : `${BASE}${p.avatar}`
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              {p.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-gray-500">
                            Photographer
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>{p.email}</div>
                      <div className="text-gray-500">{p.phone}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={classNames(
                          "px-2 py-0.5 rounded-full text-xs",
                          p.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => setReviewFor(p)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"
                      >
                        <Eye />
                      </button>
                      <button
                        onClick={() => startEdit(p)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => del(p.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    No photographers found
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photographer Form Modal */}
      {editingId && (
        <PhotographerFormModal
          photographer={draft}
          isEditing={editingId !== "NEW"}
          onSave={save}
          onCancel={cancel}
          onChange={setDraft}
        />
      )}

      {/* Photo Review Modal */}
      {reviewFor && (
        <PhotoReviewModal
          photographer={reviewFor}
          onClose={() => setReviewFor(null)}
        />
      )}
    </>
  );
}

/* -------------------- Photographer Form Modal ------------------- */
function PhotographerFormModal({
  photographer,
  isEditing,
  onSave,
  onCancel,
  onChange,
}) {
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) onChange({ ...photographer, _file: file });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative flex items-center justify-center p-4 min-h-full">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isEditing ? "Edit Photographer" : "Add Photographer"}
            </h3>
            <button onClick={onCancel}>
              <XIcon />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                {photographer._file ? (
                  <div className="flex items-center justify-center h-full">
                    {photographer._file.name}
                  </div>
                ) : photographer.avatar ? (
                  <img
                    src={
                      photographer.avatar.startsWith("http")
                        ? photographer.avatar
                        : `${BASE}${photographer.avatar}`
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                    {photographer.name.charAt(0)}
                  </div>
                )}
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer">
                <ImageIcon />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatar}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm mb-1">Full Name *</label>
              <input
                type="text"
                value={photographer.name}
                onChange={(e) =>
                  onChange({ ...photographer, name: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email *</label>
              <input
                type="email"
                value={photographer.email}
                onChange={(e) =>
                  onChange({ ...photographer, email: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input
                type="tel"
                value={photographer.phone}
                onChange={(e) =>
                  onChange({ ...photographer, phone: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select
                value={photographer.status}
                onChange={(e) =>
                  onChange({ ...photographer, status: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="p-6 border-t flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 border rounded-xl">
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {isEditing ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Photo Review Modal ----------------------- */
function PhotoReviewModal({ photographer, onClose }) {
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const params =
        status === "all"
          ? { photographer_id: photographer.id }
          : { photographer_id: photographer.id, status };
      const data = await API.photos.list(params);
      setRows(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) {
      setErr(e.message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, photographer.id]);

  const updateStatus = async (id, s) => {
    try {
      await API.photos.update(id, { status: s });
      load();
    } catch (e) {
      alert(e.message || "Failed");
    }
  };
  const remove = async (id) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await API.photos.remove(id);
      load();
    } catch (e) {
      alert(e.message || "Failed");
    }
  };

  const srcOf = (p) =>
    p.path.startsWith("http") ? p.path : `${BASE}${p.path}`;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex items-center justify-center p-4 min-h-full">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                Photos by {photographer.name}
              </h3>
              <p className="text-sm text-gray-500">Review uploads</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border rounded-xl"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
              <button onClick={load} className="p-2 border rounded-lg">
                <RefreshCcw />
              </button>
              <button onClick={onClose} className="p-2">
                <XIcon />
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto">
            {err && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 rounded">
                {err}
              </div>
            )}
            {loading ? (
              <div>Loading…</div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16 text-gray-500 border border-dashed rounded">
                No photos.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {rows.map((p) => (
                  <div
                    key={p.id}
                    className="border rounded-lg overflow-hidden group"
                  >
                    <div className="aspect-[4/3] bg-gray-100">
                      <img
                        src={srcOf(p)}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="p-2 text-xs space-y-1">
                      {p.caption && (
                        <div className="line-clamp-2">{p.caption}</div>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <span
                          className={classNames(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium",
                            p.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : p.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                          )}
                        >
                          {p.status}
                        </span>
                        <div className="flex gap-1">
                          {p.status !== "approved" && (
                            <button
                              onClick={() => updateStatus(p.id, "approved")}
                              className="p-1 bg-green-50 rounded"
                            >
                              <Check />
                            </button>
                          )}
                          {p.status !== "rejected" && (
                            <button
                              onClick={() => updateStatus(p.id, "rejected")}
                              className="p-1 bg-yellow-50 rounded"
                            >
                              <XIcon />
                            </button>
                          )}
                          <button
                            onClick={() => remove(p.id)}
                            className="p-1 bg-red-50 rounded"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- Users Panel -------------------------- */
function UsersPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await API.users.list();
      setRows(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) {
      setErr(e.message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const del = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await API.users.remove(id);
      load();
    } catch (e) {
      alert(e.message || "Failed");
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Users Management</h2>
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${filtered.length} users`}
          </p>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-xl"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Join Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              filtered.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {u.avatar ? (
                        <img
                          src={
                            u.avatar.startsWith("http")
                              ? u.avatar
                              : `${BASE}${u.avatar}`
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {u.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {String(u.id).slice(0, 8)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-gray-50 rounded-full text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.joinDate
                      ? new Date(u.joinDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => del(u.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  No users found
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------ Sales & Reports ------------------------ */
function SalesPanel() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [range, setRange] = useState("daily");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await API.sales.list();
      setSales(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) {
      setErr(e.message || "Failed to load");
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const days = range === "daily" ? 1 : range === "weekly" ? 7 : 30;
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    return sales.filter((s) => {
      const d = new Date(s.date);
      return d >= new Date(start.toDateString()) && d <= now;
    });
  }, [sales, range]);

  const summary = useMemo(() => {
    const tickets = filtered.reduce((a, b) => a + Number(b.tickets || 0), 0);
    const amount = filtered.reduce((a, b) => a + Number(b.amount || 0), 0);
    const orders = filtered.length;
    return { tickets, amount, orders, avg: orders ? amount / orders : 0 };
  }, [filtered]);

  const downloadReport = () => {
    const headers = [
      { key: "date", label: "Date" },
      { key: "eventTitle", label: "Event" },
      { key: "tickets", label: "Tickets" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
    ];
    const csv = toCSV(filtered, headers);
    download(`sales_${range}_${todayISO()}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Sales & Reports</h2>
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : "Track performance"}
          </p>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 border rounded-xl"
          >
            <option value="daily">Last 24h</option>
            <option value="weekly">Last 7d</option>
            <option value="monthly">Last 30d</option>
          </select>
          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Widget
          icon={DollarSign}
          label="Total Revenue"
          value={`Rs ${summary.amount.toLocaleString()}`}
        />
        <Widget
          icon={ShoppingCart}
          label="Tickets Sold"
          value={summary.tickets}
        />
        <Widget icon={Activity} label="Total Orders" value={summary.orders} />
        <Widget
          icon={TrendingUp}
          label="Avg Order Value"
          value={`Rs ${summary.avg.toFixed(0)}`}
        />
      </div>
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4">Date</th>
                <th className="p-4">Event</th>
                <th className="p-4">Tickets</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filtered.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {s.date ? new Date(s.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4">
                      {s.eventTitle}
                      <div className="text-sm text-gray-500">
                        #{String(s.id).slice(0, 8)}
                      </div>
                    </td>
                    <td className="p-4">{s.tickets}</td>
                    <td className="p-4">
                      Rs {Number(s.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={classNames(
                          "px-2 py-0.5 rounded-full text-xs",
                          s.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : s.status === "pending"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        )}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    No data
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ Calendar & Notes (with Quick-Add Events) ------------------------- */
function CalendarPanel() {
  // month navigation
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() }; // m: 0-11
  });

  // notes (local)
  const [notes, setNotes] = useState({});
  const [editDate, setEditDate] = useState(""); // YYYY-MM-DD
  const [text, setText] = useState("");

  // events (from backend)
  const [allEvents, setAllEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(true);
  const [evErr, setEvErr] = useState("");

  // day modal
  const [dayOpen, setDayOpen] = useState(false);
  const [dayISO, setDayISO] = useState(""); // selected date
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState({
    title: "",
    time: "",
    location: "",
    category: "",
    price: 0,
    capacity: 0,
  });

  /* ---------------- local notes persistence ---------------- */
  useEffect(() => {
    const raw = localStorage.getItem("admin_notes");
    if (raw) setNotes(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("admin_notes", JSON.stringify(notes));
  }, [notes]);

  /* ---------------- events load ---------------- */
  const loadEvents = async () => {
    setEvLoading(true);
    setEvErr("");
    try {
      const data = await API.events.list().catch(() => []);
      const arr = Array.isArray(data) ? data : data?.data ?? [];
      setAllEvents(arr);
    } catch (e) {
      setEvErr(e.message || "Failed to load events");
      setAllEvents([]);
    } finally {
      setEvLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  /* ---------------- calendar helpers ---------------- */
  const first = new Date(current.y, current.m, 1);
  const startDay = first.getDay(); // 0 = Sun
  const daysInMonth = new Date(current.y, current.m + 1, 0).getDate();
  const monthName = new Date(current.y, current.m, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const weeks = [];
  let day = 1 - startDay;
  while (day <= daysInMonth) {
    const row = [];
    for (let i = 0; i < 7; i++) row.push(day++);
    weeks.push(row);
  }

  const today = new Date();
  const isToday = (d) =>
    d > 0 &&
    d <= daysInMonth &&
    current.y === today.getFullYear() &&
    current.m === today.getMonth() &&
    d === today.getDate();

  const fmt = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // get events for selected month/day (client-side filter is safest)
  const monthStartISO = fmt(current.y, current.m, 1);
  const monthEndISO = fmt(current.y, current.m, daysInMonth);

  const inMonthEvents = useMemo(() => {
    const start = new Date(monthStartISO);
    const end = new Date(monthEndISO);
    return allEvents.filter((e) => {
      const ds = e.date ? new Date(e.date) : null;
      return ds && ds >= start && ds <= end;
    });
  }, [allEvents, monthStartISO, monthEndISO]);

  // map YYYY-MM-DD -> count
  const dayEventCounts = useMemo(() => {
    const map = {};
    inMonthEvents.forEach((e) => {
      const d = e.date?.slice(0, 10);
      if (!d) return;
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [inMonthEvents]);

  const openDay = (d) => {
    if (d <= 0 || d > daysInMonth) return;
    const iso = fmt(current.y, current.m, d);
    setDayISO(iso);
    setDayOpen(true);
    setShowAdd(false);
    setDraft({
      title: "",
      time: "",
      location: "",
      category: "",
      price: 0,
      capacity: 0,
    });
  };

  const dayEvents = useMemo(
    () => inMonthEvents.filter((e) => e.date?.slice(0, 10) === dayISO),
    [inMonthEvents, dayISO]
  );

  const prev = () => {
    const m = current.m - 1;
    setCurrent({ y: m < 0 ? current.y - 1 : current.y, m: (m + 12) % 12 });
  };
  const next = () => {
    const m = current.m + 1;
    setCurrent({ y: m > 11 ? current.y + 1 : current.y, m: m % 12 });
  };

  /* ---------------- notes CRUD ---------------- */
  const openNote = (iso) => {
    setEditDate(iso);
    setText(notes[iso] || "");
  };
  const saveNote = () => {
    setNotes((n) => ({ ...n, [editDate]: text }));
    setEditDate("");
    setText("");
  };
  const clearNote = () => {
    setNotes((n) => {
      const c = { ...n };
      delete c[editDate];
      return c;
    });
    setEditDate("");
    setText("");
  };

  /* ---------------- quick-add event ---------------- */
  const saveEvent = async () => {
    if (!draft.title || !draft.time || !draft.location) {
      alert("Title, Time, and Location are required.");
      return;
    }
    try {
      setSaving(true);
      await API.events.create({
        title: draft.title,
        date: dayISO, // from clicked day
        time: draft.time,
        location: draft.location,
        category: draft.category,
        price: Number(draft.price || 0),
        capacity: Number(draft.capacity || 0),
        registered: 0,
        images: [],
      });
      await loadEvents();
      setShowAdd(false);
    } catch (e) {
      alert(e.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await API.events.remove(id);
      await loadEvents();
    } catch (e) {
      alert(e.message || "Failed to delete");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Calendar & Notes</h2>
            {evErr && <p className="text-sm text-red-600 mt-1">{evErr}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="p-2 border rounded-lg">
              <ChevronLeft />
            </button>
            <div className="px-4">{monthName}</div>
            <button onClick={next} className="p-2 border rounded-lg">
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center py-2 font-medium text-gray-600">
              {d}
            </div>
          ))}

          {weeks.map((row, i) =>
            row.map((d, j) => {
              const inMonth = d > 0 && d <= daysInMonth;
              const iso = inMonth ? fmt(current.y, current.m, d) : "";
              const hasNote = inMonth && notes[iso];
              const count = inMonth ? dayEventCounts[iso] || 0 : 0;
              const todayCell = isToday(d);

              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => openDay(d)}
                  disabled={!inMonth}
                  className={classNames(
                    "relative h-24 p-3 rounded-xl text-left transition",
                    inMonth
                      ? "bg-white border border-gray-200 hover:bg-blue-50"
                      : "bg-gray-50"
                  )}
                >
                  <div
                    className={classNames(
                      "font-medium",
                      todayCell
                        ? "text-blue-600"
                        : inMonth
                        ? "text-gray-900"
                        : "text-gray-400"
                    )}
                  >
                    {inMonth ? d : ""}
                  </div>

                  {/* event count badge */}
                  {inMonth && count > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {count}
                    </span>
                  )}

                  {/* note chip */}
                  {hasNote && (
                    <div className="mt-2 text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {notes[iso].slice(0, 22)}
                      {notes[iso].length > 22 ? "…" : ""}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {evLoading && (
          <div className="px-6 pb-6 text-sm text-gray-500">Loading events…</div>
        )}
      </div>

      {/* ---- Day Drawer / Modal ---- */}
      {dayOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDayOpen(false)}
          />
          <div className="relative bg-white w-full md:max-w-3xl md:rounded-2xl md:shadow-xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {new Date(dayISO).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-gray-500">
                  {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} ·{" "}
                  {notes[dayISO] ? "Note saved" : "No note"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openNote(dayISO)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  Edit Note
                </button>
                <button onClick={() => setDayOpen(false)} className="p-2">
                  <XIcon />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Add Event CTA */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Events on this day</h4>
                <button
                  onClick={() => setShowAdd((s) => !s)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                >
                  {showAdd ? "Close" : "Add Event"}
                </button>
              </div>

              {/* Add Event Form */}
              {showAdd && (
                <div className="border rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Title *</label>
                      <input
                        value={draft.title}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, title: e.target.value }))
                        }
                        className="w-full border rounded-xl px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Time *</label>
                      <input
                        type="time"
                        value={draft.time}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, time: e.target.value }))
                        }
                        className="w-full border rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Location *</label>
                    <input
                      value={draft.location}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, location: e.target.value }))
                      }
                      className="w-full border rounded-xl px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Category</label>
                      <select
                        value={draft.category}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, category: e.target.value }))
                        }
                        className="w-full border rounded-xl px-3 py-2"
                      >
                        <option value="">Select</option>
                        {PUBLIC_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Price</label>
                      <input
                        type="number"
                        min="0"
                        value={draft.price}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            price: Number(e.target.value || 0),
                          }))
                        }
                        className="w-full border rounded-xl px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Capacity</label>
                      <input
                        type="number"
                        min="0"
                        value={draft.capacity}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            capacity: Number(e.target.value || 0),
                          }))
                        }
                        className="w-full border rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAdd(false)}
                      className="px-3 py-2 border rounded-lg"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEvent}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg"
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Create Event"}
                    </button>
                  </div>
                </div>
              )}

              {/* List events */}
              {dayEvents.length === 0 ? (
                <div className="text-sm text-gray-500 border border-dashed rounded-lg p-6 text-center">
                  No events on this day.
                </div>
              ) : (
                <div className="space-y-3">
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      className="border rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {e.title || "Untitled"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {e.time || "—"} • {e.location || "—"}
                        </div>
                        {!!e.category && (
                          <div className="mt-1 text-xs px-2 py-0.5 bg-gray-100 rounded-full inline-block">
                            {e.category}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {e.price != null ? `Rs ${Number(e.price)}` : ""}
                        </span>
                        <button
                          onClick={() => deleteEvent(e.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- Note Modal ---- */}
      {editDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditDate("")}
          />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Add Note</h3>
                <p className="text-sm text-gray-500">
                  {new Date(editDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button onClick={() => setEditDate("")}>
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <textarea
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 resize-none"
                placeholder="Add your note..."
              />
            </div>
            <div className="p-6 border-t flex justify-between">
              {!!notes[editDate] && (
                <button
                  onClick={clearNote}
                  className="px-4 py-2 border rounded-xl text-red-600"
                >
                  Remove Note
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setEditDate("")}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ----------------------- Simple Widget ----------------------- */
function Widget({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center justify-between">
      <div className="w-12 h-12 bg-green-50 flex items-center justify-center rounded-xl">
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}
