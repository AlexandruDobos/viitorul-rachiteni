// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddPlayerForm from "../forms/AddPlayerForm";
import AddMatchForm from "../forms/AddMatchForm";
import AddTeamForm from "../forms/AddTeamForm";
import AdsManager from "../forms/AdsManager";
import ContactEditor from "../forms/ContactEditor";
import LogoEditor from "../forms/LogoEditor";
import AppNameEditor from "../forms/AppNameEditor";
import AddAnnouncementForm from "../forms/AddAnnouncementForm";
import StandingsManager from "../forms/StandingsManager";
import CompetitionsManager from "../forms/CompetitionsManager";
import SocialLinksAdmin from "./SocialLinksAdmin";

import logo from "../assets/logo.png";

const AdminPanel = () => {
  const navigate = useNavigate();

  // secțiune activă
  const [activeView, setActiveView] = useState("add-announcement");

  // sidebar desktop: colapsat/expandat (persistă)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("adminSidebarCollapsed") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("adminSidebarCollapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  // mobil: meniu tip "drawer"
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { key: "add-announcement", label: "Anunț nou" },
    { key: "competitions", label: "Competiții" },
    { key: "matches", label: "Meciuri" },
    { key: "add-player", label: "Jucători" },
    { key: "add-team", label: "Echipe" },
    { key: "manage-ads", label: "Reclame" },
    { key: "social", label: "Rețele sociale" },
    { key: "edit-contact", label: "Pagina Contact" },
    { key: "edit-logo", label: "Logo App" },
    { key: "edit-name", label: "Nume App" },
    { key: "edit-standings", label: "Editare clasament" },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "competitions":
        return <CompetitionsManager />;
      case "add-player":
        return <AddPlayerForm />;
      case "add-team":
        return <AddTeamForm />;
      case "matches":
        return <AddMatchForm />;
      case "manage-ads":
        return <AdsManager />;
      case "social":
        return <SocialLinksAdmin />;
      case "edit-contact":
        return <ContactEditor />;
      case "edit-logo":
        return <LogoEditor />;
      case "edit-name":
        return <AppNameEditor />;
      case "add-announcement":
        return <AddAnnouncementForm />;
      case "edit-standings":
        return <StandingsManager />;
      default:
        return <div>Selectează o acțiune din meniu.</div>;
    }
  };

  // pictograme simple
  const Icon = ({ name }) => {
    const base = "h-5 w-5 flex-shrink-0";
    switch (name) {
      case "ann":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5h18v2H3V5zm2 4h14l-2 10H7L5 9zm4 12a2 2 0 104 0H9z" />
          </svg>
        );
      case "comp":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h16v12H4z" />
            <path d="M2 18h20v2H2z" />
          </svg>
        );
      case "match":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2h10v4H7zM3 8h18v12H3z" />
          </svg>
        );
      case "player":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a5 5 0 110 10 5 5 0 010-10zM4 20a8 8 0 0116 0v2H4v-2z" />
          </svg>
        );
      case "team":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10a3 3 0 110-6 3 3 0 010 6zm10 0a3 3 0 110-6 3 3 0 010 6zM2 20a5 5 0 015-5h2a5 5 0 015 5v2H2v-2zm13 2v-2a5 5 0 015-5h2v7h-7z" />
          </svg>
        );
      case "ads":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 4h18v4H3zM3 10h18v10H3z" />
          </svg>
        );
      case "social":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a5 5 0 015 5v3h3a5 5 0 110 10H4a5 5 0 110-10h3V7a5 5 0 015-5z" />
          </svg>
        );
      case "contact":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 4h20v14H2z" />
            <path d="M2 20h20v2H2z" />
          </svg>
        );
      case "logo":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 4v16M4 12h16" stroke="#fff" strokeWidth="1.5" />
          </svg>
        );
      case "name":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 4h18v4H3zM3 10h10v10H3zM15 10h6v10h-6z" />
          </svg>
        );
      case "table":
        return (
          <svg className={base} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 4h18v16H3zM3 10h18M9 4v16" />
          </svg>
        );
      default:
        return null;
    }
  };

  const desktopNavButton = (key, label, iconName) => {
    const active = activeView === key;
    return (
      <button
        key={key}
        onClick={() => setActiveView(key)}
        className={[
          "group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
          active
            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow"
            : "hover:bg-gray-200 text-gray-800",
        ].join(" ")}
        title={label}
      >
        <Icon name={iconName} />
        {!collapsed && <span className="truncate">{label}</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ===== MOBILE TOP BAR ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 border-b bg-white">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            aria-label="Mergi la site-ul public"
          >
            <img src={logo} alt="ACS Viitorul Răchiteni" className="h-10 w-auto object-contain" />
            <span className="text-sm font-semibold">ACSVR — Admin</span>
          </button>

          {/* FIX: icon cu stroke, altfel nu se vede pe unele browsere */}
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Deschide meniul"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* overlay + drawer mobil */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="lg:hidden fixed top-0 right-0 z-50 h-full w-4/5 max-w-xs bg-white shadow-xl p-4 transform transition-transform duration-200"
            style={{ transform: "translateX(0)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Meniu Admin</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Închide meniul"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 18L18 6" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="mt-3 space-y-2">
              {menuItems.map(({ key, label }) => {
                const iconName =
                  key === "add-announcement"
                    ? "ann"
                    : key === "competitions"
                    ? "comp"
                    : key === "matches"
                    ? "match"
                    : key === "add-player"
                    ? "player"
                    : key === "add-team"
                    ? "team"
                    : key === "manage-ads"
                    ? "ads"
                    : key === "social"
                    ? "social"
                    : key === "edit-contact"
                    ? "contact"
                    : key === "edit-logo"
                    ? "logo"
                    : key === "edit-name"
                    ? "name"
                    : key === "edit-standings"
                    ? "table"
                    : null;

                const active = activeView === key;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveView(key);
                      setMobileOpen(false);
                    }}
                    className={[
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                      active ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-800",
                    ].join(" ")}
                  >
                    <Icon name={iconName} />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* spacer pentru top bar pe mobil */}
      <div className="lg:hidden h-[52px] w-px" aria-hidden />

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={[
          "hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-[width] duration-300",
          collapsed ? "w-16" : "w-64",
        ].join(" ")}
      >
        {/* Header sidebar cu logo → home */}
        <div className="flex items-center justify-between gap-2 px-3 py-3 border-b">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            title="Mergi la site-ul public"
          >
            <img src={logo} alt="ACS Viitorul Răchiteni" className="h-10 w-auto object-contain" />
            {!collapsed && <span className="font-semibold text-sm">ACSVR — Admin</span>}
          </button>
        </div>

        {/* Control collapse */}
        <div className="px-3 py-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-full flex items-center justify-center rounded-lg border border-gray-200 px-2 py-2 text-xs hover:bg-gray-50"
            aria-label="Comută lățimea meniului"
            title={collapsed ? "Extinde meniul" : "Restrânge meniul"}
          >
            {collapsed ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Meniu */}
        <nav className="mt-2 px-2 space-y-1 overflow-y-auto">
          {menuItems.map(({ key, label }) => {
            const iconName =
              key === "add-announcement"
                ? "ann"
                : key === "competitions"
                ? "comp"
                : key === "matches"
                ? "match"
                : key === "add-player"
                ? "player"
                : key === "add-team"
                ? "team"
                : key === "manage-ads"
                ? "ads"
                : key === "social"
                ? "social"
                : key === "edit-contact"
                ? "contact"
                : key === "edit-logo"
                ? "logo"
                : key === "edit-name"
                ? "name"
                : key === "edit-standings"
                ? "table"
                : null;

            return desktopNavButton(key, label, iconName);
          })}
        </nav>

        <div className="mt-auto p-3 text-[11px] text-gray-500">
          {!collapsed ? "Panou administrare" : "Admin"}
        </div>
      </aside>

      {/* ===== CONȚINUT ===== */}
      <main className="flex-1 p-4 md:p-8">{renderContent()}</main>
    </div>
  );
};

export default AdminPanel;
