import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AuthProvider from '../context/AuthProvider';
import { BASE_URL } from '../utils/constants';
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false); // pentru dropdown desktop
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [echipaOpen, setEchipaOpen] = useState(false); // pentru dropdown mobil
  const menuRef = useRef();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
        setEchipaOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("am intrat aici")
      try {
        const response = await fetch(`${BASE_URL}/api/auth/status`, {
          credentials: 'include'
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location]);

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleMobileClose = () => {
    setShowMobileMenu(false);
    setEchipaOpen(false); // închide dropdown-ul „ECHIPĂ” când închizi meniul mobil
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="flex items-center justify-between max-w-[1440px] mx-auto px-4 py-3 md:px-48">
        {/* LOGO - vizibil mereu */}
        <Link to="/"><img src={logo} alt="Logo" className="h-10 w-auto object-contain" /></Link>

        {/* MENIU DESKTOP */}
        <nav className="hidden md:flex items-center space-x-6 font-medium text-sm relative">
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(prev => !prev)} className="flex items-center gap-1">
              <span className="hover:text-blue-600">ECHIPĂ</span>
              <span className="text-xs">▼</span>
            </button>
            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border shadow-md w-48 z-50">
                <ul className="flex flex-col text-center">
                  <Link to="/squad" onClick={() => setMenuOpen(false)} className="px-4 py-2 hover:bg-gray-100">Lista jucători</Link>
                  <Link to="/results" onClick={() => setMenuOpen(false)} className="px-4 py-2 hover:bg-gray-100">Rezultate</Link>
                  <Link to="/standings" onClick={() => setMenuOpen(false)} className="px-4 py-2 hover:bg-gray-100">Clasament</Link>

                </ul>
              </div>
            )}
          </div>
          <a href="#" className="hover:text-blue-600">DONAȚII</a>
          <a href="#" className="hover:text-blue-600">CONTACT</a>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="hover:text-red-600">LOGOUT</button>
          ) : (
            <Link to="/login" className="hover:text-blue-600">LOGIN</Link>
          )}
        </nav>

        {/* BURGER MENIU - mobil */}
        <button className="md:hidden" onClick={() => setShowMobileMenu(true)}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* MENIU MOBIL */}
      {showMobileMenu && (
        <div className="fixed top-0 right-0 h-full w-2/3 sm:w-1/2 bg-white shadow-lg z-50 p-4 overflow-y-auto">
          <div className="flex justify-end mb-4">
            <button onClick={handleMobileClose}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="space-y-3 font-medium text-sm">
            <li>
              <button
                onClick={() => setEchipaOpen(prev => !prev)}
                className="w-full text-center cursor-pointer hover:text-blue-600"
              >
                ECHIPĂ {echipaOpen ? '▲' : '▼'}
              </button>
              {echipaOpen && (
                <ul className="mt-2 space-y-2 text-sm pl-4 text-center text-gray-700">
                  <Link to="/squad" onClick={handleMobileClose}>Lista jucători</Link>
                  <Link to="/results" onClick={handleMobileClose}>Rezultate</Link>
                  <Link to="/standings" onClick={handleMobileClose}>Clasament</Link>

                </ul>
              )}
            </li>
            <li className="text-center cursor-pointer hover:text-blue-600" onClick={handleMobileClose}>DONAȚII</li>
            <li className="text-center cursor-pointer hover:text-blue-600" onClick={handleMobileClose}>CONTACT</li>
            {isAuthenticated ? (
              <li className="text-center cursor-pointer hover:text-red-600" onClick={() => { handleLogout(); handleMobileClose(); }}>
                LOGOUT
              </li>
            ) : (
              <li className="text-center cursor-pointer hover:text-blue-600" onClick={handleMobileClose}>
                <Link to="/login">LOGIN</Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
