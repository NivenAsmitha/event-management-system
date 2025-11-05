import {
  Calendar,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: <Facebook className="h-5 w-5" />,
      url: "https://facebook.com/eventhub",
      name: "Facebook",
    },
    {
      icon: <Twitter className="h-5 w-5" />,
      url: "https://twitter.com/eventhub",
      name: "Twitter",
    },
    {
      icon: <Instagram className="h-5 w-5" />,
      url: "https://instagram.com/eventhub",
      name: "Instagram",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      url: "https://linkedin.com/company/eventhub",
      name: "LinkedIn",
    },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Events", href: "/events" },
    { name: "Create Event", href: "/create" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Refund Policy", href: "/refunds" },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    setEmail("");
    // Add your newsletter subscription logic here
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">EventHub</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              The world's leading event management platform. Connect, discover,
              and create unforgettable experiences with EventHub.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 p-2 rounded-lg hover:bg-blue-600 transition-all duration-300 group"
                  aria-label={link.name}
                >
                  <div className="text-slate-400 group-hover:text-white transition-colors">
                    {link.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white text-sm transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-blue-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-slate-300 text-sm">
                  <p>123 Innovation Drive</p>
                  <p>Tech District, NY 10001</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-slate-300 hover:text-white text-sm transition-colors"
                >
                  +1 (234) 567-8900
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a
                  href="mailto:hello@eventhub.com"
                  className="text-slate-300 hover:text-white text-sm transition-colors"
                >
                  hello@eventhub.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Get the latest updates on events, features, and exclusive offers
              delivered to your inbox.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 text-sm"
                  required
                />
              </div>

              <button
                onClick={handleNewsletterSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Send className="h-4 w-4" />
                Subscribe Now
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              © {currentYear} EventHub Technologies Inc. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6">
              {legalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
