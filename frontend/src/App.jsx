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

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <RouteMetaManager />
          <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* mai mult spațiu sub navbarul cu logo mare */}
            <div className="pt-20 lg:pt-28 flex-grow">
              {/* 1 coloană pe mobil+tabletă; 3 coloane abia de la lg (≥1024px) */}
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
                    <div className="px-1 text-[11px] font-medium text-gray-500">Parteneri</div>
                    <AdsDisplay position="left" />
                  </div>
                </aside>

                {/* Conținut central – separator doar când există side-bar-uri */}
                <main className="w-full pt-4 md:pt-6 pb-16 md:pb-20 lg:border-x lg:border-gray-100 lg:px-6">
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
                    <div className="px-1 text-[11px] font-medium text-gray-500">Parteneri</div>
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
