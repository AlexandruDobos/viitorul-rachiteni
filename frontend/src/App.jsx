// src/App.jsx
import React, { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from "react-router-dom";

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
import AnnouncementDetail from "./components/AnnouncementDetail";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

// === adăugiri pentru profil / guard ===
import Profile from "./pages/Profile";
import AuthContext from "./context/AuthContext";

const SITE_NAME = "ACS Viitorul Răchiteni";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const ABS = () => { try { return window.location.origin; } catch { return ""; } };
const absUrl = (p) => (p?.startsWith("http") ? p : `${ABS()}${p?.startsWith("/") ? p : `/${p || ""}`}`);

function setElAttr(sel, attr, val) {
  const el = document.querySelector(sel);
  if (!el) return;
  if (attr === "text") el.textContent = val;
  else el.setAttribute(attr, val);
}
function useMeta({ title, description, url, image, type = "website" }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      setElAttr('meta#meta-desc', 'content', description);
      setElAttr('meta#og-desc', 'content', description);
      setElAttr('meta#tw-desc', 'content', description);
    }
    if (title) {
      setElAttr('title#meta-title', 'text', title);
      setElAttr('meta#og-title', 'content', title);
      setElAttr('meta#tw-title', 'content', title);
    }
    if (url) {
      setElAttr('link#canonical-link', 'href', url);
      setElAttr('meta#og-url', 'content', url);
    }
    if (image) {
      const imgAbs = absUrl(image);
      setElAttr('meta#og-image', 'content', imgAbs);
      setElAttr('meta#tw-image', 'content', imgAbs);
    }
    if (type) setElAttr('meta#og-type', 'content', type);
  }, [title, description, url, image, type]);
}

const slugify = (s = "") =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/* ====== Rute SEO: set meta pentru pagini statice ====== */
function StaticSeo({ title, description, path, image = "/favicon.png", children }) {
  useMeta({
    title: `${title} – ${SITE_NAME}`,
    description,
    url: absUrl(path),
    image,
    type: "website",
  });
  return children || null;
}

/* ====== SEO pentru un articol (știre) ====== */
function AnnouncementRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/app/announcements/${id}`);
        if (!res.ok) return;
        const a = await res.json();
        if (cancelled) return;

        const s = slugify(a.title || "");
        url = absUrl(`/stiri/${a.id}/${s}`);
        const desc = (a.contentText || "").replace(/\s+/g, " ").trim().slice(0, 180) ||
          "Știri și rezultate ACS Viitorul Răchiteni";

        // set meta
        setElAttr('title#meta-title', 'text', `${a.title} – ${SITE_NAME}`);
        setElAttr('meta#meta-desc', 'content', desc);
        setElAttr('meta#og-title', 'content', `${a.title} – ${SITE_NAME}`);
        setElAttr('meta#og-desc', 'content', desc);
        setElAttr('meta#tw-title', 'content', `${a.title} – ${SITE_NAME}`);
        setElAttr('meta#tw-desc', 'content', desc);
        setElAttr('meta#og-type', 'content', 'article');
        setElAttr('link#canonical-link', 'href', url);
        setElAttr('meta#og-url', 'content', url);
        setElAttr('meta#og-image', 'content', absUrl(a.coverUrl || "/favicon.png"));
        setElAttr('meta#tw-image', 'content', absUrl(a.coverUrl || "/favicon.png"));
        document.title = `${a.title} – ${SITE_NAME}`;

        // JSON-LD Article
        const prev = document.getElementById("ld-article");
        if (prev) prev.remove();
        const script = document.createElement("script");
        script.id = "ld-article";
        script.type = "application/ld+json";
        script.text = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": a.title,
          "datePublished": a.publishedAt,
          "dateModified": a.publishedAt,
          "author": { "@type": "Organization", "name": SITE_NAME },
          "publisher": { "@type": "Organization", "name": SITE_NAME, "logo": { "@type": "ImageObject", "url": absUrl("/favicon.png") } },
          "image": a.coverUrl ? [absUrl(a.coverUrl)] : [absUrl("/favicon.png")],
          "mainEntityOfPage": { "@type": "WebPage", "@id": url }
        });
        document.head.appendChild(script);
      } catch { }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return <AnnouncementDetail id={Number(id)} onBack={() => navigate("/stiri")} />;
}

/* ====== SEO basic pentru player / match (fără fetch; funcționează la share datorită filtrului backend) ====== */
function PlayerSeoWrapper({ children }) {
  useMeta({
    title: `Profil jucător – ${SITE_NAME}`,
    description: "Profilul unui jucător ACS Viitorul Răchiteni: statistici și informații.",
    url: absUrl(window.location.pathname),
    image: "/favicon.png",
    type: "profile",
  });
  return children;
}
function MatchSeoWrapper({ children }) {
  useMeta({
    title: `Detalii meci – ${SITE_NAME}`,
    description: "Program și detalii meci pentru ACS Viitorul Răchiteni.",
    url: absUrl(window.location.pathname),
    image: "/favicon.png",
    type: "website",
  });
  return children;
}

function FixXOverflow() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflowX;
    const prevBody = body.style.overflowX = "hidden";
    html.style.overflowX = "hidden";
    body.style.overflowX = "hidden";
    return () => {
      html.style.overflowX = prevHtml;
      body.style.overflowX = prevBody;
    };
  }, []);
  return null;
}

// === guard simplu pentru /profile ===
function RequireAuth({ children }) {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) return null;
  return user ? children : null;
}

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <RouteMetaManager />
          <FixXOverflow />

          <Routes>
            {/* PUBLIC */}
            <Route element={<PublicLayout />}>
              <Route
                path="/"
                element={
                  <div className="overflow-x-hidden">
                    <div className="overflow-hidden"><HeroTitle /></div>
                    <div className="overflow-hidden"><AnnouncementsSection limit={4} /></div>
                    <div className="overflow-hidden"><NextMatchSection /></div>
                    <div className="overflow-hidden"><PlayersCarousel /></div>
                  </div>
                }
              />

              {/* LISTĂ ȘTIRI + DETALIU (SEO) */}
              <Route path="/stiri" element={<News />} />
              <Route path="/stiri/:id/:slug?" element={<AnnouncementRoute />} />

              {/* PAGINI STATICE (SEO) */}
              <Route path="/contact" element={
                <StaticSeo
                  title="Contact"
                  description="Contactează ACS Viitorul Răchiteni pentru parteneriate, presă și alte informații."
                  path="/contact"
                >
                  <Contact />
                </StaticSeo>
              } />

              <Route path="/donations" element={
                <StaticSeo
                  title="Donează"
                  description="Susține ACS Viitorul Răchiteni printr-o donație. Orice ajutor contează!"
                  path="/donations"
                >
                  <Donations />
                </StaticSeo>
              } />
              <Route path="/donations/success" element={<DonationsSuccess />} />
              <Route path="/donations/cancel" element={<DonationsCancel />} />
              <Route path="/abonament" element={<Subscription />} />
              <Route path="/abonament/success" element={<SubscriptionSuccess />} />
              <Route path="/abonament/cancel" element={<SubscriptionCancel />} />
              <Route path="/squad" element={
                <StaticSeo
                  title="Lotul echipei"
                  description="Cunoaște lotul ACS Viitorul Răchiteni: jucători, poziții și detalii."
                  path="/squad"
                >
                  <Squad />
                </StaticSeo>
              } />
              <Route path="/squad/:id" element={<PlayerDetails />} />

              {/* Detalii player/match cu meta generic (share corect datorită backend filter) */}
              <Route path="/players/:playerId" element={<PlayerSeoWrapper><PlayerDetails /></PlayerSeoWrapper>} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matches/:matchId" element={<MatchSeoWrapper><MatchDetails /></MatchSeoWrapper>} />
              <Route path="/results" element={<Results />} />
              <Route path="/standings" element={<Standings />} />

              <Route path="/confidentialitate" element={<StaticSeo title="Politica de confidențialitate" description="Politica de confidențialitate pentru ACS Viitorul Răchiteni." path="/confidentialitate"><PrivacyPolicy /></StaticSeo>} />
              <Route path="/termeni" element={<StaticSeo title="Termeni și condiții" description="Termenii și condițiile de utilizare a site-ului ACS Viitorul Răchiteni." path="/termeni"><Terms /></StaticSeo>} />
              <Route path="/cookie-uri" element={<StaticSeo title="Politica de cookie-uri" description="Detalii privind utilizarea cookie-urilor pe site-ul ACS Viitorul Răchiteni." path="/cookie-uri"><Cookies /></StaticSeo>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/request-reset" element={<RequestResetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* === nou: profil (doar autentificat) === */}
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            </Route>

            {/* ADMIN */}
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
