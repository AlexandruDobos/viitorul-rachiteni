import React from 'react';
import Sidebar from '../components/Sidebar';
import AnnouncementsSection from '../components/AnnouncementsSection';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Layout cu sidebar pe stânga + conținut */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          {/* Un singur Sidebar (stânga) */}
          <aside className="hidden lg:block">
            <Sidebar />
          </aside>

          <main className="space-y-8">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white shadow">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#ffffff33,transparent_40%),radial-gradient(circle_at_80%_30%,#ffffff22,transparent_40%)]" />
              <div className="relative p-6 md:p-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold">ACS Viitorul Răchiteni</h1>
                    <p className="text-white/80 mt-1">
                      Știri, rezultate, program și informații despre echipă – totul într-un singur loc.
                    </p>
                  </div>

                  {/* CTA rapide (opțional) */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/squad"
                      className="px-4 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100"
                    >
                      Lotul echipei
                    </Link>
                    <Link
                      to="/results"
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-white/90"
                    >
                      Rezultate
                    </Link>
                    <Link
                      to="/standings"
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-white/90"
                    >
                      Clasament
                    </Link>
                    <Link
                      to="/donations"
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      Donează
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* ANUNȚURI */}
            <section>
              <AnnouncementsSection pageSize={4} />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
