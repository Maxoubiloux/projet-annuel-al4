import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative h-[80vh] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-60">
          <Image
            src="https://images.unsplash.com/photo-1558981403-c5f91cbcf523?q=80&w=2070&auto=format&fit=crop"
            alt="Moto background"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 italic uppercase">
            CITY MOTO <span className="text-red-600">YARD</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-200">
            Le garage de référence pour louer la moto de vos rêves.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/motos"
              className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-red-700 transition-all transform hover:scale-105"
            >
              Voir nos motos
            </Link>
            <Link
              href="/agences"
              className="bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Trouver une agence
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold italic tracking-tight text-gray-900 sm:text-4xl underline decoration-red-600 underline-offset-8">
              CHOISISSEZ VOTRE STYLE
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Des modèles récents et entretenus pour tous les types de conduite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sportive', img: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=2070&auto=format&fit=crop' },
              { name: 'Roadster', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop' },
              { name: 'Trail', img: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=2070&auto=format&fit=crop' }
            ].map((cat) => (
              <div key={cat.name} className="group relative overflow-hidden rounded-2xl aspect-video cursor-pointer">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold tracking-tighter italic">{cat.name.toUpperCase()}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold italic tracking-tight sm:text-4xl">
                OFFRES DU <span className="text-red-600">MOMENT</span>
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Ne manquez pas nos promotions exclusives pour vos prochaines virées.
              </p>
            </div>
            <Link href="/offres" className="mt-6 md:mt-0 text-red-600 font-bold hover:text-white transition-colors flex items-center">
              Voir toutes les offres
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto md:h-80 group">
              <Image
                src="https://images.unsplash.com/photo-1558981403-c5f91cbcf523?q=80&w=2070&auto=format&fit=crop"
                alt="Offre Évasion Week-end"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold italic rounded mb-4 inline-block">-15%</span>
                <h3 className="text-2xl font-bold italic mb-2">ÉVASION WEEK-END</h3>
                <p className="text-gray-300 mb-4 max-w-md">Sur toutes les sportives du vendredi au lundi.</p>
                <Link href="/offres" className="inline-block border-b-2 border-red-600 pb-1 font-bold text-sm tracking-widest hover:text-red-600 transition-colors">EN SAVOIR PLUS</Link>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto md:h-80 group">
              <Image
                src="https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=2070&auto=format&fit=crop"
                alt="Offre Longue Durée"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold italic rounded mb-4 inline-block">2 JOURS OFFERTS</span>
                <h3 className="text-2xl font-bold italic mb-2">LONGUE DURÉE</h3>
                <p className="text-gray-300 mb-4 max-w-md">Pour toute location de plus de 7 jours.</p>
                <Link href="/offres" className="inline-block border-b-2 border-red-600 pb-1 font-bold text-sm tracking-widest hover:text-red-600 transition-colors">EN SAVOIR PLUS</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21a3.745 3.745 0 0 1-3.168-1.593 3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.745 3.745 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 italic">Motos Garanties</h4>
              <p className="text-gray-600">Des motos récentes, parfaitement entretenues et contrôlées.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 italic">Réseau National</h4>
              <p className="text-gray-600">Plus de 50 agences en France pour vous accueillir partout.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 italic">Réservation Simple</h4>
              <p className="text-gray-600">Réservez en ligne en quelques clics et partez rouler.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
