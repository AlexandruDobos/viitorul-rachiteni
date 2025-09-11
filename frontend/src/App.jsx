// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import HeroTitle from "./components/HeroTitle";
import RequestResetPassword from "./pages/RequestResetPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthProvider from "./context/AuthProvider";
import Squad from "./pages/Squad";
import Matches from "./pages/Matches";
import Results from "./pages/Results";
import Standings from "./pages/Standings";
import AdminPanel from "./pages/AdminPanel";
import RequireAdmin from "./components/RequireAdmin";
import Contact from "./pages/Contact";
import Donations from "./pages/Donations";
import PlayerDetails from "./components/PlayerDetails";
import MatchDetails from "./components/MatchDetails";
import PlayersCarousel from "./components/PlayersCarousel";
import RouteMetaManager from "./components/RouteMetaManager";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AnnouncementsSection from "./components/AnnouncementsSection";
import DonationsSuccess from "./pages/DonationsSuccess";
import DonationsCancel from "./pages/DonationsCancel";
import NextMatchSection from "./components/NextMatchSection";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import News from "./pages/News";

// Layout-uri
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

function FixXOverflow() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflowX;
    const prevBody = body.style.overflowX;
    html.style.overflowX = "hidden";
    body.style.overflowX = "hidden";
    return () => {
      html.style.overflowX = prevHtml;
      body.style.overflowX = prevBody;
    };
  }, []);
  return null;
}

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <RouteMetaManager />

          {/* === ADĂUGAT: blochează overflow-ul orizontal global === */}
          <FixXOverflow />

          <Routes>
            {/* === Rute PUBLICe cu layout complet (Navbar + Ads + Footer) === */}
            <Route element={<PublicLayout />}>
              <Route
                path="/"
                element={
                  // Taie overflow-ul DOAR pe home (sursele overflow-ului sunt secțiuni specifice home)
                  <div className="overflow-x-hidden">
                    <div className="overflow-hidden">
                      <HeroTitle />
                    </div>

                    <div className="overflow-hidden">
                      <AnnouncementsSection limit={4} />
                    </div>

                    <div className="overflow-hidden">
                      <NextMatchSection />
                    </div>

                    {/* Carouselele sunt adesea sursa overflow-ului -> învelit cu overflow-hidden */}
                    <div className="overflow-hidden">
                      <PlayersCarousel />
                    </div>
                  </div>
                }
              />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/request-reset" element={<RequestResetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/squad" element={<Squad />} />
              <Route path="/squad/:id" element={<PlayerDetails />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/results" element={<Results />} />
              <Route path="/standings" element={<Standings />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/donations/success" element={<DonationsSuccess />} />
              <Route path="/donations/cancel" element={<DonationsCancel />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/matches/:matchId" element={<MatchDetails />} />
              <Route path="/players/:playerId" element={<PlayerDetails />} />
              <Route path="/confidentialitate" element={<PrivacyPolicy />} />
              <Route path="/termeni" element={<Terms />} />
              <Route path="/cookie-uri" element={<Cookies />} />
              <Route path="/stiri" element={<News />} />
            </Route>

            {/* === Rută ADMIN cu layout gol (fără navbar/footer/ads) === */}
            <Route element={<AdminLayout />}>
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminPanel />
                  </RequireAdmin>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
