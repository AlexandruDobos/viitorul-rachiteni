import React from 'react';
import Sidebar from '../components/Sidebar';
import AnnouncementCard from '../components/AnnoucementCard';

const Home = () => {
  return (
    <div className="pt-20 flex">
      <Sidebar />

      <main className="flex-1 p-4">
        <section className="text-center mb-6">
          <h2 className="text-xl font-bold">LOT JUCĂTORI</h2>
          <div className="flex justify-center space-x-4 mt-2 text-sm">
            <div>
              <h3 className="font-semibold">REZULTATE</h3>
              <p>2024-2025</p>
              <p>2025-2026</p>
            </div>
            <div>
              <h3 className="font-semibold">CLASAMENT</h3>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnnouncementCard title="ANUNȚ 1" />
          <AnnouncementCard title="ANUNȚ 2" />
          <AnnouncementCard title="ANUNȚ 3" />
          <AnnouncementCard title="ANUNȚ 4" />
        </section>
      </main>

      <Sidebar />
    </div>
  );
};

export default Home;
