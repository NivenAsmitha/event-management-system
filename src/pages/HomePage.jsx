// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import CustomerReviews from "../components/CustomerReviews";

// Images
import holiImg from "../assets/holi.png";
import funeralImg from "../assets/funaral.png";
import weddingImg from "../assets/wedding.jpg";
import heroImg from "../assets/Hero.png";

// Video
import whyVideo from "../assets/why.mp4";

// Icons
import {
  ClipboardList,
  ShieldCheck,
  Headphones,
  Users as UsersIcon,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  // Categories
  const categories = [
    {
      title: "Fun Time Activities",
      img: heroImg,
      description: "Games, entertainment, and group fun activities.",
      link: "/events?category=funtime",
    },
    {
      title: "Cultural Festivals",
      img: holiImg,
      description: "Celebrate Holi, Diwali, and cultural events.",
      link: "/events?category=cultural",
    },
    {
      title: "Weddings",
      img: weddingImg,
      description: "Plan and attend beautiful weddings.",
      link: "/events?category=weddings",
    },
    {
      title: "Funeral Services",
      img: funeralImg,
      description: "Respectful and well-organized ceremonies.",
      link: "/events?category=funeral",
    },
  ];

  // Stats (shown after Hero)
  const stats = [
    {
      number: "50K+",
      label: "Events Hosted",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      number: "2M+",
      label: "Happy Attendees",
      icon: <UsersIcon className="h-6 w-6" />,
    },
    {
      number: "98%",
      label: "Success Rate",
      icon: <Award className="h-6 w-6" />,
    },
    {
      number: "150+",
      label: "Countries",
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ];

  // Why Choose (video overlay cards)
  const benefits = [
    {
      icon: <ClipboardList className="h-10 w-10 text-blue-600" />,
      title: "Easy Event Management",
      desc: "Plan, manage, and track events from one place.",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-blue-600" />,
      title: "Secure Payment",
      desc: "Safe and reliable payment processing for your events.",
    },
    {
      icon: <UsersIcon className="h-10 w-10 text-blue-600" />,
      title: "Wide Event Variety",
      desc: "From small gatherings to grand festivals.",
    },
    {
      icon: <Headphones className="h-10 w-10 text-blue-600" />,
      title: "24/7 Support",
      desc: "We are here to help at any time.",
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 mt-20 shadow-lg rounded-xl">
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Explore Event Categories
          </h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Browse through our curated categories and find the perfect event for
            you.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="group bg-white border rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{cat.description}</p>
                <Link
                  to={cat.link}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Explore
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose EventHub Section (video background) */}
      <section className="relative py-16 mt-16">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={whyVideo} type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose EventHub?
          </h2>
          <p className="text-white mb-10 max-w-2xl mx-auto">
            We provide everything you need to create and enjoy unforgettable
            events.
          </p>

          {/* Benefit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-white/90 backdrop-blur-sm text-blue-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition"
              >
                <div className="flex justify-center mb-4">{b.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Stats Section (after Hero) */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="group">
              <div className="flex justify-center mb-3">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
