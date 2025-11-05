import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// images
import funeralImg from "../assets/funaral.png";
import holiImg from "../assets/holi.png";
import heroImg from "../assets/Hero.png"; // new hero image
import weddingImg from "../assets/wedding.jpg";

const SLIDE_INTERVAL = 5000; // 5 seconds

export default function Hero() {
  const slides = useMemo(
    () => [
      {
        img: weddingImg,
        title: "Plan Beautiful Weddings",
        subtitle:
          "From venues to guest lists—manage everything effortlessly with EventHub.",
        cta: { label: "Explore Events", to: "/events" },
      },
      {
        img: heroImg, // swapped in Hero.png
        title: "Discover Memorable Moments",
        subtitle:
          "Your one-stop platform for planning, attending, and sharing incredible events.",
        cta: { label: "Get Started", to: "/events" },
      },
      {
        img: holiImg,
        title: "Celebrate Culture & Festivals",
        subtitle:
          "Find Holi, New Year, and cultural festivals—create memories that last.",
        cta: { label: "See Festivals", to: "/events?category=cultural" },
      },
      {
        img: funeralImg,
        title: "Support for Funeral Services",
        subtitle:
          "Organize with care and dignity—venues, arrangements, and attendance.",
        cta: { label: "Learn More", to: "/events?category=service" },
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const hoverRef = useRef(false);

  const go = (next) => {
    setIndex((i) => (i + next + slides.length) % slides.length);
  };

  useEffect(() => {
    if (hoverRef.current) return;
    // start / restart the timer for the current index
    timerRef.current = setInterval(() => go(1), SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, slides.length]);

  return (
    <section
      className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden"
      onMouseEnter={() => {
        hoverRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        if (timerRef.current) clearInterval(timerRef.current); // prevent duplicate timers
        timerRef.current = setInterval(() => go(1), SLIDE_INTERVAL);
      }}
      aria-label="EventHub hero"
    >
      {/* slides */}
      <div
        className="h-full w-full flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={i} className="relative min-w-full h-full">
            <img
              src={s.img}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-blue-900/30 md:bg-blue-900/40" />
            <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
              <div className="text-white max-w-xl">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs md:text-sm mb-3 ring-1 ring-white/20">
                  <Calendar className="h-4 w-4" />
                  EventHub • Plan • Discover • Celebrate
                </div>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                  {s.title}
                </h1>
                <p className="mt-3 text-blue-100 md:text-lg">{s.subtitle}</p>
                <div className="mt-6 flex gap-3">
                  <Link
                    to={s.cta.to}
                    className="bg-white text-blue-700 px-5 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center gap-2"
                  >
                    {s.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/about"
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* arrows */}
      <button
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-blue-700 p-2 rounded-full shadow transition"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-blue-700 p-2 rounded-full shadow transition"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${
              index === i ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
