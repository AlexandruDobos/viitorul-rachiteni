// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
import AnnouncementsSection from './components/AnnouncementsSection';
import DonationsSuccess from './pages/DonationsSuccess';
import DonationsCancel from './pages/DonationsCancel';
import NextMatchSection from './components/NextMatchSection';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <RouteMetaManager />
          <div className="relative min-h-screen flex flex-col bg-transparent">
            {/* FUNDAL animat */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              {/* gradient animat */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-sky-900 animate-gradient" />

              {/* cercuri translucide animate */}
              <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float1 top-20 left-10" />
              <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float2 bottom-20 right-10" />
            </div>

            <Navbar />

            {/* spațiu sub navbar */}
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
                <aside className="hidden lg:block lg:pr-4">
                  <div className="lg:sticky lg:top-28 space-y-4">
                    <div className="px-1 text-[11px] font-medium text-gray-300">Parteneri</div>
                    <AdsDisplay position="left" />
                  </div>
                </aside>

                <main className="w-full pt-4 md:pt-6 pb-16 md:pb-20 lg:border-x lg:border-gray-100/20 lg:px-6">
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
                </main>

                <aside className="hidden lg:block lg:pl-4">
                  <div className="lg:sticky lg:top-28 space-y-4">
                    <div className="px-1 text-[11px] font-medium text-gray-300">Parteneri</div>
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
