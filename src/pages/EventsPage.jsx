import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Calendar,
  Music,
  Briefcase,
  Heart,
  Gamepad2,
  Palette,
  UtensilsCrossed,
  Church,
  PartyPopper,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// rename the file to avoid spaces if you can: about-us.jpg
import banner from "../assets/about us.jpg";

/* -------------------------- API BASE (PHP) -------------------------- */
const BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/eventHub-backend";

/* Small fetch helper that handles { success, data } or plain arrays */
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

/* ------------------------ Public Category Model ------------------------ */
const CATEGORIES = [
  { id: "all", name: "All Events", icon: Calendar },
  { id: "social-fun", name: "Social & Fun", icon: PartyPopper },
  { id: "music-entertainment", name: "Music & Entertainment", icon: Music },
  {
    id: "corporate-professional",
    name: "Corporate & Professional",
    icon: Briefcase,
  },
  { id: "sports-outdoor", name: "Sports & Outdoor", icon: Gamepad2 },
  { id: "cultural-artistic", name: "Cultural & Artistic", icon: Palette },
  { id: "food-drink", name: "Food & Drink", icon: UtensilsCrossed },
  { id: "wedding", name: "Wedding Events", icon: Heart },
  { id: "funeral-memorial", name: "Funeral & Memorial", icon: Church },
];

/* Map backend names → your public slug IDs */
const NAME_TO_SLUG = {
  "Social & Fun": "social-fun",
  "Music & Entertainment": "music-entertainment",
  "Corporate & Professional": "corporate-professional",
  "Sports & Outdoor": "sports-outdoor",
  "Cultural & Artistic": "cultural-artistic",
  "Food & Drink": "food-drink",
  "Wedding Events": "wedding",
  "Funeral & Memorial": "funeral-memorial",
};
const toSlug = (backendName = "") =>
  NAME_TO_SLUG[backendName] || backendName.toLowerCase();

const cx = (...a) => a.filter(Boolean).join(" ");

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  // Prevent page scroll when modal is open
  useEffect(() => {
    if (selectedEvent) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedEvent]);

  // Keyboard navigation in modal
  const onKeyDown = useCallback(
    (e) => {
      if (!selectedEvent) return;
      if (e.key === "Escape") setSelectedEvent(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    },
    [selectedEvent]
  );

  useEffect(() => {
    if (!selectedEvent) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedEvent, onKeyDown]);

  // Load events from PHP backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await handle(fetch(`${BASE}/events.php`));
        const list = Array.isArray(data) ? data : data?.data ?? [];

        const normalized = list.map((e) => {
          // images (absolute). Prefer e.images; fallback to single e.image.
          const rawImgs =
            Array.isArray(e.images) && e.images.length
              ? e.images.filter(Boolean)
              : e.image
              ? [e.image]
              : [];
          const absoluteImgs = rawImgs.map((p) =>
            p?.startsWith("http") ? p : `${BASE}${p}`
          );

          return {
            ...e,
            _cat: toSlug(e.category || ""),
            _img: absoluteImgs[0] || "",
            _imgs: absoluteImgs,
            price: Number(e.price ?? 0),
            capacity: Number(e.capacity ?? 0),
            registered: Number(e.registered ?? 0),
            rating: Number(e.rating ?? 0),
            ratingsCount: Number(e.ratingsCount ?? 0),
          };
        });

        if (!cancelled) setEvents(normalized);
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || "Failed to load events");
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    if (selectedCategory === "all") return events;
    return events.filter((e) => e._cat === selectedCategory);
  }, [events, selectedCategory]);

  const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || id;

  const openEvent = (e) => {
    setSelectedEvent(e);
    setGalleryIdx(0);
  };

  const prev = () => {
    if (!selectedEvent) return;
    const imgs = selectedEvent._imgs || [];
    if (!imgs.length) return;
    setGalleryIdx((i) => (i - 1 + imgs.length) % imgs.length);
  };

  const next = () => {
    if (!selectedEvent) return;
    const imgs = selectedEvent._imgs || [];
    if (!imgs.length) return;
    setGalleryIdx((i) => (i + 1) % imgs.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative h-[32rem] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${banner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/70" />
        <div className="relative h-full flex items-center justify-center text-center text-white px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing Events
            </h1>
            <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto">
              Find and join the most exciting events happening around you
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find events that match your interests
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cx(
                  "flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200",
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                )}
              >
                <category.icon className="h-5 w-5" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Event Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedCategory === "all"
                ? "All Events"
                : `${catName(selectedCategory)} Events`}
            </h2>
            <p className="text-gray-600">
              {list.length} {list.length === 1 ? "event" : "events"} found
            </p>
          </div>

          {err && (
            <div className="mb-8 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {err}
            </div>
          )}

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((e) => (
                <div
                  key={e.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <button
                    onClick={() => openEvent(e)}
                    className="w-full text-left"
                  >
                    <div className="h-56 bg-gray-100 relative overflow-hidden">
                      {e._img ? (
                        <img
                          src={e._img}
                          alt={e.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                        <span className="text-xs font-medium text-gray-800">
                          {catName(e._cat)}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {e.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{e.location}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{e.date}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{e.time}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm font-medium text-blue-600">
                          Rs {Number(e.price || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">
                            {e.rating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({e.ratingsCount || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}

              {list.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-gray-400 mb-4">
                      <Calendar className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No events found
                    </h3>
                    <p className="text-gray-600">
                      There are currently no events in this category. Check back
                      later!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* --- Gallery Modal --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Close */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-gray-900 transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 overflow-auto">
              <div className="grid lg:grid-cols-2">
                {/* Left: Gallery */}
                <div className="relative bg-gray-900">
                  {/* Main image */}
                  <div className="aspect-[4/3] w-full flex items-center justify-center bg-black">
                    {selectedEvent._imgs && selectedEvent._imgs.length > 0 ? (
                      <img
                        src={selectedEvent._imgs[galleryIdx]}
                        alt={`${selectedEvent.title} - ${galleryIdx + 1}`}
                        className="max-h-[32rem] w-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Arrows */}
                  {selectedEvent._imgs && selectedEvent._imgs.length > 1 && (
                    <>
                      <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-md text-gray-800 z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-md text-gray-800 z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Thumbnails */}
                  {selectedEvent._imgs && selectedEvent._imgs.length > 1 && (
                    <div className="flex gap-3 p-4 bg-gray-900/80 overflow-x-auto">
                      {selectedEvent._imgs.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => setGalleryIdx(i)}
                          className={cx(
                            "h-20 w-28 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                            i === galleryIdx
                              ? "border-blue-400 scale-105"
                              : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                          )}
                          aria-label={`Show image ${i + 1}`}
                        >
                          <img
                            src={src}
                            alt={`Thumbnail ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="p-6 md:p-8 space-y-6 overflow-auto">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {selectedEvent.title}
                      </h2>
                      <span className="inline-block mt-2 text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                        {catName(selectedEvent._cat)}
                      </span>
                    </div>
                  </div>

                  {selectedEvent.description && (
                    <div className="prose max-w-none text-gray-700">
                      <p>{selectedEvent.description}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Location
                          </h4>
                          <p className="text-gray-900">
                            {selectedEvent.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Date & Time
                          </h4>
                          <p className="text-gray-900">
                            {selectedEvent.date} at {selectedEvent.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Price
                          </h4>
                          <p className="text-gray-900">
                            Rs{" "}
                            {Number(selectedEvent.price || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Attendance
                          </h4>
                          <p className="text-gray-900">
                            {Number(selectedEvent.registered || 0)} /{" "}
                            {Number(selectedEvent.capacity || 0)} registered
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-lg font-bold text-gray-900">
                          {selectedEvent.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({selectedEvent.ratingsCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
