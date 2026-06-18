'use client';

import { Motorbike } from '@/types';
import { motosService } from '@/services/motos.service';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const kmFormatter = new Intl.NumberFormat('fr-FR');

export default function MotoDetails() {
  const params = useParams();
  const id = params?.id as string;

  const [moto, setMoto] = useState<Motorbike | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!id) return;
    motosService.getById(id)
      .then(setMoto)
      .catch((e) => setError(e.message || 'Moto introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const calculateTotal = () => {
    if (!startDate || !endDate || !moto) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return diffDays * moto.pricePerDay;
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="space-y-6">
              <div className="aspect-[4/3] rounded-3xl bg-gray-200" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-gray-200" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-64 bg-gray-200 rounded-3xl mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !moto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">MOTO NON TROUVÉE</h1>
        <p className="text-gray-600 mb-8">{error || 'Désolé, la moto que vous recherchez n\'existe pas ou a été retirée.'}</p>
        <Link href="/motos" className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-red-600">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/motos" className="hover:text-red-600">Nos motos</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{moto.brand} {moto.model}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl">
              <Image
                src={moto.imageUrl}
                alt={`${moto.brand} ${moto.model}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-white ${
                  moto.category === 'A' ? 'bg-red-600' : moto.category === 'A2' ? 'bg-orange-500' : 'bg-green-600'
                }`}>
                  PERMIS {moto.category}
                </span>
                <span className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-white">
                  {moto.style}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Année</p>
                <p className="text-xl font-bold text-gray-900">{moto.year}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Puissance</p>
                <p className="text-xl font-bold text-gray-900">{moto.hp} <span className="text-sm">ch</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Couple</p>
                <p className="text-xl font-bold text-gray-900">{moto.torque} <span className="text-sm">Nm</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Conso</p>
                <p className="text-xl font-bold text-gray-900">{moto.consumption} <span className="text-sm">L</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Autonomie</p>
                <p className="text-xl font-bold text-gray-900">{moto.range} <span className="text-sm">km</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Kilométrage</p>
                <p className="text-xl font-bold text-gray-900">{kmFormatter.format(moto.currentKm)} <span className="text-sm">km</span></p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 italic uppercase leading-none mb-4">
                {moto.brand} <span className="text-red-600">{moto.model}</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {moto.description}
              </p>
            </div>

            <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Tarif journalier</p>
                  <p className="text-4xl font-black text-gray-900">{moto.pricePerDay}€ <span className="text-lg font-normal text-gray-400">/ jour</span></p>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">DISPONIBLE IMMÉDIATEMENT</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Date de départ</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:border-red-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Date de retour</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:border-red-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl p-6 text-white">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Location ({moto.pricePerDay}€ x {startDate && endDate ? Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1 : 0} jours)</span>
                    <span className="font-bold">{calculateTotal()}€</span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <span className="text-gray-400">Assurance Tout Risque</span>
                    <span className="text-green-500 font-bold italic uppercase">Offerte</span>
                  </div>
                  <div className="flex justify-between items-end pt-6 border-t border-gray-800">
                    <span className="text-lg font-bold italic uppercase">Total</span>
                    <span className="text-3xl font-black text-red-600">{calculateTotal()}€</span>
                  </div>
                </div>

                <button
                  disabled={!startDate || !endDate}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl text-xl font-black italic uppercase tracking-widest hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-600/20"
                >
                  Confirmer la réservation
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs font-bold text-gray-600 uppercase">Moto Certifiée</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-xs font-bold text-gray-600 uppercase">Assistance 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
