/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdsDisplay from "../components/AdsDisplay";
import CookieBanner from "../components/CookieBanner";
import ScrollToTop from "../components/ScrollToTop";

export default function PublicLayout() {
  return (
    // Blochează overflow-ul orizontal global
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* spațiu sub navbarul cu logo mare pentru conținutul central */}
      <div className="pt-20 lg:pt-28 flex-grow overflow-x-hidden">
        {/* 1 coloană pe mobil/tabletă; 3 coloane de la lg în sus */}
        <div
          className="
            w-full mx-auto max-w-[1800px]
            grid lg:grid-cols-[220px_minmax(0,1fr)_220px]
            gap-y-6 lg:gap-y-8
            gap-x-6 lg:gap-x-12 xl:gap-x-16
            px-4 sm:px-6 lg:px-10
            overflow-x-hidden
          "
        >
          {/* Sidebar stânga – doar ≥lg */}
          {/* -mt-20 lg:-mt-28 trage sidebarul sub navbar, ca înainte */}
          <aside className="hidden lg:block lg:pr-4 -mt-20 lg:-mt-28">
            {/* SCOS sticky ca să scrolleze odată cu pagina */}
            <div className="space-y-3">
              <div className="px-1 text-[11px] font-medium text-gray-500">Parteneri</div>
              <div className="overflow-x-hidden">
                <AdsDisplay position="left" />
              </div>
            </div>
          </aside>

          {/* Conținut central */}
          <main className="w-full pt-4 md:pt-6 pb-16 md:pb-20 lg:border-x lg:border-gray-100 lg:px-6 overflow-x-hidden">
            {/* Ads pe mobil/tabletă (sub lg) */}
            <div className="lg:hidden mb-5 mt-8 space-y-3 overflow-x-hidden">
              <AdsDisplay position="left" />
            </div>

            {/* Rutele publice */}
            <Outlet />

            {/* Ads jos pe mobil/tabletă */}
            <div className="lg:hidden mt-6 space-y-3 overflow-x-hidden">
              <AdsDisplay position="right" />
            </div>
          </main>

          {/* Sidebar dreapta – doar ≥lg */}
          <aside className="hidden lg:block lg:pl-4 -mt-20 lg:-mt-28">
            {/* SCOS sticky ca să scrolleze odată cu pagina */}
            <div className="space-y-3">
              <div className="px-1 text-[11px] font-medium text-gray-500">Parteneri</div>
              <div className="overflow-x-hidden">
                <AdsDisplay position="right" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CookieBanner />
      <Footer />
    </div>
  );
}
