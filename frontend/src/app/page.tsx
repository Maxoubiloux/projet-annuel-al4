import Image from 'next/image';
import Link from 'next/link';

const UNIVERS = [
  { no: '01', name: 'Sportive', desc: 'Pour les sensations pures et la piste.', count: '12 modèles' },
  { no: '02', name: 'Roadster', desc: 'Le plaisir polyvalent au quotidien.', count: '9 modèles' },
  { no: '03', name: 'Trail', desc: 'Confort et aventure sur tous les terrains.', count: '7 modèles' },
  { no: '04', name: 'Custom', desc: 'Le style et le caractère avant tout.', count: '5 modèles' },
  { no: '05', name: 'Touring', desc: 'Le grand voyage en première classe.', count: '4 modèles' },
];

const FEATURED = [
  {
    brand: 'Triumph',
    model: 'Street Triple 765 RS',
    style: 'Roadster',
    category: 'A',
    pricePerDay: 145,
    img: '/images/motos/streettriple765rs.jpg',
    hp: 132,
    range: 290,
  },
  {
    brand: 'Ducati',
    model: 'Monster 937',
    style: 'Roadster',
    category: 'A2',
    pricePerDay: 140,
    img: '/images/motos/monster937.jpg',
    hp: 111,
    range: 280,
  },
  {
    brand: 'Yamaha',
    model: 'Ténéré 700',
    style: 'Trail',
    category: 'A2',
    pricePerDay: 115,
    img: '/images/motos/tenere700.jpg',
    hp: 75,
    range: 390,
  },
];

export default function Home() {
  return (
    <div>
      <section className="max-w-[1240px] mx-auto px-10 pt-[74px] pb-9">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-6">
              Location de motos premium · depuis 2019
            </p>
            <h1 className="font-serif font-semibold text-[72px] leading-[0.97] tracking-[-0.015em] mb-6">
              Roulez en pièces<br />
              <span className="italic text-[#7E2E32]">d&apos;exception.</span>
            </h1>
            <p className="text-[16px] leading-[1.7] text-[#56503f] max-w-[440px] mb-9">
              Une collection rare de motos récentes, entretenues avec soin et livrées prêtes à partir. Réservez en quelques minutes, depuis l&apos;une de nos cinquante agences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Link
                href="/motos"
                className="bg-[#7E2E32] text-[#F4F1E9] text-[13px] tracking-[0.04em] px-[30px] py-[15px] rounded-full hover:bg-[#651f23] transition-colors"
              >
                Explorer la collection
              </Link>
              <Link
                href="/agences"
                className="text-[13px] tracking-[0.04em] text-[#1B1A17] border-b border-[#b9a87f] pb-[3px] hover:text-[#7E2E32] hover:border-[#7E2E32] transition-colors"
              >
                Trouver une agence →
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[380px] lg:min-h-[420px]">
            <div className="absolute w-[380px] h-[380px] border border-[#d9cfb8] rounded-full pointer-events-none" />
            <div
              className="absolute w-[480px] h-[480px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(closest-side, #ffffff 55%, rgba(255,255,255,0) 78%)' }}
            />
            <div className="relative w-[520px] max-w-full animate-float">
              <Image
                src="/images/motos/s1000rr.jpg"
                alt="BMW S 1000 RR"
                width={520}
                height={340}
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute bottom-2 right-0 text-right font-mono text-[10.5px] tracking-[0.14em] text-[#8a7f63]">
              BMW S 1000 RR<br />212 CH · 180€/JOUR
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[#E4DECF]">
          {[
            { value: '+50', label: 'Agences en France' },
            { value: '150', label: 'Modèles disponibles' },
            { value: '4.9/5', label: 'Note clients' },
            { value: '24h', label: 'Assistance incluse' },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`px-3 py-6 ${i < 3 ? 'border-r border-[#E4DECF]' : ''}`}
            >
              <div className="font-serif font-semibold text-[34px] leading-none">{s.value}</div>
              <div className="font-mono text-[11.5px] tracking-[0.1em] uppercase text-[#8a7f63] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-10 pt-[74px] pb-5">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif font-semibold text-[42px] tracking-[-0.01em]">
            Choisissez votre univers
          </h2>
          <Link
            href="/motos"
            className="text-[12px] tracking-[0.04em] text-[#7E2E32] border-b border-[#7E2E32] pb-[3px] hover:opacity-70 transition-opacity"
          >
            Voir toutes les motos →
          </Link>
        </div>
        <div className="border-t border-[#E4DECF]">
          {UNIVERS.map((u) => (
            <Link
              key={u.no}
              href={`/motos?style=${u.name}`}
              className="group grid grid-cols-[64px_1fr_auto_auto] items-center gap-6 px-[6px] py-[22px] border-b border-[#E4DECF] hover:bg-[#efe9da] transition-colors"
            >
              <span className="font-mono text-[12px] text-[#b3a585]">{u.no}</span>
              <span className="font-serif font-medium text-[32px] leading-none">{u.name}</span>
              <span className="text-[13px] text-[#7a715a] max-w-[340px] hidden md:block">{u.desc}</span>
              <span className="font-mono text-[12px] text-[#7E2E32]">{u.count}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-10 pt-[60px] pb-2">
        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-2">
          La sélection
        </p>
        <h2 className="font-serif font-semibold text-[42px] tracking-[-0.01em] mb-8">
          Pièces du moment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED.map((m) => (
            <div
              key={m.model}
              className="bg-white border border-[#ECE5D5] rounded-[14px] overflow-hidden hover:shadow-[0_28px_50px_-30px_rgba(60,45,30,0.45)] transition-shadow"
            >
              <div
                className="relative h-[212px] flex items-center justify-center p-3"
                style={{ background: 'radial-gradient(closest-side, #ffffff 60%, #faf7f0 100%)' }}
              >
                <span className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.12em] text-[#9a8f74] border border-[#e6dcc6] px-[9px] py-1 rounded-full">
                  Permis {m.category}
                </span>
                <Image
                  src={m.img}
                  alt={m.model}
                  width={300}
                  height={186}
                  className="max-h-[180px] w-auto object-contain"
                />
              </div>

              <div className="px-6 pt-6 pb-[26px] border-t border-[#F0EADB]">
                <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[#7E2E32]">
                  {m.brand}
                </p>
                <h3 className="font-serif font-semibold text-[27px] mt-[5px] mb-3">{m.model}</h3>
                <div className="flex gap-[18px] font-mono text-[12px] text-[#8a7f63] mb-[18px]">
                  <span>{m.hp} ch</span>
                  <span>{m.range} km</span>
                  <span>{m.style}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-serif font-semibold text-[30px]">{m.pricePerDay}€</span>
                    <span className="text-[12px] text-[#9a8f74]"> /jour</span>
                  </div>
                  <Link
                    href="/motos"
                    className="font-mono text-[11.5px] tracking-[0.1em] uppercase border border-[#1B1A17] px-4 py-[9px] rounded-full hover:bg-[#1B1A17] hover:text-[#F4F1E9] transition-colors"
                  >
                    Réserver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-10 pt-16 pb-4">
        <div className="bg-[#1B1A17] rounded-[16px] px-14 py-[54px] grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 text-[#F4F1E9]">
          <div>
            <p className="font-mono text-[11px] tracking-[0.26em] uppercase text-[#d8a96a] mb-4">
              Offre du moment · −15%
            </p>
            <h2 className="font-serif font-medium text-[46px] leading-[1.02] mb-3">
              Évasion week-end
            </h2>
            <p className="text-[15px] text-[#bcb3a1] max-w-[460px]">
              Quinze pour cent de remise sur toutes les sportives, du vendredi au lundi. Le moment parfait pour s&apos;offrir une échappée.
            </p>
          </div>
          <Link
            href="/offres"
            className="bg-[#F4F1E9] text-[#1B1A17] text-[13px] tracking-[0.04em] px-8 py-4 rounded-full whitespace-nowrap hover:bg-white transition-colors"
          >
            En savoir plus →
          </Link>
        </div>
      </section>
    </div>
  );
}
