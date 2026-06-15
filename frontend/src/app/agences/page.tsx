'use client';

import Link from 'next/link';
import { useState } from 'react';

const AGENCES = [
  { city: 'Paris', addr: '12 rue de Rivoli · 75004', hours: 'Lun–Sam · 08h–20h', count: '28 motos', x: 47, y: 30 },
  { city: 'Lille', addr: '22 rue Faidherbe · 59000', hours: 'Lun–Sam · 09h–19h', count: '11 motos', x: 54, y: 14 },
  { city: 'Lyon', addr: '5 quai Saint-Antoine · 69002', hours: 'Lun–Sam · 09h–19h', count: '19 motos', x: 62, y: 58 },
  { city: 'Bordeaux', addr: "7 cours de l'Intendance · 33000", hours: 'Lun–Ven · 09h–18h', count: '14 motos', x: 30, y: 62 },
  { city: 'Marseille', addr: '18 La Canebière · 13001', hours: 'Lun–Sam · 09h–19h', count: '22 motos', x: 66, y: 80 },
  { city: 'Nantes', addr: '3 place du Commerce · 44000', hours: 'Lun–Sam · 09h–19h', count: '9 motos', x: 22, y: 46 },
  { city: 'Strasbourg', addr: '14 rue des Grandes Arcades · 67000', hours: 'Lun–Sam · 09h–18h', count: '12 motos', x: 76, y: 24 },
  { city: 'Nice', addr: '6 avenue Jean-Médecin · 06000', hours: 'Lun–Sam · 09h–19h', count: '17 motos', x: 72, y: 84 },
];

export default function AgencesPage() {
  const [search, setSearch] = useState('');

  const filtered = AGENCES.filter(
    (a) => a.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-5">
        <div className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
            Le réseau
          </p>
          <h1 className="font-serif font-semibold text-[60px] leading-none tracking-[-0.015em] mb-3">
            Nos agences
          </h1>
          <p className="text-[16px] text-[#56503f] max-w-[540px]">
            Plus de cinquante agences partout en France. Retirez votre moto où vous le souhaitez,
            et rendez-la dans une autre ville si le voyage l&apos;exige.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-11 items-start">
          {/* Agency list */}
          <div>
            <div className="relative mb-[18px]">
              <input
                type="text"
                placeholder="Rechercher une ville…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-[#E4DECF] bg-white rounded-[12px] px-[18px] py-[15px] text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-[#d9cfb8] rounded-[14px]">
                  <p className="font-serif italic text-[20px] text-[#8a7f63]">
                    Aucune agence trouvée pour &laquo;&nbsp;{search}&nbsp;&raquo;
                  </p>
                </div>
              ) : (
                filtered.map((a) => (
                  <Link
                    key={a.city}
                    href="/motos"
                    className="group bg-white border border-[#ECE5D5] rounded-[14px] px-6 py-[22px] flex items-center justify-between gap-4 hover:border-[#7E2E32] hover:shadow-[0_20px_40px_-28px_rgba(60,45,30,0.4)] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-[10px] mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#7E2E32] flex-shrink-0" />
                        <h3 className="font-serif font-semibold text-[26px] leading-none">{a.city}</h3>
                      </div>
                      <p className="text-[13px] text-[#7a715a]">{a.addr}</p>
                      <p className="font-mono text-[11px] tracking-[0.06em] text-[#a0967f] mt-[5px]">
                        {a.hours}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap flex-shrink-0">
                      <p className="font-mono text-[11px] tracking-[0.08em] text-[#7E2E32]">{a.count}</p>
                      <span className="inline-block text-[12px] text-[#1B1A17] border-b border-[#b9a87f] pb-[2px] mt-2 group-hover:border-[#7E2E32] group-hover:text-[#7E2E32] transition-colors">
                        Voir les motos →
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div
              className="relative h-[580px] rounded-[18px] overflow-hidden border border-[#ECE5D5]"
              style={{
                background:
                  'repeating-linear-gradient(45deg,#F1ECE0,#F1ECE0 11px,#EEE8DA 11px,#EEE8DA 22px)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg,rgba(244,241,233,0.2),rgba(244,241,233,0.55))',
                }}
              />

              {AGENCES.map((a) => (
                <div
                  key={a.city}
                  className="absolute flex flex-col items-center gap-[5px]"
                  style={{
                    left: `${a.x}%`,
                    top: `${a.y}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <span className="bg-white border border-[#E4DECF] font-mono text-[10px] tracking-[0.08em] text-[#1B1A17] px-[9px] py-1 rounded-full whitespace-nowrap shadow-[0_6px_14px_-8px_rgba(60,45,30,0.5)]">
                    {a.city}
                  </span>
                  <span
                    className="w-[13px] h-[13px] rounded-full bg-[#7E2E32] border-[2.5px] border-[#F4F1E9]"
                    style={{ boxShadow: '0 4px 10px -3px rgba(126,46,50,0.7)' }}
                  />
                </div>
              ))}

              <div className="absolute bottom-[18px] left-[18px] font-mono text-[10px] tracking-[0.18em] uppercase text-[#8a7f63] bg-[rgba(244,241,233,0.85)] px-3 py-2 rounded-[8px]">
                Carte interactive · intégration à venir
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
