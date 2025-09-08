import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

function centsToHuman(v, currency) {
  if (typeof v !== 'number') return '';
  return `${(v/100).toFixed(2)} ${currency?.toUpperCase()}`;
}

export default function DonationsSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (!sessionId) return;
        const res = await fetch(`${BASE_URL}/donations/session/${sessionId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!ignore) setData(json);
      } catch { /* noop */ }
    }
    load();
    return () => { ignore = true; };
  }, [sessionId]);

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto rounded-2xl bg-white shadow ring-1 ring-gray-200 p-6 text-center">
        <div className="text-3xl">🎉 Mulțumim!</div>
        <p className="mt-2 text-gray-600">
          Plata a fost procesată cu succes prin Stripe.
        </p>

        {data && (
          <div className="mt-4 text-sm text-gray-700">
            <div>ID sesiune: <code className="text-gray-500">{data.id}</code></div>
            <div>Suma: <b>{centsToHuman(data.amountTotal, data.currency)}</b></div>
            {data.customerEmail && <div>Email: {data.customerEmail}</div>}
            <div>Status: <b>{data.paymentStatus}</b></div>
          </div>
        )}

        <Link to="/" className="mt-6 inline-flex items-center justify-center px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
          Înapoi la site
        </Link>
      </div>
    </div>
  );
}
