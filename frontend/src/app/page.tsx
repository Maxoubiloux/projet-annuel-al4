import Image from 'next/image';
import Link from 'next/link';

const STATS = [
  { value: '+50', label: 'Agences en France' },
  { value: '150', label: 'Modèles disponibles' },
  { value: '4.9/5', label: 'Note clients' },
  { value: '24h', label: 'Assistance incluse' },
];

const UNIVERS = [
  { no: '01', name: 'Sportive', desc: 'Pour les sensations pures et la piste.', count: '12 modèles' },
  { no: '02', name: 'Roadster', desc: 'Le plaisir polyvalent au quotidien.', count: '9 modèles' },
  { no: '03', name: 'Trail', desc: 'Confort et aventure sur tous les terrains.', count: '7 modèles' },
  { no: '04', name: 'Custom', desc: 'Le style et le caractère avant tout.', count: '5 modèles' },
  { no: '05', name: 'Touring', desc: 'Le grand voyage en première classe.', count: '4 modèles' },
];

const FEATURED = [
  {
    id: '32',
    brand: 'Triumph',
    model: 'Street Triple 765RS',
    style: 'Roadster',
    category: 'A',
    pricePerDay: 145,
    img: '/images/motos/streettriple765rs.jpg',
    hp: 132,
    range: 290,
  },
  {
    id: '11',
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
    id: '9',
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
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-[1240px] mx-auto px-10 pt-[74px] pb-9">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-[30px] items-center">

          {/* Left copy */}
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-6">
              Location de motos premium · depuis 2019
            </p>
            <h1 className="font-serif font-semibold text-[72px] leading-[0.97] tracking-[-0.015em] mb-6">
              Roulez en pièces<br />
              <span className="italic text-[#7E2E32]">d&apos;exception.</span>
            </h1>
            <p className="text-[16px] leading-[1.7] text-[#56503f] max-w-[440px] mb-9">
              Une collection rare de motos récentes, entretenues avec soin et livrées prêtes
              à partir. Réservez en quelques minutes, depuis l&apos;une de nos cinquante agences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                href="/motos"
                className="bg-[#7E2E32] text-[#F4F1E9] text-[13px] tracking-[0.04em] px-[30px] py-[15px] rounded-full hover:bg-[#651f23] transition-colors"
              >
                Explorer la collection
              </Link>
              <Link
                href="/univers"
                className="text-[13px] tracking-[0.04em] text-[#1B1A17] border-b border-[#b9a87f] pb-[3px] hover:text-[#7E2E32] hover:border-[#7E2E32] transition-colors"
              >
                Comment ça marche →
              </Link>
            </div>
          </div>

          {/* Right — floating moto */}
          <div className="relative flex items-center justify-center min-h-[400px]">
            {/* Decorative circle */}
            <div className="absolute w-[440px] h-[440px] border border-[#d9cfb8] rounded-full pointer-events-none" />
            {/* Radial glow */}
            <div
              className="absolute w-[540px] h-[540px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(closest-side, #ffffff 55%, rgba(255,255,255,0) 78%)' }}
            />
            <div className="relative w-[580px] max-w-full animate-float">
              <Image
                src="/images/motos/s1000rr.jpg"
                alt="BMW S 1000 RR"
                width={580}
                height={380}
                className="object-contain"
                priority
              />
            </div>
            {/* Caption */}
            <div className="absolute bottom-[6px] right-0 text-right font-mono text-[10.5px] tracking-[0.14em] text-[#8a7f63] leading-[1.6]">
              BMW S 1000 RR<br />212 CH · 180€/JOUR
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats row ────────────────────────────────────────── */}
      <section className="max-w-[1240px] mx-auto px-10 mt-[30px]">
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[#E4DECF]">
          {STATS.map((s, i) => (
            <div key={s.label} className={`px-2 py-[26px] ${i < 3 ? 'border-r border-[#E4DECF]' : ''}`}>
              <div className="font-serif font-semibold text-[36px] leading-none">{s.value}</div>
              <div className="font-mono text-[11.5px] tracking-[0.1em] uppercase text-[#8a7f63] mt-[2px]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Univers index ─────────────────────────────────────── */}
      <section className="max-w-[1240px] mx-auto px-10 pt-[74px] pb-5">
        <div className="flex items-end justify-between mb-[30px]">
          <h2 className="font-serif font-semibold text-[42px] tracking-[-0.01em] leading-none">
            Choisissez votre univers
          </h2>
          <Link
            href="/motos"
            className="text-[12px] tracking-[0.04em] text-[#7E2E32] border-b border-[#7E2E32] pb-[3px] hover:opacity-70 transition-opacity whitespace-nowrap"
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
              <span className="hidden md:block text-[13px] text-[#7a715a] max-w-[340px]">{u.desc}</span>
              <span className="font-mono text-[12px] text-[#7E2E32]">{u.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured motos ────────────────────────────────────── */}
      <section className="max-w-[1240px] mx-auto px-10 pt-[60px] pb-[10px]">
        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-2">
          La sélection
        </p>
        <h2 className="font-serif font-semibold text-[42px] tracking-[-0.01em] mb-[34px]">
          Pièces du moment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED.map((m) => (
            <Link
              key={m.id}
              href={`/motos/${m.id}`}
              className="group bg-white border border-[#ECE5D5] rounded-[14px] overflow-hidden hover:shadow-[0_28px_50px_-30px_rgba(60,45,30,0.45)] transition-shadow"
            >
              {/* Image area */}
              <div
                className="relative h-[212px] flex items-center justify-center p-[14px]"
                style={{ background: 'radial-gradient(closest-side, #ffffff 60%, #faf7f0 100%)' }}
              >
                {/* License badge */}
                <span className="absolute top-[14px] left-[14px] font-mono text-[10px] tracking-[0.12em] text-[#9a8f74] border border-[#e6dcc6] px-[9px] py-1 rounded-full">
                  Permis {m.category}
                </span>
                {/* Style tag */}
                <span className="absolute top-[14px] right-[14px] font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#9a8f74]">
                  {m.style}
                </span>
                <Image
                  src={m.img}
                  alt={m.model}
                  width={300}
                  height={186}
                  className="max-h-[180px] w-auto object-contain"
                />
              </div>

              {/* Info area */}
              <div className="px-6 pt-6 pb-[26px] border-t border-[#F0EADB]">
                <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[#7E2E32]">
                  {m.brand}
                </p>
                <h3 className="font-serif font-semibold text-[27px] mt-[5px] mb-[14px] leading-[1.05]">
                  {m.model}
                </h3>
                <div className="flex items-center gap-[18px] font-mono text-[12px] text-[#8a7f63] mb-[18px]">
                  <span>{m.hp} ch</span>
                  <span>{m.range} km</span>
                  <span>{m.style}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-serif font-semibold text-[30px]">{m.pricePerDay}€</span>
                    <span className="text-[12px] text-[#9a8f74]"> /jour</span>
                  </div>
                  <span className="font-mono text-[11.5px] tracking-[0.1em] uppercase border border-[#1B1A17] px-4 py-[9px] rounded-full group-hover:bg-[#1B1A17] group-hover:text-[#F4F1E9] transition-colors">
                    Réserver
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Promo band ────────────────────────────────────────── */}
      <section className="max-w-[1240px] mx-auto px-10 pt-16 pb-4">
        <div className="relative bg-[#1B1A17] rounded-[16px] px-14 py-[54px] grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 text-[#F4F1E9] overflow-hidden">
          {/* Decorative ring */}
          <div className="absolute right-[-40px] top-[-40px] w-[280px] h-[280px] rounded-full border border-[rgba(216,169,106,0.25)] pointer-events-none" />

          <div className="relative z-10">
            <p className="font-mono text-[11px] tracking-[0.26em] uppercase text-[#d8a96a] mb-4">
              Offre du moment · −15%
            </p>
            <h2 className="font-serif font-medium text-[46px] leading-[1.02] mb-[14px]">
              Évasion week-end
            </h2>
            <p className="text-[15px] text-[#bcb3a1] max-w-[460px]">
              Quinze pour cent de remise sur toutes les sportives, du vendredi au lundi.
              Le moment parfait pour s&apos;offrir une échappée.
            </p>
          </div>
          <Link
            href="/offres"
            className="relative z-10 bg-[#F4F1E9] text-[#1B1A17] text-[13px] tracking-[0.04em] px-8 py-4 rounded-full whitespace-nowrap hover:bg-white transition-colors"
          >
            En savoir plus →
          </Link>
        </div>
      </section>
    </div>
  );
}
