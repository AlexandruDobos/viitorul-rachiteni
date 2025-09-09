// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import HeroTitle from './components/HeroTitle';
import RequestResetPassword from './pages/RequestResetPassword';
import ResetPassword from './pages/ResetPassword';
import AuthProvider from './context/AuthProvider';
import Squad from './pages/Squad';
import Matches from './pages/Matches';
import Results from './pages/Results';
import Standings from './pages/Standings';
import AdminPanel from './pages/AdminPanel';
import RequireAdmin from './components/RequireAdmin';
import Contact from './pages/Contact';
import Donations from './pages/Donations';
import PlayerDetails from './components/PlayerDetails';
import AdsDisplay from './components/AdsDisplay';
import MatchDetails from './components/MatchDetails';
import PlayersCarousel from './components/PlayersCarousel';
import Footer from './components/Footer';
import RouteMetaManager from './components/RouteMetaManager';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AnnouncementsSection from './components/AnnouncementsSection';
import DonationsSuccess from './pages/DonationsSuccess';
import DonationsCancel from './pages/DonationsCancel';
import NextMatchSection from './components/NextMatchSection';

import { motion } from 'framer-motion';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <RouteMetaManager />
          <div className="relative min-h-screen flex flex-col overflow-hidden">
            {/* FUNDAL animat */}
            <div className="fixed inset-0 -z-10">
              {/* Gradient static */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-100" />

              {/* Cercuri animate subtile */}
              <motion.div
                className="absolute w-80 h-80 bg-blue-300/20 rounded-full blur-3xl top-20 left-10"
                animate={{ y: [0, -25, 0], x: [0, 20, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl bottom-20 right-10"
                animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <Navbar />

            {/* mai mult spațiu sub navbarul cu logo mare */}
            <div className="pt-20 lg:pt-28 flex-grow">
              <div
                className="
                  mx-auto max-w-[1800px]
                  grid lg:grid-cols-[220px_minmax(0,1fr)_220px]
                  gap-y-6 lg:gap-y-8
                  gap-x-6 lg:gap-x-12 xl:gap-x-16
                  px-4 sm:px-6 lg:px-10
                "
              >
                {/* Sidebar stânga – doar ≥lg */}
                <aside className="hidden lg:block lg:pr-4">
                  <div className="lg:sticky lg:top-28 space-y-4">
                    <div className="px-1 text-[11px] font-medium text-gray-600">Parteneri</div>
                    <AdsDisplay position="left" />
                  </div>
                </aside>

                {/* Conținut central */}
                <main className="w-full pt-4 md:pt-6 pb-16 md:pb-20 lg:border-x lg:border-gray-200/50 lg:px-6 bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-none shadow-sm">
                  {/* Ads pe mobil/tabletă (sub lg) */}
                  <div className="lg:hidden mb-5 space-y-3">
                    <AdsDisplay position="left" />
                  </div>

                  <Routes>
                    <Route
                      path="/"
                      element={
                        <>
                          <HeroTitle />
                          <AnnouncementsSection limit={6} />
                          <NextMatchSection />
                          <PlayersCarousel />
                        </>
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
                    <Route
                      path="/admin"
                      element={
                        <RequireAdmin>
                          <AdminPanel />
                        </RequireAdmin>
                      }
                    />
                  </Routes>

                  {/* Ads jos pe mobil/tabletă */}
                  <div className="lg:hidden mt-6 space-y-3">
                    <AdsDisplay position="right" />
                  </div>
                </main>

                {/* Sidebar dreapta – doar ≥lg */}
                <aside className="hidden lg:block lg:pl-4">
                  <div className="lg:sticky lg:top-28 space-y-4">
                    <div className="px-1 text-[11px] font-medium text-gray-600">Parteneri</div>
                    <AdsDisplay position="right" />
                  </div>
                </aside>
              </div>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
