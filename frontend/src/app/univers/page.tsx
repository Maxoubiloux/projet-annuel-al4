import Image from 'next/image';
import Link from 'next/link';

const UNIVERS = [
  {
    no: '01',
    name: 'Sportive',
    img: '/images/motos/s1000rr.jpg',
    desc: "Position engagée, freinage mordant et reprises explosives. La sportive est faite pour ceux qui cherchent la sensation pure, sur route ouverte comme sur circuit.",
    traits: 'Hautes performances · Circuit · Précision',
    count: '12 modèles',
    style: 'Sportive',
  },
  {
    no: '02',
    name: 'Roadster',
    img: '/images/motos/m1000r.jpg',
    desc: "Le compromis idéal : du couple disponible, une position naturelle et un caractère affirmé. Le roadster excelle au quotidien sans rien sacrifier au plaisir.",
    traits: 'Polyvalent · Couple généreux · Quotidien',
    count: '9 modèles',
    style: 'Roadster',
  },
  {
    no: '03',
    name: 'Trail',
    img: '/images/motos/tenere700.jpg',
    desc: "Hautes sur pattes et increvables, nos trails avalent les kilomètres et s'aventurent là où le bitume s'arrête. Le confort des grands voyages.",
    traits: 'Confort · Tout-chemin · Grands trajets',
    count: '7 modèles',
    style: 'Trail',
  },
  {
    no: '04',
    name: 'Custom',
    img: '/images/motos/fatboy.jpg',
    desc: "Le style avant tout : lignes basses, couple à bas régime et présence imposante. Le custom transforme chaque trajet en promenade.",
    traits: 'Style · Couple · Balade',
    count: '5 modèles',
    style: 'Custom',
  },
  {
    no: '05',
    name: 'Touring',
    img: null,
    desc: "Pensées pour la distance : protection intégrale, bagagerie généreuse et confort en duo. La première classe sur deux roues.",
    traits: 'Longue distance · Bagagerie · Duo',
    count: '4 modèles',
    style: 'Tous',
  },
];

export default function UniversPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-5">
        <div className="mb-12 max-w-[620px]">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
            Cinq familles, une passion
          </p>
          <h1 className="font-serif font-semibold text-[60px] leading-none tracking-[-0.015em] mb-3">
            Nos univers
          </h1>
          <p className="text-[16px] text-[#56503f]">
            Chaque style a sa personnalité, sa posture et son terrain de jeu.
            Trouvez celui qui vous ressemble, puis explorez la gamme.
          </p>
        </div>

        <div className="flex flex-col gap-[30px]">
          {UNIVERS.map((u, i) => (
            <div
              key={u.no}
              className="grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#ECE5D5] rounded-[18px] overflow-hidden min-h-[300px]"
            >
              <div
                className={`relative flex items-center justify-center p-8 ${i % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}
                style={{
                  background: 'radial-gradient(closest-side, #ffffff 58%, #f7f3ec 100%)',
                }}
              >
                <span className="absolute top-6 left-7 font-serif font-semibold text-[64px] leading-none text-[#F0E7D2] pointer-events-none select-none">
                  {u.no}
                </span>
                {u.img ? (
                  <Image
                    src={u.img}
                    alt={u.name}
                    width={460}
                    height={280}
                    className="relative max-h-[230px] w-auto object-contain"
                  />
                ) : (
                  <div
                    className="w-[86%] h-[200px] rounded-[12px] flex items-center justify-center"
                    style={{
                      background:
                        'repeating-linear-gradient(45deg,#F1ECE0,#F1ECE0 9px,#EBE4D4 9px,#EBE4D4 18px)',
                    }}
                  >
                    <span className="font-mono text-[11px] tracking-[0.14em] text-[#a0967f] bg-[rgba(244,241,233,0.9)] px-[14px] py-2 rounded-[8px]">
                      Visuel touring · à venir
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`flex flex-col justify-center px-12 py-11 ${i % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}
              >
                <p className="font-mono text-[11px] tracking-[0.1em] text-[#7E2E32] mb-[10px]">
                  {u.count}
                </p>
                <h2 className="font-serif font-semibold text-[44px] leading-none tracking-[-0.01em] mb-4">
                  {u.name}
                </h2>
                <p className="text-[15px] leading-[1.7] text-[#56503f] mb-5">{u.desc}</p>
                <p className="font-mono text-[11px] tracking-[0.06em] text-[#8a7f63] mb-[26px]">
                  {u.traits}
                </p>
                <Link
                  href={u.style === 'Tous' ? '/motos' : `/motos?style=${u.style}`}
                  className="self-start bg-[#1B1A17] text-[#F4F1E9] text-[12.5px] tracking-[0.04em] px-7 py-[14px] rounded-full hover:bg-[#7E2E32] transition-colors"
                >
                  Explorer la gamme →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
