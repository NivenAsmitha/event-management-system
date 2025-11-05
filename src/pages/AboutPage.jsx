import React from "react";
import aboutUsImg from "../assets/about us.jpg";
import {
  Calendar,
  Users,
  Shield,
  BarChart3,
  Clock,
  Globe,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    { number: "50K+", label: "Events Created", icon: Calendar },
    { number: "2M+", label: "Happy Attendees", icon: Users },
    { number: "150+", label: "Countries", icon: Globe },
    { number: "99.9%", label: "Uptime", icon: Shield },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning-Fast Setup",
      description:
        "Create professional events in under 5 minutes with our streamlined interface and smart templates.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and compliance with international data protection standards ensure your events are secure.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Gain deep insights with real-time reporting, attendee behavior tracking, and comprehensive performance metrics.",
    },
    {
      icon: Users,
      title: "Seamless Experience",
      description:
        "Intuitive registration, automated communications, and mobile-optimized interfaces for all users.",
    },
    {
      icon: Clock,
      title: "24/7 Expert Support",
      description:
        "Our dedicated customer success team provides round-the-clock assistance and strategic guidance.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Multi-language support, international payment processing, and timezone management for worldwide events.",
    },
  ];

  const values = [
    {
      title: "Innovation First",
      description:
        "We continuously push the boundaries of event technology to deliver cutting-edge solutions.",
    },
    {
      title: "Customer Success",
      description:
        "Your success is our priority. We're committed to helping you achieve exceptional event outcomes.",
    },
    {
      title: "Reliability",
      description:
        "Our platform maintains 99.9% uptime with enterprise-grade infrastructure and security.",
    },
    {
      title: "Accessibility",
      description:
        "We believe great event management tools should be accessible to organizations of all sizes.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-80 bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${aboutUsImg})` }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center justify-center text-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About EventHub
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Empowering event professionals worldwide with innovative
              technology and exceptional experiences since 2020.
            </p>
          </div>
        </div>
      </section>

      {/* Stats (cards under banner) */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-3">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <Calendar className="h-4 w-4" />
                Our Journey
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Transforming Events Since 2020
              </h2>

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  EventHub was born from a vision to revolutionize the event
                  management industry. Founded by a team of event professionals
                  and technology experts, we recognized the need for a
                  comprehensive platform that could handle the complexity of
                  modern events.
                </p>

                <p className="text-lg">
                  What started as a solution for small community gatherings has
                  evolved into a powerful platform trusted by Fortune 500
                  companies, non-profits, and independent organizers worldwide.
                  Our commitment to innovation and customer success has driven
                  us to become the industry standard.
                </p>

                <p className="text-lg">
                  Today, we're proud to serve millions of users across 150+
                  countries, facilitating everything from intimate workshops to
                  large-scale international conferences. Our platform continues
                  to evolve, powered by feedback from our incredible community
                  of event professionals.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-12 text-white text-center shadow-2xl">
                <Calendar className="h-16 w-16 mx-auto mb-6 text-blue-200" />
                <h3 className="text-2xl font-bold mb-4">
                  5+ Years of Excellence
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  Half a decade of continuous innovation, customer success, and
                  platform evolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Purpose
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Driven by passion, guided by principles, focused on your success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                To democratize event management through innovative technology,
                making it effortless for organizations of all sizes to create
                meaningful connections and deliver exceptional experiences that
                drive real impact.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                To become the global standard for event management, connecting
                millions of professionals worldwide and enabling the creation of
                transformative experiences that shape industries and
                communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose EventHub */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Industry Leaders Choose EventHub
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the features and capabilities that make EventHub the
              preferred choice for event professionals worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              The principles that guide every decision we make and every feature
              we build.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <h4 className="text-xl font-bold text-white mb-4">
                  {value.title}
                </h4>
                <p className="text-blue-100 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event professionals who trust EventHub to deliver
            exceptional experiences and drive measurable results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl">
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="inline-flex items-center gap-2 bg-transparent text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 border-2 border-white/30 hover:border-white/50">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
