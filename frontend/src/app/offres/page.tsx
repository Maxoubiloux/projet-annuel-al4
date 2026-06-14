import Link from 'next/link';
import { Offer } from '@/types';

const OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Évasion Week-end',
    description: 'Profitez de -15% sur toutes nos sportives pour toute location du vendredi au lundi.',
    discount: '-15%',
    code: 'WEEKEND15',
    imageUrl: '',
    validUntil: '31/12/2026',
    category: 'Sportive',
  },
  {
    id: '2',
    title: 'Aventure Longue Durée',
    description: 'Partez plus longtemps ! Bénéficiez de 2 jours offerts pour toute location de plus de 7 jours consécutifs.',
    discount: '2 jours offerts',
    imageUrl: '',
    validUntil: '30/06/2026',
    category: 'Tous styles',
  },
  {
    id: '3',
    title: 'Première Location',
    description: 'Vingt pour cent de remise sur votre toute première réservation chez City Moto Yard.',
    discount: '-20%',
    code: 'BIENVENUE20',
    imageUrl: '',
    validUntil: 'Réservé aux nouveaux membres',
    category: 'Tous styles',
  },
  {
    id: '4',
    title: 'Parrainage',
    description: 'Trente euros pour vous, trente euros pour l\'ami que vous parrainez à sa première location.',
    discount: '30€ offerts',
    imageUrl: '',
    validUntil: 'Sans limite de parrainages',
    category: 'Tous styles',
  },
];

export default function OffresPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-5">
        <div className="mb-8 max-w-[620px]">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
            Promotions &amp; avantages
          </p>
          <h1 className="font-serif font-semibold text-[60px] leading-none tracking-[-0.015em] mb-3">
            Offres du moment
          </h1>
          <p className="text-[16px] text-[#56503f]">
            Des remises pensées pour rouler plus souvent. Cumulez les avantages membres et partez l&apos;esprit léger.
          </p>
        </div>

        <div className="relative bg-[#1B1A17] rounded-[18px] px-14 py-14 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 text-[#F4F1E9] overflow-hidden mb-6">
          <div className="absolute right-[-40px] top-[-40px] w-[280px] h-[280px] rounded-full border border-[rgba(216,169,106,0.25)] pointer-events-none" />
          <div className="relative z-10">
            <p className="font-mono text-[11px] tracking-[0.26em] uppercase text-[#d8a96a] mb-4">
              Offre vedette · −15%
            </p>
            <h2 className="font-serif font-medium text-[50px] leading-[1.0] mb-3">
              Évasion week-end
            </h2>
            <p className="text-[15px] text-[#bcb3a1] max-w-[480px]">
              Quinze pour cent de remise sur toutes les sportives, du vendredi au lundi. Le moment parfait pour s&apos;offrir une échappée à deux roues.
            </p>
          </div>
          <Link
            href="/motos?style=Sportive"
            className="relative z-10 bg-[#F4F1E9] text-[#1B1A17] text-[13px] tracking-[0.04em] px-8 py-4 rounded-full whitespace-nowrap hover:bg-white transition-colors"
          >
            En profiter →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-[#ECE5D5] rounded-[16px] px-[34px] py-[34px] flex flex-col hover:shadow-[0_28px_50px_-32px_rgba(60,45,30,0.4)] hover:border-[#7E2E32] transition-all"
            >
              <span className="self-start bg-[#7E2E32] text-[#F4F1E9] font-mono text-[11px] tracking-[0.08em] px-[14px] py-[7px] rounded-full mb-[22px]">
                {offer.discount}
              </span>

              <h3 className="font-serif font-semibold text-[30px] leading-none mb-3">
                {offer.title}
              </h3>
              <p className="text-[14.5px] leading-[1.65] text-[#56503f] mb-[22px] flex-1">
                {offer.description}
              </p>

              {offer.code && (
                <div className="mb-4 px-4 py-2 bg-[#FBF9F3] border border-dashed border-[#d9cfb8] rounded-[8px] text-center">
                  <span className="text-[12px] text-[#9a8f74] uppercase tracking-wider">Code : </span>
                  <span className="font-mono font-medium text-[#7E2E32]">{offer.code}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#F0EADB] pt-[18px]">
                <span className="font-mono text-[10.5px] tracking-[0.06em] text-[#a0967f]">
                  {offer.validUntil}
                </span>
                <Link
                  href="/motos"
                  className="text-[12.5px] text-[#7E2E32] border-b border-[#7E2E32] pb-[2px] hover:opacity-70 transition-opacity"
                >
                  En profiter →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white border border-[#ECE5D5] rounded-[16px] px-14 py-14 text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
            Newsletter
          </p>
          <h2 className="font-serif font-semibold text-[38px] mb-3">
            Ne manquez aucune offre
          </h2>
          <p className="text-[15px] text-[#56503f] max-w-[440px] mx-auto mb-7">
            Inscrivez-vous pour recevoir nos promotions en avant-première et des offres exclusives membres.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-[460px] mx-auto">
            <input
              type="email"
              placeholder="vous@exemple.fr"
              className="flex-1 border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-4 py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
            />
            <button className="bg-[#1B1A17] text-[#F4F1E9] font-mono text-[12px] tracking-[0.08em] uppercase px-7 py-3 rounded-[10px] hover:bg-[#7E2E32] transition-colors whitespace-nowrap">
              S&apos;inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
