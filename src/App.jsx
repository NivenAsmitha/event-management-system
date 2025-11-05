import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// layout
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

// core pages
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

// dashboards
import AdminDashboard from "./pages/AdminDashboard";
import PhotographerDashboard from "./pages/PhotographerDashboard";

// gallery workflow pages
import GalleryPage from "./pages/GalleryPage";
import PhotographerUploadPage from "./pages/PhotographerUploadPage";
import AdminGalleryReviewPage from "./pages/AdminGalleryReviewPage";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Add any routes where the footer should be hidden
  const hideFooterRoutes = ["/admin"];
  const shouldHideFooter = hideFooterRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navigation onNav={(path) => navigate(path)} />

      <main className="flex-grow">
        <Routes>
          {/* Public site */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Gallery workflow */}
          <Route path="/gallery" element={<GalleryPage />} />
          <Route
            path="/photographer/upload"
            element={<PhotographerUploadPage />}
          />
          <Route
            path="/admin/gallery-review"
            element={<AdminGalleryReviewPage />}
          />

          {/* Dashboards */}
          <Route
            path="/photographer/dashboard"
            element={<PhotographerDashboard />}
          />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* ✅ Conditionally render footer */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}
