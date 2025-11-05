// src/components/Navigation.jsx
import React, { useEffect, useState } from "react";
import { Calendar, Menu, X, Search, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

export default function Navigation({ onNav }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  // track current user from localStorage
  const [user, setUser] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const items = [
    { name: "Home", to: "/" },
    { name: "Events", to: "/events" },
    { name: "Gallery", to: "/gallery" },
    { name: "About", to: "/about" },
    { name: "Contact", to: "/contact" },
    ...(user?.role === "photographer"
      ? [{ name: "Photographer", to: "/photographer/dashboard" }]
      : []),
    ...(user?.role === "admin" ? [{ name: "Admin", to: "/admin" }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `hover:text-blue-200 transition-colors duration-200 font-medium whitespace-nowrap ${
      isActive ? "underline underline-offset-4" : ""
    }`;

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Calendar className="h-7 w-7" />
            EventHub
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={linkClass}
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Right tools */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="bg-blue-500 text-white placeholder-blue-200 px-4 py-2 pr-10 rounded-lg border border-blue-400 focus:outline-none focus:ring-2 focus:ring-white w-56"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Mobile search toggle */}
            <button
              className="lg:hidden p-2 hover:bg-blue-500 rounded-lg transition-colors"
              onClick={() => setSearchOpen((o) => !o)}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Profile / Login / Logout */}
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthTab("login");
                  setAuthOpen(true);
                }}
                className="hidden sm:inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Login
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-blue-500 rounded-lg transition-colors"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="lg:hidden bg-blue-500 px-4 py-3 border-t border-blue-400">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full bg-blue-400 text-white placeholder-blue-200 px-4 py-2 pr-10 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden bg-blue-500 border-t border-blue-400">
            <div className="px-4 py-2 space-y-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-2 rounded-lg hover:bg-blue-400 transition-colors border-b border-blue-400/30 last:border-b-0"
                >
                  {item.name}
                </NavLink>
              ))}

              {user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full mt-2 bg-white text-blue-600 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    setAuthTab("login");
                    setAuthOpen(true);
                  }}
                  className="w-full mt-2 bg-white text-blue-600 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth modal */}
      <AuthModal
        open={authOpen}
        initialTab={authTab}
        onClose={() => {
          setAuthOpen(false);
          const stored = localStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
        }}
      />
    </>
  );
}
