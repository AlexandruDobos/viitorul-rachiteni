// src/layouts/PublicLayout.jsx
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* SEO/meta și scroll reset pentru paginile publice */}
      <ScrollToTop />

      <Navbar />

      {/* spațiu sub navbarul cu logo mare */}
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

          {/* Conținut central */}
          <main className="w-full pt-4 md:pt-6 pb-16 md:pb-20 lg:border-x lg:border-gray-100 lg:px-6">
            {/* Ads pe mobil/tabletă (sub lg) */}
            <div className="lg:hidden mb-5 space-y-3 mt-8">
              <AdsDisplay position="left" />
            </div>

            {/* Aici se vor randă rutele publice */}
            <Outlet />

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

      <CookieBanner />
      <Footer />
    </div>
  );
}
