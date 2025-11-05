import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Calendar,
  Upload,
  MessageSquare,
  DollarSign,
  Clock,
  MapPin,
  User,
  Send,
  CheckCircle,
  Image as ImageIcon,
  ChevronRight,
  Phone,
  Mail,
  Trash2,
  Check,
  X as XIcon,
  Loader2,
  Eye,
} from "lucide-react";

/* ================= API base ================= */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/eventHub-backend";

/* small helper for JSON fetches */
async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include",
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}
/* small helper to list/create/update photos */
const PhotosAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchJSON(`/photos.php${q ? `?${q}` : ""}`);
  },
  upload: async (formData) => {
    const res = await fetch(`${API_BASE}/photos.php`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }
    return res.json();
  },
  update: (id, data) =>
    fetchJSON(`/photos.php/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id) =>
    fetchJSON(`/photos.php/${id}`, {
      method: "DELETE",
    }),
};

/* ================= Error Boundary ================= */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("PhotographerDashboard crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto p-6 mt-10 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-lg font-semibold text-red-700">
            Something went wrong
          </h2>
          <p className="text-sm text-red-600 mt-2">
            Check the console for details.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ================= Helpers ================= */
const formatCurrency = (n) =>
  (typeof n === "number" ? n : 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

const Badge = ({ children, tone }) => {
  const map = {
    info: "bg-blue-100 text-blue-800",
    warn: "bg-yellow-100 text-yellow-800",
    good: "bg-green-100 text-green-800",
    bad: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        map[tone] || map.gray
      }`}
    >
      {children}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, accent = "" }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export default function PhotographerDashboard() {
  const [activeTab, setActiveTab] = useState("chat"); // default

  // ======= Events / Revenue / Calendar (wire to your backend) =======
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    thisMonth: 0,
    pendingPayments: 0,
    completedJobs: 0,
    trend: [],
  });
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState({
    events: false,
    revenue: false,
    calendar: false,
  });

  useEffect(() => {
    // placeholders; wire to your own endpoints if needed
    // setLoading((s)=>({...s, events:true})); ...
  }, []);

  /* ===================== WhatsApp-style Chat ===================== */
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatText, setChatText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setConvLoading(true);
      try {
        const data = await fetchJSON("/photographer/conversations");
        setConversations(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0)
          setSelectedConvId(data[0].id);
      } catch (e) {
        console.warn("conversations fetch failed", e);
      } finally {
        setConvLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedConvId) return;
    let timer;
    const load = async () => {
      setMsgLoading(true);
      try {
        const data = await fetchJSON(
          `/photographer/conversations/${selectedConvId}/messages`
        );
        setMessages(Array.isArray(data) ? data : []);
        try {
          await fetchJSON(
            `/photographer/conversations/${selectedConvId}/read`,
            { method: "POST" }
          );
        } catch {}
      } catch (e) {
        console.warn("messages fetch failed", e);
      } finally {
        setMsgLoading(false);
      }
    };
    load();
    timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [selectedConvId]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, msgLoading]);

  const sendMessage = async () => {
    const text = chatText.trim();
    if (!text || !selectedConvId) return;
    setSending(true);
    try {
      await fetchJSON(
        `/photographer/conversations/${selectedConvId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
        }
      );
      setChatText("");
      const data = await fetchJSON(
        `/photographer/conversations/${selectedConvId}/messages`
      );
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("send message failed", e);
    } finally {
      setSending(false);
    }
  };

  /* ===================== GALLERY (photographer uploads) ===================== */
  // Replace this with the actual logged-in photographer id from auth
  const photographerId = Number(localStorage.getItem("photographer_id") || 1);

  const [myPhotos, setMyPhotos] = useState([]);
  const [galLoading, setGalLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]); // FileList
  const [caption, setCaption] = useState("");
  const [eventId, setEventId] = useState(""); // optional bind to events dropdown if you want

  const imageURL = (p) => (p?.startsWith("http") ? p : `${API_BASE}${p}`);

  const loadMyPhotos = useCallback(async () => {
    setGalLoading(true);
    try {
      const res = await PhotosAPI.list({ photographer_id: photographerId });
      const list = Array.isArray(res?.data) ? res.data : res;
      setMyPhotos(list || []);
    } catch (e) {
      console.warn("photos list failed", e);
      setMyPhotos([]);
    } finally {
      setGalLoading(false);
    }
  }, [photographerId]);

  useEffect(() => {
    loadMyPhotos();
  }, [loadMyPhotos]);

  const onPickFiles = (e) => {
    const f = Array.from(e.target.files || []).slice(0, 12); // cap batch
    setFiles(f);
  };

  const upload = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("photographer_id", String(photographerId));
      if (eventId) fd.append("event_id", String(eventId));
      if (caption) fd.append("caption", caption);
      files.forEach((f) => fd.append("images[]", f));

      await PhotosAPI.upload(fd);
      setFiles([]);
      setCaption("");
      await loadMyPhotos();
      alert("Uploaded! Waiting for admin approval.");
    } catch (e) {
      alert(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeMine = async (id) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await PhotosAPI.remove(id);
      await loadMyPhotos();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  const statusTone = (s) =>
    s === "approved" ? "good" : s === "rejected" ? "bad" : "warn";

  /* ===================== Tabs UI ===================== */
  const EventsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Assigned Photo Shoots
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Wire to your backend endpoint.
          </p>
        </div>
        <div className="divide-y">
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No events</p>
          </div>
        </div>
      </div>
    </div>
  );

  const GalleryTab = () => (
    <div className="space-y-6">
      {/* Uploader */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Send Photos to Admin
          </h3>
          <Badge tone="info">
            pending → admin approves → appears in Gallery
          </Badge>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption (optional)
              </label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Short caption"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* If you want to link to an Event, replace with a real dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event ID (optional)
              </label>
              <input
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="e.g. 12"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPickFiles}
                className="block w-full text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple images (try to keep each under ~2–4MB).
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {files.map((f, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-2 text-[10px] truncate">{f.name}</div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={upload}
              disabled={uploading || !files.length}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      </div>

      {/* My uploads */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            My Submissions
          </h3>
          <button
            onClick={loadMyPhotos}
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {galLoading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : myPhotos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            No uploads yet
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {myPhotos.map((p) => (
              <div key={p.id} className="rounded-lg border overflow-hidden">
                <div className="relative aspect-[4/3] bg-gray-100">
                  <img
                    src={imageURL(p.path)}
                    alt={p.caption || `photo-${p.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                  </div>
                </div>
                <div className="p-2 text-xs text-gray-700 space-y-1">
                  {p.caption && <div className="line-clamp-2">{p.caption}</div>}
                  {p.event_id && (
                    <div className="text-gray-500">Event #{p.event_id}</div>
                  )}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {p.status !== "approved" && (
                      <button
                        onClick={() => removeMine(p.id)}
                        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ChatTab = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 h-[70vh]">
        {/* conversations */}
        <aside className="border-r md:col-span-1 flex flex-col">
          <div className="p-4 border-b flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Chats</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="p-4 text-gray-500">Loading conversations…</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-gray-500 text-center">
                No conversations yet
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${
                    selectedConvId === c.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    {c?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">
                        {c.name || "Unknown"}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {c.updatedAt
                          ? new Date(c.updatedAt).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {c.lastMessage || ""}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* messages */}
        <section className="md:col-span-2 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                {conversations
                  .find((c) => c.id === selectedConvId)
                  ?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-medium">
                  {conversations.find((c) => c.id === selectedConvId)?.name ||
                    "Select a chat"}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedConvId ? "online" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Phone className="w-4 h-4" />
              <Mail className="w-4 h-4" />
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50"
          >
            {msgLoading && (
              <div className="text-center text-gray-500 py-4">
                Loading messages…
              </div>
            )}
            {!msgLoading && messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {selectedConvId
                  ? "No messages yet"
                  : "Pick a conversation on the left"}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id || m.createdAt}
                className={`mb-3 flex ${
                  m.sender === "photographer" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                    m.sender === "photographer"
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  <div>{m.text || m.message}</div>
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleTimeString()
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t flex items-center gap-2">
            <input
              type="text"
              disabled={!selectedConvId}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={
                selectedConvId
                  ? "Type a message"
                  : "Select a chat to start messaging"
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!selectedConvId || !chatText.trim() || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  const RevenueTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${formatCurrency(revenueData.totalRevenue)}`}
          icon={DollarSign}
          accent="bg-green-100 text-green-600"
        />
        <StatCard
          title="This Month"
          value={`$${formatCurrency(revenueData.thisMonth)}`}
          icon={Calendar}
          accent="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Pending Payments"
          value={`$${formatCurrency(revenueData.pendingPayments)}`}
          icon={Clock}
          accent="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Completed Jobs"
          value={formatCurrency(revenueData.completedJobs)}
          icon={CheckCircle}
          accent="bg-purple-100 text-purple-600"
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Revenue Trends
        </h3>
        <div className="text-gray-500">No revenue data</div>
      </div>
    </div>
  );

  const CalendarTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Schedule Calendar
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Event
          </button>
        </div>
        <div className="p-6">
          <div className="h-48 flex items-center justify-center text-gray-500">
            No calendar data
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {[
                { id: "events", label: "Assigned Events", icon: Calendar },
                { id: "gallery", label: "Photo Gallery", icon: ImageIcon },
                { id: "chat", label: "Client Chat", icon: MessageSquare },
                { id: "revenue", label: "Revenue", icon: DollarSign },
                { id: "calendar", label: "Schedule", icon: Calendar },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "events" && <EventsTab />}
          {activeTab === "gallery" && <GalleryTab />}
          {activeTab === "chat" && <ChatTab />}
          {activeTab === "revenue" && <RevenueTab />}
          {activeTab === "calendar" && <CalendarTab />}
        </main>
      </div>
    </ErrorBoundary>
  );
}
