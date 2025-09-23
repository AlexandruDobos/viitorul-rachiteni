/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdsDisplay from "../components/AdsDisplay";
import CookieBanner from "../components/CookieBanner";
import ScrollToTop from "../components/ScrollToTop";
import JsonLd from "../components/JsonLD";
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <ScrollToTop />
      <Navbar />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": ["SportsTeam", "Organization"],
        "name": "ACS Viitorul Răchiteni",
        "url": "https://viitorulrachiteni.ro/",
        "logo": "https://viitorulrachiteni.ro/logo-512.png",
        "image": "https://viitorulrachiteni.ro/logo-512.png",
        "sport": "Football",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Răchiteni",
          "addressRegion": "Iași",
          "addressCountry": "RO"
        },
        "sameAs": [
          "https://www.facebook.com/…",
          "https://www.instagram.com/…"
        ]
      }} />

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://viitorulrachiteni.ro/",
        "name": "ACS Viitorul Răchiteni",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://viitorulrachiteni.ro/stiri?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }} />
      <div className="pt-20 lg:pt-28 flex-grow">
        <div
          className="
            mx-auto max-w-[1800px]
            grid lg:grid-cols-[220px_minmax(0,1fr)_220px]
            gap-y-6 lg:gap-y-8
            gap-x-6 lg:gap-x-12 xl:gap-x-16
            px-4 sm:px-6 lg:px-10
            overflow-x-clip
          "
        >
          <aside className="hidden lg:block lg:pr-4">
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="px-1 text-[11px] font-medium text-gray-500">Parteneri</div>
              <AdsDisplay position="left" />
            </div>
          </aside>

          <main className="min-w-0 w-full pt-4 md:pt-6 pb-16 md:pb-20 lg:border-x lg:border-gray-100 lg:px-6 overflow-x-clip">
            <div className="lg:hidden mb-5 space-y-3 mt-8">
              <AdsDisplay position="left" />
            </div>

            <Outlet />

            <div className="lg:hidden mt-6 space-y-3">
              <AdsDisplay position="right" />
            </div>
          </main>

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
