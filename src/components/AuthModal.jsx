// src/components/AuthModal.jsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function AuthModal({ open, initialTab = "login", onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setError(null);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const username = fd.get("username");
    const password = fd.get("password");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost/eventHub-backend/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: json.id,
          username: json.username,
          role: json.role,
        })
      );
      onClose?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const first_name = fd.get("first_name");
    const last_name = fd.get("last_name");
    const username = fd.get("username");
    const email = fd.get("email");
    const phone = fd.get("phone");
    const password = fd.get("password");
    const confirm = fd.get("confirmPassword");

    if (!first_name || !last_name || !username || !email || !password) {
      setError("All fields are required");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/eventHub-backend/register.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name,
            last_name,
            username,
            email,
            phone,
            password,
            role: "user",
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");

      alert("Account created! Please sign in.");
      setTab("login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 p-2">
          <X className="h-5 w-5 text-gray-600" />
        </button>
        <div className="p-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`flex-1 py-3 text-sm font-medium ${
                tab === "login"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex-1 py-3 text-sm font-medium ${
                tab === "register"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">First Name</label>
                    <input
                      name="first_name"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Last Name</label>
                    <input
                      name="last_name"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Username</label>
                  <input
                    name="username"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone</label>
                  <input
                    name="phone"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Confirm Password
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  Create Account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
