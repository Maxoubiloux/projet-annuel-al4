'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountSidebar from '@/components/ui/AccountSidebar';

type Category = 'A' | 'A2' | 'A1';
type Status = 'available' | 'rented' | 'soon';

interface Favorite {
  id: string;
  brand: string;
  model: string;
  category: Category;
  pricePerDay: number;
  img: string;
  agency: string;
  status: Status;
}

const INITIAL_FAVORITES: Favorite[] = [
  { id: 'm1000r', brand: 'BMW', model: 'M 1000 R', category: 'A', pricePerDay: 240, img: '/images/motos/m1000r.jpg', agency: 'Paris', status: 'available' },
  { id: 'tenere700', brand: 'Yamaha', model: 'Ténéré 700', category: 'A2', pricePerDay: 115, img: '/images/motos/tenere700.jpg', agency: 'Lyon', status: 'available' },
  { id: 'fatboy', brand: 'Harley-Davidson', model: 'Fat Boy', category: 'A', pricePerDay: 190, img: '/images/motos/fatboy.jpg', agency: 'Marseille', status: 'rented' },
  { id: 'ninja650', brand: 'Kawasaki', model: 'Ninja 650', category: 'A2', pricePerDay: 95, img: '/images/motos/ninja_650.jpg', agency: 'Bordeaux', status: 'soon' },
];

const DOT_COLOR: Record<Category, string> = {
  A: '#7E2E32',
  A2: '#B5792F',
  A1: '#5d7a4a',
};

const STATUS_STYLE: Record<Status, { label: string; color: string; bg: string }> = {
  available: { label: 'Disponible', color: '#3d7a52', bg: '#E6F0E8' },
  rented: { label: 'Louée actuellement', color: '#9a3b35', bg: '#F8ECEA' },
  soon: { label: 'Bientôt disponible', color: '#8a6d2f', bg: '#F4ECDB' },
};

export default function FavorisPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>(INITIAL_FAVORITES);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  function removeFavorite(id: string) {
    setFavorites((favs) => favs.filter((f) => f.id !== id));
  }

  const countLabel = `${favorites.length} ${favorites.length > 1 ? 'motos enregistrées' : 'moto enregistrée'}`;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-16">

        {/* Header */}
        <div className="mb-9">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
            Espace client
          </p>
          <h1 className="font-serif font-semibold text-[56px] leading-none tracking-[-0.015em]">
            Mes favoris
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.26fr_0.74fr] gap-11 items-start">
          <AccountSidebar />

          <div>
            {favorites.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-[22px]">
                  <span className="font-mono text-[11px] tracking-[0.08em] text-[#8a7f63]">
                    {countLabel}
                  </span>
                  <Link
                    href="/motos"
                    className="text-[12.5px] text-[#7E2E32] border-b border-[#7E2E32] pb-[2px] hover:opacity-70 transition-opacity"
                  >
                    Découvrir d&apos;autres motos →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px]">
                  {favorites.map((f) => {
                    const status = STATUS_STYLE[f.status];
                    return (
                      <div
                        key={f.id}
                        className="relative bg-white border border-[#ECE5D5] rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_26px_48px_-30px_rgba(60,45,30,0.45)] transition-shadow"
                      >
                        <div
                          className="relative h-[188px] flex items-center justify-center p-[14px]"
                          style={{ background: 'radial-gradient(closest-side, #ffffff 60%, #faf7f0 100%)' }}
                        >
                          <span className="absolute top-[14px] left-[14px] flex items-center gap-[7px] font-mono text-[10px] tracking-[0.1em] text-[#5d5749] bg-white/90 border border-[#ECE5D5] px-[10px] py-1 rounded-full">
                            <span
                              className="w-[7px] h-[7px] rounded-full"
                              style={{ background: DOT_COLOR[f.category] }}
                            />
                            Permis {f.category}
                          </span>
                          <button
                            onClick={() => removeFavorite(f.id)}
                            title="Retirer des favoris"
                            className="absolute top-3 right-3 w-[34px] h-[34px] rounded-full bg-white border border-[#ECE5D5] flex items-center justify-center text-[15px] text-[#7E2E32] cursor-pointer hover:bg-[#7E2E32] hover:text-white hover:border-[#7E2E32] transition-colors"
                          >
                            ♥
                          </button>
                          <Image
                            src={f.img}
                            alt={f.model}
                            width={220}
                            height={158}
                            className="max-h-[158px] max-w-[90%] object-contain"
                          />
                        </div>
                        <div className="px-[22px] pt-5 pb-[22px] border-t border-[#F0EADB] flex flex-col flex-1">
                          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#7E2E32]">
                            {f.brand}
                          </div>
                          <h3 className="font-serif font-semibold text-[24px] leading-[1.05] mt-[5px] mb-3">
                            {f.model}
                          </h3>
                          <div className="flex items-center gap-[10px] flex-wrap mb-4">
                            <span className="font-mono text-[11px] text-[#8a7f63]">
                              Agence de {f.agency}
                            </span>
                            <span
                              className="font-mono text-[9.5px] tracking-[0.1em] uppercase px-[11px] py-[5px] rounded-full whitespace-nowrap"
                              style={{ color: status.color, background: status.bg }}
                            >
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <span className="text-[12px] text-[#9a8f74]">dès </span>
                              <span className="font-serif font-semibold text-[26px]">{f.pricePerDay}€</span>
                              <span className="text-[12px] text-[#9a8f74]"> /jour</span>
                            </div>
                            <Link
                              href={`/motos/${f.id}`}
                              className="whitespace-nowrap font-mono text-[11px] tracking-[0.06em] uppercase border border-[#1B1A17] px-[15px] py-[9px] rounded-full hover:bg-[#1B1A17] hover:text-[#F4F1E9] transition-colors"
                            >
                              Voir la fiche
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-[74px] px-[30px] border border-dashed border-[#d9cfb8] rounded-[18px] bg-[#FBF9F3]">
                <div className="w-[60px] h-[60px] rounded-full bg-[#F4ECE0] text-[#cdbfa0] flex items-center justify-center text-[26px] mx-auto mb-[22px]">
                  ♡
                </div>
                <h2 className="font-serif font-semibold italic text-[28px] text-[#1B1A17] mb-3">
                  Aucun favori pour le moment
                </h2>
                <p className="text-[14.5px] leading-[1.7] text-[#7a715a] max-w-[380px] mx-auto mb-[26px]">
                  Parcourez la collection et enregistrez les motos qui vous font envie pour les retrouver ici en un clin d&apos;œil.
                </p>
                <Link
                  href="/motos"
                  className="inline-block bg-[#7E2E32] text-[#F4F1E9] font-mono text-[13px] tracking-[0.04em] px-[30px] py-[14px] rounded-full hover:bg-[#651f23] transition-colors"
                >
                  Découvrir les motos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
