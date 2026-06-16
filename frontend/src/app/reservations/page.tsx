'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountSidebar from '@/components/ui/AccountSidebar';

const UPCOMING = [
  {
    id: 's1000rr',
    brand: 'BMW',
    model: 'S 1000 RR',
    img: '/images/motos/s1000rr.jpg',
    from: '13/06',
    to: '16/06',
    days: 3,
    total: 540,
    agency: 'Paris',
    ref: 'CMY-2026-5320',
    status: 'Confirmée',
  },
  {
    id: 'streettriple',
    brand: 'Triumph',
    model: 'Street Triple 765 RS',
    img: '/images/motos/streettriple765rs.jpg',
    from: '02/07',
    to: '05/07',
    days: 3,
    total: 435,
    agency: 'Lyon',
    ref: 'CMY-2026-4188',
    status: 'À venir',
  },
];

const PAST = [
  {
    id: 'mt07',
    brand: 'Yamaha',
    model: 'MT-07',
    img: '/images/motos/mt07.jpg',
    from: '12/04',
    to: '14/04',
    days: 2,
    total: 170,
    agency: 'Bordeaux',
    ref: 'CMY-2026-2210',
    status: 'Terminée',
  },
  {
    id: 'monster937',
    brand: 'Ducati',
    model: 'Monster 937',
    img: '/images/motos/monster937.jpg',
    from: '20/02',
    to: '23/02',
    days: 3,
    total: 420,
    agency: 'Paris',
    ref: 'CMY-2026-1043',
    status: 'Terminée',
  },
];

function StatusBadge({ status }: { status: string }) {
  const base = 'font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-[6px] rounded-full';
  if (status === 'Terminée')
    return <span className={`${base} text-[#9a8f74] bg-[#F1ECE0]`}>{status}</span>;
  if (status === 'À venir')
    return <span className={`${base} text-[#7E2E32] bg-[#F6E9E6]`}>{status}</span>;
  return <span className={`${base} text-[#3d7a52] bg-[#E6F0E8]`}>{status}</span>;
}

export default function ReservationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const firstName = user?.firstName ?? 'vous';

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5 mb-9">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
              Espace client
            </p>
            <h1 className="font-serif font-semibold text-[56px] leading-none tracking-[-0.015em]">
              Bonjour,{' '}
              <span className="italic text-[#7E2E32]">{firstName}</span>
            </h1>
          </div>
          <div className="flex gap-9 text-right">
            {[
              { value: '4', label: 'Réservations' },
              { value: '1 240', label: 'Km parcourus' },
              { value: '2024', label: 'Membre depuis' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif font-semibold text-[30px] leading-none">{s.value}</div>
                <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#8a7f63] mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.26fr_0.74fr] gap-11 items-start">
          <AccountSidebar />

          <div>
            <h2 className="font-serif font-semibold text-[28px] mb-[18px]">À venir</h2>
            <div className="flex flex-col gap-[14px] mb-11">
              {UPCOMING.map((r) => (
                <div
                  key={r.ref}
                  className="bg-white border border-[#ECE5D5] rounded-[14px] px-[22px] py-5 grid grid-cols-[120px_1fr_auto] gap-[22px] items-center"
                >
                  <div className="h-20 bg-white border border-[#F0EADB] rounded-[10px] flex items-center justify-center p-2"
                    style={{ background: 'radial-gradient(closest-side, #ffffff 60%, #faf7f0 100%)' }}
                  >
                    <Image
                      src={r.img}
                      alt={r.model}
                      width={100}
                      height={64}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-[7px]">
                      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#7E2E32]">
                        {r.brand}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <h3 className="font-serif font-semibold text-[24px] leading-none mb-[6px]">
                      {r.model}
                    </h3>
                    <p className="font-mono text-[11px] text-[#8a7f63]">
                      {r.from} → {r.to} · {r.days} jours · Agence de {r.agency} · {r.ref}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif font-semibold text-[26px]">{r.total}€</div>
                    <Link
                      href={`/motos/${r.id}`}
                      className="inline-block text-[12px] text-[#1B1A17] border-b border-[#b9a87f] pb-[2px] mt-2 hover:text-[#7E2E32] hover:border-[#7E2E32] transition-colors"
                    >
                      Gérer →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="font-serif font-semibold text-[28px] mb-[18px]">Historique</h2>
            <div className="flex flex-col gap-[14px]">
              {PAST.map((r) => (
                <div
                  key={r.ref}
                  className="bg-[#FBF9F3] border border-[#ECE5D5] rounded-[14px] px-[22px] py-[18px] grid grid-cols-[90px_1fr_auto] gap-[22px] items-center"
                >
                  <div
                    className="h-[60px] border border-[#F0EADB] rounded-[10px] flex items-center justify-center p-[6px]"
                    style={{ background: 'radial-gradient(closest-side, #ffffff 60%, #f7f3ec 100%)' }}
                  >
                    <Image
                      src={r.img}
                      alt={r.model}
                      width={80}
                      height={52}
                      className="max-w-full max-h-full object-contain opacity-85"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-[5px]">
                      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#a0967f]">
                        {r.brand}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <h3 className="font-serif font-semibold text-[21px] leading-none mb-[5px] text-[#3c352c]">
                      {r.model}
                    </h3>
                    <p className="font-mono text-[11px] text-[#9a8f74]">
                      {r.from} → {r.to} · {r.days} jours · Agence de {r.agency}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif font-semibold text-[22px] text-[#3c352c]">
                      {r.total}€
                    </div>
                    <Link
                      href="#"
                      className="inline-block text-[12px] text-[#7a715a] border-b border-[#d9cfb8] pb-[2px] mt-[7px] hover:text-[#7E2E32] transition-colors"
                    >
                      Contrat →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
