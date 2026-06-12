'use client';

import { Motorbike } from '@/types';
import { motosService } from '@/services/motos.service';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const kmFormatter = new Intl.NumberFormat('fr-FR');

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

  const filteredMotos = motos.filter((moto) => {
    const styleMatch = selectedStyle === 'Tous' || moto.style === selectedStyle;
    const categoryMatch = selectedCategory === 'Tous' || moto.category === selectedCategory;
    return styleMatch && categoryMatch;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold italic tracking-tight text-gray-900 mb-2">
                NOS <span className="text-red-600">MOTOS</span>
              </h1>
              <p className="text-gray-600 text-lg">Choisissez votre compagnon de route parmi notre sélection.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Filtrer par style</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {['Tous', 'Sportive', 'Roadster', 'Trail', 'Custom', 'Touring'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStyle(st)}
                    className={`px-6 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap ${
                      selectedStyle === st
                        ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-200'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600'
                    }`}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Filtrer par permis</p>
              <div className="flex gap-3">
                {['Tous', 'A', 'A2', 'A1'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-8 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                      selectedCategory === cat
                        ? 'bg-black border-black text-white shadow-md shadow-gray-300'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-black hover:text-black'
                    }`}
                  >
                    {cat === 'Tous' ? 'TOUS' : `PERMIS ${cat}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="h-64 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-10 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-red-200">
            <p className="text-red-500 text-xl font-medium italic">⚠️ {error}</p>
            <button
              onClick={loadMotos}
              className="mt-4 text-red-600 font-bold hover:underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMotos.map((moto) => (
                <div key={moto.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={moto.imageUrl}
                      alt={moto.model}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-gray-900 border border-gray-100 shadow-sm flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${moto.category === 'A' ? 'bg-red-600' : moto.category === 'A2' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        PERMIS {moto.category}
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                      {moto.style}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-bold text-red-600 uppercase tracking-wider">{moto.brand}</p>
                        <h3 className="text-2xl font-bold italic text-gray-900">{moto.model}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">À partir de</p>
                        <p className="text-2xl font-black italic text-gray-900">{moto.pricePerDay}€<span className="text-xs font-normal not-italic text-gray-500">/jour</span></p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                      <span>{kmFormatter.format(moto.currentKm)} km</span>
                      <span className={moto.status === 'PUBLISHED' ? 'text-green-600' : 'text-gray-400'}>{moto.status}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                      {moto.description}
                    </p>
                    <Link
                      href={`/motos/${moto.id}`}
                      className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
                    >
                      Réserver maintenant
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredMotos.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-xl font-medium italic">Aucune moto ne correspond à vos critères de recherche.</p>
                <button
                  onClick={handleReset}
                  className="mt-4 text-red-600 font-bold hover:underline"
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
