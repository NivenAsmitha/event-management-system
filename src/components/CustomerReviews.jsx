import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useState, useMemo } from "react";

const REVIEWS = [
  {
    name: "Ayesha Fernando",
    role: "Senior Wedding Planner",
    company: "Elegant Events Co.",
    rating: 5,
    text: "EventHub has revolutionized our event management process. The comprehensive guest management system, automated reminders, and seamless coordination tools have elevated our service quality significantly. Our clients consistently praise the professional experience.",
    initials: "AF",
    verified: true,
  },
  {
    name: "Ravindu Perera",
    role: "Festival Director",
    company: "Cultural Heritage Foundation",
    rating: 5,
    text: "Managing our annual cultural festival with 8,000+ attendees became effortless with EventHub. The real-time analytics, crowd management tools, and comprehensive reporting features provided invaluable insights that helped us optimize every aspect of the event.",
    initials: "RP",
    verified: true,
  },
  {
    name: "Sanja Weerasinghe",
    role: "Corporate Events Manager",
    company: "Global Solutions Ltd.",
    rating: 5,
    text: "The platform's sophisticated ticketing system and intuitive check-in process have streamlined our corporate events significantly. The detailed dashboard analytics provide exceptional insights into attendee engagement and event performance metrics.",
    initials: "SW",
    verified: true,
  },
  {
    name: "Nadeesha Jayawardena",
    role: "Community Coordinator",
    company: "Local Connect Network",
    rating: 5,
    text: "EventHub has become our go-to platform for community engagement events. The user-friendly interface, secure payment processing, and exceptional customer support have made organizing local meetups and workshops incredibly efficient.",
    initials: "NJ",
    verified: true,
  },
  {
    name: "Chaminda Silva",
    role: "Event Marketing Director",
    company: "ProMotion Events",
    rating: 5,
    text: "The integrated marketing tools and attendee engagement features have significantly improved our event ROI. EventHub's comprehensive suite of professional tools has become essential for delivering high-impact corporate conferences and trade shows.",
    initials: "CS",
    verified: true,
  },
  {
    name: "Priyanka Mendis",
    role: "Operations Manager",
    company: "Premier Venues Group",
    rating: 4,
    text: "Outstanding platform for venue management and event coordination. The scheduling system, resource allocation tools, and client communication features have enhanced our operational efficiency and customer satisfaction rates considerably.",
    initials: "PM",
    verified: true,
  },
];

export default function CustomerReviews() {
  const [index, setIndex] = useState(0);
  const visible = useMemo(() => {
    const window = 3;
    const items = [];
    for (let i = 0; i < window; i++) {
      items.push(REVIEWS[(index + i) % REVIEWS.length]);
    }
    return items;
  }, [index]);

  const avgRating = 4.9;
  const totalReviews = "2.8K+";

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="h-4 w-4" />
            Trusted by Industry Leaders
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Industry Professionals Say
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how EventHub empowers event professionals to deliver
            exceptional experiences and achieve outstanding results across
            diverse industries.
          </p>

          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(avgRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {avgRating}/5.0
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="text-lg text-gray-700">
              <span className="font-semibold">{totalReviews}</span> verified
              reviews
            </div>
          </div>
        </div>

        {/* Enhanced Carousel */}
        <div className="relative">
          {/* Premium Navigation Controls */}
          <button
            aria-label="Previous testimonials"
            onClick={() =>
              setIndex((p) => (p - 1 + REVIEWS.length) % REVIEWS.length)
            }
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 text-blue-700 border border-blue-100 transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            aria-label="Next testimonials"
            onClick={() => setIndex((p) => (p + 1) % REVIEWS.length)}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 text-blue-700 border border-blue-100 transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Premium Review Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {visible.map((review, i) => (
              <article
                key={`${review.name}-${i}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 h-full border border-gray-100 hover:border-blue-200 group"
              >
                {/* Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <Quote className="h-8 w-8 text-blue-600/80 group-hover:text-blue-600 transition-colors" />
                  {review.verified && (
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Review Text */}
                <blockquote className="text-gray-700 leading-relaxed text-lg mb-8 font-light">
                  "{review.text}"
                </blockquote>

                {/* Author Information */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Premium Avatar */}
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                      {review.initials}
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {review.name}
                      </div>
                      <div className="text-blue-600 font-medium text-sm">
                        {review.role}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {review.company}
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 ml-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`h-5 w-5 ${
                          s < review.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Enhanced Progress Indicators */}
          <div className="mt-12 flex justify-center gap-3">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === i
                    ? "w-8 bg-blue-600 shadow-sm"
                    : "w-3 bg-blue-200 hover:bg-blue-300 hover:w-6"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-6 font-medium">
              Trusted by professionals at leading organizations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm font-semibold">
              <span>Elegant Events Co.</span>
              <span>Cultural Heritage Foundation</span>
              <span>Global Solutions Ltd.</span>
              <span>Premier Venues Group</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
