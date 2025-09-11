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

      {/* spațiu sub navbarul cu logo mare */}
      <div className="pt-20 lg:pt-28 flex-grow overflow-x-hidden">
        {/* 
          Pe desktop:
          - min-height = înălțimea viewportului minus navbar (~7rem)
          - overflow hidden ca să nu apară scroll pe pagină; scrollează doar main
        */}
        <div
          className="
            w-full mx-auto max-w-[1800px]
            grid lg:grid-cols-[220px_minmax(0,1fr)_220px]
            gap-y-6 lg:gap-y-8
            gap-x-6 lg:gap-x-12 xl:gap-x-16
            px-4 sm:px-6 lg:px-10
            overflow-x-hidden
            lg:min-h-[calc(100vh-7rem)]
            lg:overflow-hidden
          "
        >
          {/* Sidebar stânga – sticky sub navbar */}
          <aside className="hidden lg:block lg:pr-4">
            <div className="lg:sticky lg:top-28 space-y-3">
              <div className="px-1 text-[11px] font-medium text-gray-500">Parteneri</div>
              <div className="overflow-x-hidden">
                <AdsDisplay position="left" />
              </div>
            </div>
          </aside>

          {/* Conținut central – scrollează doar aici pe desktop */}
          <main
            className="
              w-full pt-4 md:pt-6 pb-16 md:pb-20
              lg:border-x lg:border-gray-100 lg:px-6
              overflow-x-hidden
              lg:overflow-y-auto lg:max-h-[calc(100vh-7rem)]
            "
          >
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

          {/* Sidebar dreapta – sticky sub navbar */}
          <aside className="hidden lg:block lg:pl-4">
            <div className="lg:sticky lg:top-28 space-y-3">
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
