'use client';

import { Motorbike } from '@/types';
import { motosService } from '@/services/motos.service';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const categoryDot: Record<string, string> = {
  A: '#7E2E32',
  A2: '#B5792F',
  A1: '#5d7a4a',
};

const STYLES = ['Tous', 'Sportive', 'Roadster', 'Trail', 'Custom', 'Touring'] as const;
const CATEGORIES = ['Tous', 'A', 'A2', 'A1'] as const;

export default function MotosPage() {
  const [motos, setMotos] = useState<Motorbike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('Tous');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const loadMotos = () => {
    setLoading(true);
    setError(null);
    motosService.getAll()
      .then(setMotos)
      .catch((e) => setError(e.message || 'Erreur lors du chargement des motos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    motosService.getAll()
      .then((data) => {
        if (active) setMotos(data);
      })
      .catch((e) => {
        if (active) setError(e.message || 'Erreur lors du chargement des motos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleReset = () => {
    setSelectedStyle('Tous');
    setSelectedCategory('Tous');
  };

  const filteredMotos = motos.filter((m) => {
    const styleMatch = selectedStyle === 'Tous' || m.style === selectedStyle;
    const catMatch = selectedCategory === 'Tous' || m.category === selectedCategory;
    return styleMatch && catMatch;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-5">
        <div className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
            La collection
          </p>
          <h1 className="font-serif font-semibold text-[60px] leading-none tracking-[-0.015em] mb-3">
            Nos motos
          </h1>
          <p className="text-[16px] text-[#56503f] max-w-[520px]">
            Choisissez votre compagnon de route. Chaque modèle est récent, contrôlé et prêt à partir depuis nos agences.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 items-start pb-7 border-b border-[#E4DECF] mb-8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a0967f] mb-3">Style</p>
            <div className="flex gap-[10px] flex-wrap">
              {STYLES.map((s) => {
                const active = selectedStyle === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(s)}
                    className={`text-[12px] tracking-[0.08em] uppercase px-[18px] py-[9px] rounded-full border transition-all ${active
                        ? 'border-[#1B1A17] bg-[#1B1A17] text-[#F4F1E9]'
                        : 'border-[#E4DECF] bg-white text-[#5d5749] hover:border-[#1B1A17] hover:text-[#1B1A17]'
                      }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a0967f] mb-3">Permis</p>
            <div className="flex gap-[10px] flex-wrap">
              {CATEGORIES.map((c) => {
                const active = selectedCategory === c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`text-[12px] tracking-[0.08em] uppercase px-[18px] py-[9px] rounded-full border transition-all ${active
                        ? 'border-[#1B1A17] bg-[#1B1A17] text-[#F4F1E9]'
                        : 'border-[#E4DECF] bg-white text-[#5d5749] hover:border-[#1B1A17] hover:text-[#1B1A17]'
                      }`}
                  >
                    {c === 'Tous' ? 'Tous' : `Permis ${c}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ml-auto self-end">
            <span className="font-mono text-[12px] text-[#8a7f63]">
              {filteredMotos.length} {filteredMotos.length > 1 ? 'modèles' : 'modèle'}
            </span>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#ECE5D5] rounded-[14px] overflow-hidden animate-pulse">
                <div className="h-[200px] bg-[#ece8df]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-[#ece8df] rounded w-1/3" />
                  <div className="h-6 bg-[#ece8df] rounded w-2/3" />
                  <div className="h-3 bg-[#ece8df] rounded w-full" />
                  <div className="h-10 bg-[#ece8df] rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20 border border-dashed border-[#d9cfb8] rounded-[16px] bg-[#fbf9f3]">
            <p className="font-serif italic text-[24px] text-[#8a7f63] mb-4">⚠️ {error}</p>
            <button
              onClick={loadMotos}
              className="text-[13px] text-[#7E2E32] border-b border-[#7E2E32] pb-[2px] hover:opacity-70 transition-opacity"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMotos.map((moto) => (
                <div
                  key={moto.id}
                  className="bg-white border border-[#ECE5D5] rounded-[14px] overflow-hidden hover:shadow-[0_28px_50px_-30px_rgba(60,45,30,0.45)] transition-shadow"
                >
                  <div
                    className="relative h-[200px] flex items-center justify-center p-3"
                    style={{ background: 'radial-gradient(closest-side, #ffffff 60%, #faf7f0 100%)' }}
                  >
                    <span className="absolute top-3 left-3 flex items-center gap-[7px] font-mono text-[10px] tracking-[0.1em] text-[#5d5749] bg-white/90 border border-[#ECE5D5] px-[10px] py-1 rounded-full">
                      <span
                        className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                        style={{ background: categoryDot[moto.category] ?? '#9a8f74' }}
                      />
                      Permis {moto.category}
                    </span>
                    <span className="absolute top-3 right-3 font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#9a8f74]">
                      {moto.style}
                    </span>
                    <Image
                      src={moto.imageUrl}
                      alt={moto.model}
                      width={280}
                      height={172}
                      className="max-h-[172px] w-auto object-contain"
                    />
                  </div>

                  <div className="px-6 pt-[22px] pb-6 border-t border-[#F0EADB]">
                    <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[#7E2E32]">
                      {moto.brand}
                    </p>
                    <h3 className="font-serif font-semibold text-[26px] leading-[1.05] mt-[5px] mb-3">
                      {moto.model}
                    </h3>
                    <div className="flex gap-4 font-mono text-[12px] text-[#8a7f63] mb-[18px]">
                      <span>{moto.hp} ch</span>
                      <span>{moto.range} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[12px] text-[#9a8f74]">dès </span>
                        <span className="font-serif font-semibold text-[28px]">{moto.pricePerDay}€</span>
                        <span className="text-[12px] text-[#9a8f74]"> /jour</span>
                      </div>
                      <Link
                        href={`/motos/${moto.id}`}
                        className="font-mono text-[11.5px] tracking-[0.1em] uppercase border border-[#1B1A17] px-4 py-[9px] rounded-full hover:bg-[#1B1A17] hover:text-[#F4F1E9] transition-colors"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMotos.length === 0 && (
              <div className="text-center py-[90px] border border-dashed border-[#d9cfb8] rounded-[16px] bg-[#fbf9f3]">
                <p className="font-serif italic text-[24px] text-[#8a7f63] mb-3">
                  Aucune moto ne correspond à votre recherche.
                </p>
                <button
                  onClick={handleReset}
                  className="text-[13px] text-[#7E2E32] border-b border-[#7E2E32] pb-[2px] hover:opacity-70 transition-opacity"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
