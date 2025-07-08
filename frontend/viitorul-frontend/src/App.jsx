import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Announcements from './components/Annoucements';
import AnnouncementDetail from './components/AnnoucementDetail';
import RequestResetPassword from './pages/RequestResetPassword';
import ResetPassword from './pages/ResetPassword';
import AuthProvider from './context/AuthProvider';
import Squad from './pages/Squad';
import Results from './pages/Results';
import Standings from './pages/Standings';
import AdminPanel from './pages/AdminPanel';
import RequireAdmin from './components/RequireAdmin';
import { GoogleOAuthProvider } from '@react-oauth/google';
const App = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="pt-16 flex-grow">
              <div className="flex flex-col md:grid md:grid-cols-[160px_1fr_160px] md:min-h-screen">
                {/* Sidebar stânga */}
                <aside className="hidden md:block bg-gray-100 border-r px-2 py-4 text-sm text-center">
                  SPAȚIU<br />RECLAME
                </aside>

                {/* Conținut central: doar aici se schimbă rutele */}
                <main className="px-4 pt-6 pb-16 w-full">
                  {/* Reclame mobile sus */}
                  <div className="block md:hidden bg-gray-100 text-center text-sm py-2 border-b mb-6">
                    SPAȚIU RECLAMĂ SUS
                  </div>

                  <Routes>
                    <Route
                      path="/"
                      element={
                        <>
                          <h1 className="text-center text-xl font-bold mb-4">ACS VIITORUL RĂCHITENI</h1>
                          {selectedAnnouncement ? (
                            <AnnouncementDetail
                              id={selectedAnnouncement}
                              onBack={() => setSelectedAnnouncement(null)}
                            />
                          ) : (
                            <Announcements onSelect={(id) => setSelectedAnnouncement(id)} />
                          )}
                        </>
                      }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/request-reset" element={<RequestResetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/squad" element={<Squad />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/standings" element={<Standings />} />
                    <Route path="/admin" element={
                      <RequireAdmin>
                        <AdminPanel />
                      </RequireAdmin>
                    } />
                  </Routes>

                  {/* Reclame mobile jos */}
                  <div className="block md:hidden bg-gray-100 text-center text-sm py-2 border-t mt-6">
                    SPAȚIU RECLAMĂ JOS
                  </div>
                </main>

                {/* Sidebar dreapta */}
                <aside className="hidden md:block bg-gray-100 border-l px-2 py-4 text-sm text-center">
                  SPAȚIU<br />RECLAME
                </aside>
              </div>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
