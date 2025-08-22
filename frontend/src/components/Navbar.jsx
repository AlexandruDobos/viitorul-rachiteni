/* eslint-disable no-unused-vars */
// src/components/Navbar.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { BASE_URL } from '../utils/constants';
import AuthContext from '../context/AuthContext'; // <- ajustează importul dacă ai alt path

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);        // desktop dropdown "ECHIPĂ"
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [echipaOpen, setEchipaOpen] = useState(false);    // mobile dropdown "ECHIPĂ"

  const { user, loading, setUser, checkAuth } = useContext(AuthContext);
  const leftMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (leftMenuRef.current && !leftMenuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // close mobile panel when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
        setEchipaOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // re-check auth + close menus on route change
  useEffect(() => {
    // dacă vrei să fie mereu sincronizat când schimbi ruta
    checkAuth?.();
    setMenuOpen(false);
    setShowMobileMenu(false);
    setEchipaOpen(false);
  }, [location, checkAuth]);

  // lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMobileMenu]);

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser?.(null);
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const handleMobileClose = () => {
    setShowMobileMenu(false);
    setEchipaOpen(false);
  };

  // route highlighting
  const isActive = (path) => location.pathname.startsWith(path);
  const echipaActive = ['/squad', '/matches', '/results', '/standings'].some((p) =>
    location.pathname.startsWith(p)
  );

  // gradient underline
  const Underline = ({ active }) => (
    <span
      className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform
        ${active ? 'scale-x-100' : 'group-hover:scale-x-100'}
        bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500`}
    />
  );

  // opțional: poți afișa nimic sau un skeleton când încă se verifică auth
  // if (loading) return null;

  const isAuthenticated = !!user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* glassy bar */}
      <div className="backdrop-blur bg-white/80 border-b border-white/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          {/* DESKTOP BAR */}
          <div className="hidden md:flex items-center justify-between py-3">
            {/* LEFT: LOGO */}
            <Link to="/" aria-label="Mergi la pagina principală" className="relative">
              <span
                aria-hidden
                className="absolute -inset-x-8 -bottom-1 -top-1 -z-10 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 opacity-10 blur-xl"
              />
              <motion.img
                src={logo}
                alt="ACS Viitorul Răchiteni"
                className="h-14 md:h-20 w-auto object-contain drop-shadow"
                whileHover={{ rotate: [0, -8, 8, -6, 6, -3, 3, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                whileTap={{ scale: 0.96 }}
              />
            </Link>

            {/* RIGHT: NAV */}
            <nav ref={leftMenuRef} className="flex items-center gap-7 font-semibold text-[13px] tracking-wide uppercase text-gray-700">
              {/* ECHIPĂ dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className={`group relative flex items-center gap-1 pb-1 ${echipaActive ? 'text-gray-900' : 'hover:text-gray-900'}`}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  <span>ECHIPĂ</span>
                  <span className={`text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`}>▼</span>
                  <Underline active={echipaActive} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white/95 backdrop-blur border shadow-lg overflow-hidden"
                    >
                      <ul className="flex flex-col text-sm normal-case tracking-normal">
                        <li>
                          <Link to="/squad" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">
                            Lista jucători
                          </Link>
                        </li>
                        <li>
                          <Link to="/matches" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">
                            Meciuri
                          </Link>
                        </li>
                        <li>
                          <Link to="/results" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">
                            Rezultate
                          </Link>
                        </li>
                        <li>
                          <Link to="/standings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">
                            Clasament
                          </Link>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/donations" className="group relative pb-1 hover:text-gray-900">
                Donații
                <Underline active={isActive('/donations')} />
              </Link>

              <Link to="/contact" className="group relative pb-1 hover:text-gray-900">
                Contact
                <Underline active={isActive('/contact')} />
              </Link>

              {isAuthenticated ? (
                <button onClick={handleLogout} className="group relative pb-1 text-gray-700 hover:text-red-600">
                  LOGOUT
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform group-hover:scale-x-100 bg-red-500/70" />
                </button>
              ) : (
                <Link to="/login" className="group relative pb-1 hover:text-gray-900">
                  Login
                  <Underline active={isActive('/login')} />
                </Link>
              )}
            </nav>
          </div>

          {/* MOBILE BAR */}
          <div className="md:hidden flex items-center justify-between py-3">
            {/* logo left */}
            <Link to="/" onClick={handleMobileClose} aria-label="Mergi la pagina principală" className="flex-shrink-0">
              <motion.img
                src={logo}
                alt="ACS Viitorul Răchiteni"
                className="h-12 w-auto object-contain"
                whileHover={{ rotate: [0, -8, 8, -6, 6, -3, 3, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                whileTap={{ scale: 0.96 }}
              />
            </Link>

            <button
              className="rounded-md p-2 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(true)}
              aria-label="Deschide meniul"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE OVERLAY + PANEL */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50"
              onClick={handleMobileClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="fixed top-0 right-0 h-full w-2/3 sm:w-1/2 bg-white z-50 p-4 shadow-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Meniu</span>
                <button onClick={handleMobileClose} aria-label="Închide meniul" className="rounded-md p-2 hover:bg-gray-100">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ul className="mt-2 space-y-3 font-semibold text-[13px] tracking-wide uppercase text-gray-700">
                <li className="border-b pb-2">
                  <button
                    type="button"
                    onClick={() => setEchipaOpen((v) => !v)}
                    className="w-full text-left flex items-center justify-between px-1 py-2 rounded hover:bg-gray-50"
                    aria-expanded={echipaOpen}
                    aria-controls="echipa-submenu"
                  >
                    <span>Echipă</span>
                    <span className={`text-xs transition-transform ${echipaOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  <AnimatePresence>
                    {echipaOpen && (
                      <motion.ul
                        id="echipa-submenu"
                        className="mt-2 space-y-1 text-sm normal-case tracking-normal text-gray-700"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <li>
                          <Link to="/squad" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">
                            Lista jucători
                          </Link>
                        </li>
                        <li>
                          <Link to="/matches" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">
                            Meciuri
                          </Link>
                        </li>
                        <li>
                          <Link to="/results" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">
                            Rezultate
                          </Link>
                        </li>
                        <li>
                          <Link to="/standings" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">
                            Clasament
                          </Link>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>

                <li>
                  <Link to="/donations" onClick={handleMobileClose} className="block px-1 py-2 rounded hover:bg-gray-50">
                    Donații
                  </Link>
                </li>
                <li>
                  <Link to="/contact" onClick={handleMobileClose} className="block px-1 py-2 rounded hover:bg-gray-50">
                    Contact
                  </Link>
                </li>

                {isAuthenticated ? (
                  <li>
                    <button
                      type="button"
                      onClick={() => { handleLogout(); handleMobileClose(); }}
                      className="block w-full text-left px-1 py-2 rounded hover:bg-gray-50 text-red-600"
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <li>
                    <Link to="/login" onClick={handleMobileClose} className="block px-1 py-2 rounded hover:bg-gray-50">
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
