import Image from 'next/image';
import Link from 'next/link';
import { Offer } from '@/types';

const OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Évasion Week-end',
    description: 'Profitez de -15% sur toutes nos sportives pour toute location du vendredi au lundi.',
    discount: '-15%',
    code: 'WEEKEND15',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbcf523?q=80&w=2070&auto=format&fit=crop',
    validUntil: '31/12/2026',
    category: 'Sportive'
  },
  {
    id: '2',
    title: 'Aventure Longue Durée',
    description: 'Partez plus longtemps ! Bénéficiez de 2 jours offerts pour toute location de plus de 7 jours.',
    discount: '2 JOURS OFFERTS',
    imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=2070&auto=format&fit=crop',
    validUntil: '30/06/2026',
    category: 'Trail'
  },
  {
    id: '3',
    title: 'Offre Jeune Permis',
    description: 'Vous avez votre permis depuis moins de 2 ans ? Profitez de l\'assurance offerte sur votre première location.',
    discount: 'ASSURANCE OFFERTE',
    code: 'JEUNEPERMIS',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop',
    validUntil: 'Illimitée',
    category: 'Tous modèles'
  },
  {
    id: '4',
    title: 'Roadtrip Duo',
    description: 'Équipez-vous pour deux ! Le deuxième casque et la paire de gants sont offerts pour toute location de GT.',
    discount: 'ÉQUIPEMENT OFFERT',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop',
    validUntil: '31/08/2026',
    category: 'Touring'
  }
];

export default function OffresPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold italic tracking-tight mb-4">
            OFFRES & <span className="text-red-600">PROMOTIONS</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Profitez de nos meilleurs tarifs et avantages exclusifs pour vos prochaines sorties à moto.
          </p>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {OFFERS.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col md:flex-row h-full group hover:shadow-2xl transition-shadow duration-300">
                <div className="relative w-full md:w-2/5 h-48 md:h-auto overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${offer.imageUrl})` }}
                  ></div>
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold italic rounded">
                    {offer.discount}
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-between flex-grow md:w-3/5">
                  <div>
                    <span className="text-red-600 text-xs font-bold uppercase tracking-widest">{offer.category}</span>
                    <h2 className="text-2xl font-bold mt-2 mb-4 italic uppercase">{offer.title}</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>
                  <div>
                    {offer.code && (
                      <div className="mb-4 p-2 bg-gray-100 border border-dashed border-gray-400 rounded text-center">
                        <span className="text-sm text-gray-500 uppercase">Code promo : </span>
                        <span className="font-mono font-bold text-red-600">{offer.code}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-gray-400 italic">Valable jusqu&apos;au {offer.validUntil}</span>
                      <Link
                        href="/motos"
                        className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-red-600 transition-colors"
                      >
                        En profiter
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / Call to Action */}
      <section className="py-16 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold italic mb-6">NE MANQUEZ AUCUNE OFFRE</h2>
          <p className="text-lg mb-8 opacity-90">Inscrivez-vous à notre newsletter pour recevoir nos promotions en avant-première.</p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-grow px-6 py-3 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
              S&apos;inscrire
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
