import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  User,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

// Import your images
import hero from "../assets/about us.jpg";
import contactImage from "../assets/anout1.png";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-80 bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${hero})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center justify-center text-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Get in touch with our professional event planning team. We're here
              to make your vision come to life.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-1">+94 11 234 5678</p>
              <p className="text-gray-500 text-xs">Mon-Fri 9AM-6PM</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 text-sm mb-1">hello@eventhub.lk</p>
              <p className="text-gray-500 text-xs">24h response time</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm mb-1">123 Event Street</p>
              <p className="text-gray-500 text-xs">Colombo 03, Sri Lanka</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
              <p className="text-gray-600 text-sm mb-1">Mon-Fri: 9AM-6PM</p>
              <p className="text-gray-500 text-xs">Sat: 10AM-4PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Image and Text Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <img
                src={contactImage}
                alt="Event Planning Team"
                className="w-full h-96 object-cover rounded-xl shadow-lg border-4 border-gray-300"
              />
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose EventHub?
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg leading-relaxed">
                  With over 10 years of experience in the event management
                  industry, we specialize in creating unforgettable experiences
                  that exceed expectations.
                </p>
                <p>
                  Our dedicated team of professionals works closely with each
                  client to understand their vision and bring it to life with
                  precision and creativity.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <div className="text-sm text-gray-500">
                      Events Completed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">98%</div>
                    <div className="text-sm text-gray-500">
                      Client Satisfaction
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Send us a Message
            </h2>
            <p className="text-gray-600">
              Ready to start planning your next event? Fill out the form below
              and we'll get back to you within 24 hours.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                <div className="flex items-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                  <p className="text-green-800 font-medium">
                    Thank you! Your message has been sent successfully. We'll
                    respond within 24 hours.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.subject
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your event requirements, questions, or how we can help..."
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      errors.message
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg">
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-medium text-gray-800 hover:text-blue-600">
                  How quickly do you respond to inquiries?
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  We respond to all inquiries within 24 hours during business
                  days. For urgent matters, please call us directly at +94 11
                  234 5678.
                </div>
              </details>
            </div>

            <div className="border border-gray-200 rounded-lg">
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-medium text-gray-800 hover:text-blue-600">
                  What types of events do you specialize in?
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  We handle all types of events including corporate conferences,
                  weddings, birthday parties, product launches, exhibitions, and
                  cultural celebrations.
                </div>
              </details>
            </div>

            <div className="border border-gray-200 rounded-lg">
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-medium text-gray-800 hover:text-blue-600">
                  Do you provide services island-wide?
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  Yes, we provide comprehensive event management services
                  throughout Sri Lanka. Travel costs may apply for locations
                  outside Colombo.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-6">
              Let's discuss your event and create something amazing together.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="tel:+94112345678"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Call Now
              </a>
              <a
                href="mailto:hello@eventhub.lk"
                className="bg-transparent border border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
