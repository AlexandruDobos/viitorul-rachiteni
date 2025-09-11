/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { BASE_URL } from '../utils/constants';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [echipaOpen, setEchipaOpen] = useState(false);

  const { user, loading, setUser, checkAuth } = useContext(AuthContext);
  const leftMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (leftMenuRef.current && !leftMenuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    checkAuth?.();
    setMenuOpen(false);
    setShowMobileMenu(false);
    setEchipaOpen(false);
  }, [location, checkAuth]);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMobileMenu]);

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
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

  const isActive = (path) => location.pathname.startsWith(path);
  const echipaActive = ['/stiri', '/squad', '/matches', '/results', '/standings'].some((p) =>
    location.pathname.startsWith(p)
  );

  const Underline = ({ active }) => (
    <span
      className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform
        ${active ? 'scale-x-100' : 'group-hover:scale-x-100'}
        bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500`}
    />
  );

  const isAuthenticated = !!user;

  const navItemVariants = {
    hidden: { opacity: 0, y: -6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };
  const navListVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const mobileItemVariants = { hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.25 } } };
  const mobileListVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

  return (
    <header className="fixed top-0 left-0 w-full z-50 overflow-x-clip">
      <div className="w-full backdrop-blur-md bg-white/80 border-b border-gray-100 px-4 md:px-6 lg:px-10 [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)]">
        <div className="max-w-[1440px] mx-auto min-w-0">
          {/* DESKTOP BAR */}
          <div className="hidden md:flex items-center justify-between py-2">
            <Link to="/" aria-label="Mergi la pagina principală" className="relative flex items-center">
              <motion.img
                src={logo}
                alt="ACS Viitorul Răchiteni"
                className="h-24 md:h-28 w-auto object-contain drop-shadow"
                whileHover={{ rotate: [0, -8, 8, -6, 6, -3, 3, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                whileTap={{ scale: 0.96 }}
              />
            </Link>

            <motion.nav
              ref={leftMenuRef}
              className="flex items-center gap-7 font-semibold text-xs md:text-sm lg:text-base tracking-wide uppercase text-gray-800"
              variants={navListVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={navItemVariants} className="relative flex items-center">
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
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute top-full mt-2 left-0 w-56 rounded-xl bg-white shadow-lg border overflow-hidden"
                    >
                      <ul className="flex flex-col text-xs md:text-sm uppercase tracking-wide text-gray-700">
                        <li><Link to="/stiri" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">ȘTIRI</Link></li>
                        <li><Link to="/squad" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">LISTA JUCĂTORI</Link></li>
                        <li><Link to="/matches" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">MECIURI</Link></li>
                        <li><Link to="/results" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">REZULTATE</Link></li>
                        <li><Link to="/standings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50">CLASAMENT</Link></li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={navItemVariants} className="flex items-center">
                <Link to="/donations" className="group relative pb-1 hover:text-gray-900">
                  DONAȚII
                  <Underline active={isActive('/donations')} />
                </Link>
              </motion.div>

              <motion.div variants={navItemVariants} className="flex items-center">
                <Link to="/contact" className="group relative pb-1 hover:text-gray-900">
                  CONTACT
                  <Underline active={isActive('/contact')} />
                </Link>
              </motion.div>

              <motion.div variants={navItemVariants} className="flex items-center">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="group relative pb-1 text-gray-700 hover:text-red-600">
                    LOGOUT
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform group-hover:scale-x-100 bg-red-500/70" />
                  </button>
                ) : (
                  <Link to="/login" className="group relative pb-1 hover:text-gray-900">
                    LOGIN
                    <Underline active={isActive('/login')} />
                  </Link>
                )}
              </motion.div>
            </motion.nav>
          </div>

          {/* MOBILE BAR */}
          <div className="md:hidden flex items-center justify-between py-3">
            <Link to="/" onClick={handleMobileClose} aria-label="Mergi la pagina principală" className="flex-shrink-0">
              <motion.img
                src={logo}
                alt="ACS Viitorul Răchiteni"
                className="h-20 w-auto object-contain"
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
              className="fixed top-0 right-0 h-full w-2/3 sm:w-1/2 bg-white z-50 p-4 shadow-xl font-[Poppins,sans-serif]"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">MENIU</span>
                <button onClick={handleMobileClose} aria-label="Închide meniul" className="rounded-md p-2 hover:bg-gray-100">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <motion.ul
                className="mt-2 space-y-3 font-semibold text-sm uppercase tracking-wide text-gray-700"
                variants={mobileListVariants}
                initial="hidden"
                animate="show"
              >
                <motion.li variants={mobileItemVariants} className="border-b pb-2">
                  <button
                    type="button"
                    onClick={() => setEchipaOpen((v) => !v)}
                    className="w-full text-left flex items-center justify-between px-1 py-2 rounded hover:bg-gray-50"
                    aria-expanded={echipaOpen}
                    aria-controls="echipa-submenu"
                  >
                    <span>ECHIPĂ</span>
                    <span className={`text-xs transition-transform ${echipaOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  <AnimatePresence>
                    {echipaOpen && (
                      <motion.ul
                        id="echipa-submenu"
                        className="mt-2 space-y-1 text-xs uppercase tracking-wide text-gray-700"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <li><Link to="/stiri" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">ȘTIRI</Link></li>
                        <li><Link to="/squad" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">LISTA JUCĂTORI</Link></li>
                        <li><Link to="/matches" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">MECIURI</Link></li>
                        <li><Link to="/results" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">REZULTATE</Link></li>
                        <li><Link to="/standings" onClick={handleMobileClose} className="block px-2 py-1 rounded hover:bg-gray-50">CLASAMENT</Link></li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>

                <motion.li variants={mobileItemVariants}>
                  <Link to="/donations" onClick={handleMobileClose} className="block px-1 py-2 rounded hover:bg-gray-50">
                    DONAȚII
                  </Link>
                </motion.li>
                <motion.li variants={mobileItemVariants}>
                  <Link to="/contact" onClick={handleMobileClose} className="block px-1 py-2 rounded hover:bg-gray-50">
                    CONTACT
                  </Link>
                </motion.li>

                {isAuthenticated ? (
                  <motion.li variants={mobileItemVariants}>
                    <button
                      type="button"
                      onClick={() => { handleLogout(); handleMobileClose(); }}
                      className="block w-full text-left px-1 py-2 rounded hover:bg-gray-50 text-red-600"
                    >
                      LOGOUT
                    </button>
                  </motion.li>
                ) : (
                  <motion.li variants={mobileItemVariants}>
                    <Link to="/login" onClick={handleMobileClose} className="block px-1 py-2 rounded hover:bg-gray-50">
                      LOGIN
                    </Link>
                  </motion.li>
                )}
              </motion.ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
