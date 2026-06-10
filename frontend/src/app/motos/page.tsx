'use client';

import { Motorbike } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const kmFormatter = new Intl.NumberFormat('fr-FR');

const MOCK_MOTOS: Motorbike[] = [
  {
    id: '1',
    brand: 'Yamaha',
    model: 'MT-07',
    registration: 'AB-123-CD',
    category: 'A2',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 15230,
    pricePerDay: 85,
    imageUrl: '/images/motos/mt07.jpg',
    description: 'La reine des roadsters, maniable et joueuse.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 75,
    torque: 68,
    consumption: 4.1,
    range: 340
  },
  {
    id: '2',
    brand: 'Honda',
    model: 'Africa Twin',
    registration: 'EF-456-GH',
    category: 'A',
    style: 'Trail',
    status: 'PUBLISHED',
    currentKm: 12000,
    pricePerDay: 120,
    imageUrl: '/images/motos/africa_twin.jpg',
    description: 'Parfaite pour l\'aventure et les longs trajets.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 105,
    torque: 112,
    consumption: 4.8,
    range: 395
  },
  {
    id: '3',
    brand: 'BMW',
    model: 'S1000RR',
    registration: 'IJ-789-KL',
    category: 'A',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 5000,
    pricePerDay: 180,
    imageUrl: '/images/motos/s1000rr.jpg',
    description: 'Une supersportive sans concession pour les sensations fortes.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 212,
    torque: 113,
    consumption: 6.3,
    range: 260
  },
  {
    id: '4',
    brand: 'Triumph',
    model: 'Bonneville T120',
    registration: 'MN-012-OP',
    category: 'A',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 8500,
    pricePerDay: 110,
    imageUrl: '/images/motos/t120.jpg',
    description: 'Le style néo-rétro iconique.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 80,
    torque: 105,
    consumption: 4.6,
    range: 315
  },
  {
    id: '5',
    brand: 'Kawasaki',
    model: 'Versys 650',
    registration: 'QR-345-ST',
    category: 'A2',
    style: 'Trail',
    status: 'PUBLISHED',
    currentKm: 14200,
    pricePerDay: 90,
    imageUrl: '/images/motos/versys_650.jpg',
    description: 'Polyvalence et confort au quotidien.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 67,
    torque: 61,
    consumption: 4.4,
    range: 460
  },
  {
    id: '6',
    brand: 'Ducati',
    model: 'Panigale V4',
    registration: 'UV-678-WX',
    category: 'A',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 2100,
    pricePerDay: 220,
    imageUrl: '/images/motos/panigale_v4.jpg',
    description: 'L\'excellence italienne sur deux roues.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 218,
    torque: 124,
    consumption: 7.5,
    range: 220
  },
  {
    id: '7',
    brand: 'Harley-Davidson',
    model: 'Iron 883',
    registration: 'YZ-901-AB',
    category: 'A2',
    style: 'Custom',
    status: 'PUBLISHED',
    currentKm: 18500,
    pricePerDay: 130,
    imageUrl: '/images/motos/iron883.jpg',
    description: 'Le style custom authentique et minimaliste.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 54,
    torque: 70,
    consumption: 4.7,
    range: 270
  },
  {
    id: '8',
    brand: 'Kawasaki',
    model: 'Ninja 650',
    registration: 'CD-234-EF',
    category: 'A2',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 11200,
    pricePerDay: 95,
    imageUrl: '/images/motos/ninja_650.jpg',
    description: 'Sportive équilibrée pour la route et le plaisir.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 68,
    torque: 64,
    consumption: 4.2,
    range: 360
  },
  {
    id: '9',
    brand: 'Yamaha',
    model: 'Ténéré 700',
    registration: 'GH-567-IJ',
    category: 'A2',
    style: 'Trail',
    status: 'PUBLISHED',
    currentKm: 9800,
    pricePerDay: 115,
    imageUrl: '/images/motos/tenere700.jpg',
    description: 'L\'esprit rallye-raid accessible à tous.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 75,
    torque: 69,
    consumption: 4.1,
    range: 390
  },
  {
    id: '10',
    brand: 'BMW',
    model: 'R 1300 GS',
    registration: 'KL-890-MN',
    category: 'A',
    style: 'Trail',
    status: 'PUBLISHED',
    currentKm: 1500,
    pricePerDay: 175,
    imageUrl: '/images/motos/r1300gs.jpg',
    description: 'La nouvelle référence absolue du trail routier, plus légère et plus puissante.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 147,
    torque: 150,
    consumption: 4.7,
    range: 410
  },
  {
    id: '11',
    brand: 'Ducati',
    model: 'Monster 937',
    registration: 'OP-123-QR',
    category: 'A2',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 6400,
    pricePerDay: 140,
    imageUrl: '/images/motos/monster937.jpg',
    description: 'L\'essence même du roadster sportif italien.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 111,
    torque: 95,
    consumption: 5.1,
    range: 280
  },
  {
    id: '12',
    brand: 'Kawasaki',
    model: 'Z900',
    registration: 'ST-456-UV',
    category: 'A2',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 12500,
    pricePerDay: 110,
    imageUrl: '/images/motos/z900.jpg',
    description: 'Puissance brute et design Sugomi.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 125,
    torque: 101,
    consumption: 5.6,
    range: 310
  },
  {
    id: '13',
    brand: 'Harley-Davidson',
    model: 'Fat Boy',
    registration: 'WX-789-YZ',
    category: 'A',
    style: 'Custom',
    status: 'PUBLISHED',
    currentKm: 7200,
    pricePerDay: 190,
    imageUrl: '/images/motos/fatboy.jpg',
    description: 'L\'icône massive du custom américain.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 96,
    torque: 160,
    consumption: 5.4,
    range: 350
  },
  {
    id: '14',
    brand: 'Suzuki',
    model: 'Hayabusa',
    registration: 'AB-012-CD',
    category: 'A',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 4300,
    pricePerDay: 200,
    imageUrl: '/images/motos/hayabusa.jpg',
    description: 'La légende de la vitesse et de la puissance.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 192,
    torque: 152,
    consumption: 6.5,
    range: 310
  },
  {
    id: '15',
    brand: 'Honda',
    model: 'Goldwing',
    registration: 'EF-345-GH',
    category: 'A',
    style: 'Touring',
    status: 'PUBLISHED',
    currentKm: 18000,
    pricePerDay: 250,
    imageUrl: '/images/motos/goldwing.jpg',
    description: 'Le summum du confort pour le grand tourisme.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 128,
    torque: 175,
    consumption: 5.4,
    range: 390
  },
  {
    id: '16',
    brand: 'KTM',
    model: '1390 Super Duke R',
    registration: 'IJ-678-KL',
    category: 'A',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 800,
    pricePerDay: 195,
    imageUrl: '/images/motos/superduke1390.jpg',
    description: 'La nouvelle évolution de "The Beast" : encore plus radicale, légère et surpuissante.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 195,
    torque: 150,
    consumption: 5.8,
    range: 300
  },
  {
    id: '17',
    brand: 'Yamaha',
    model: 'R1',
    registration: 'MN-901-OP',
    category: 'A',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 3200,
    pricePerDay: 210,
    imageUrl: '/images/motos/r1.jpg',
    description: 'Technologie issue de la compétition pour la route.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 202,
    torque: 114,
    consumption: 7.1,
    range: 250
  },
  {
    id: '18',
    brand: 'BMW',
    model: 'K 1600 GTL',
    registration: 'QR-234-ST',
    category: 'A',
    style: 'Touring',
    status: 'PUBLISHED',
    currentKm: 14500,
    pricePerDay: 230,
    imageUrl: '/images/motos/k1600gtl.jpg',
    description: 'Six cylindres pour un voyage en première classe.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 162,
    torque: 182,
    consumption: 5.8,
    range: 460
  },
  {
    id: '19',
    brand: 'Ducati',
    model: 'Multistrada V4',
    registration: 'UV-567-WX',
    category: 'A',
    style: 'Trail',
    status: 'PUBLISHED',
    currentKm: 9200,
    pricePerDay: 195,
    imageUrl: '/images/motos/multistradav4.jpg',
    description: 'Sportivité et aventure sans limites.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 172,
    torque: 127,
    consumption: 6.4,
    range: 350
  },
  {
    id: '20',
    brand: 'Kawasaki',
    model: 'H2 Carbon',
    registration: 'YZ-890-AB',
    category: 'A',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 1500,
    pricePerDay: 350,
    imageUrl: '/images/motos/h2carbon.jpg',
    description: 'L\'unique moto de série compressée.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 235,
    torque: 145,
    consumption: 8.4,
    range: 210
  },
  {
    id: '21',
    brand: 'Indian',
    model: 'Chieftain',
    registration: 'CD-123-EF',
    category: 'A',
    style: 'Custom',
    status: 'PUBLISHED',
    currentKm: 21000,
    pricePerDay: 210,
    imageUrl: '/images/motos/chieftain.jpg',
    description: 'Le bagger américain authentique.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 95,
    torque: 175,
    consumption: 5.7,
    range: 360
  },
  {
    id: '22',
    brand: 'Triumph',
    model: 'Tiger 900',
    registration: 'GH-456-IJ',
    category: 'A2',
    style: 'Trail',
    status: 'PUBLISHED',
    currentKm: 13200,
    pricePerDay: 135,
    imageUrl: '/images/motos/tiger900gtpro.jpg',
    description: 'L\'agilité trail au service de l\'aventure.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 110,
    torque: 92,
    consumption: 4.6,
    range: 430
  },
  {
    id: '23',
    brand: 'BMW',
    model: 'M 1000 R',
    registration: 'KL-789-MN',
    category: 'A',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 2400,
    pricePerDay: 240,
    imageUrl: '/images/motos/m1000r.jpg',
    description: 'Le roadster ultime par BMW Motorrad M.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 212,
    torque: 114,
    consumption: 6.3,
    range: 260
  },
  {
    id: '24',
    brand: 'Ducati',
    model: 'Diavel V4',
    registration: 'OP-012-QR',
    category: 'A',
    style: 'Custom',
    status: 'PUBLISHED',
    currentKm: 4800,
    pricePerDay: 230,
    imageUrl: '/images/motos/diavelv4.jpg',
    description: 'Musclée, agressive et incroyablement agile.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 170,
    torque: 128,
    consumption: 6.3,
    range: 320
  },
  {
    id: '25',
    brand: 'Kawasaki',
    model: 'Vulcan S',
    registration: 'ST-345-UV',
    category: 'A2',
    style: 'Custom',
    status: 'PUBLISHED',
    currentKm: 11000,
    pricePerDay: 85,
    imageUrl: '/images/motos/vulcans.jpg',
    description: 'Le custom urbain moderne et accessible.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 61,
    torque: 63,
    consumption: 4.3,
    range: 310
  },
  {
    id: '26',
    brand: 'Honda',
    model: 'CBR1000RR-R',
    registration: 'WX-678-YZ',
    category: 'A',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 1200,
    pricePerDay: 220,
    imageUrl: '/images/motos/cbr1000rr-r.jpg',
    description: 'Née pour gagner sur circuit.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 218,
    torque: 114,
    consumption: 6.5,
    range: 250
  },
  {
    id: '28',
    brand: 'Moto Guzzi',
    model: 'V85 TT',
    registration: 'AB-901-CD',
    category: 'A2',
    style: 'Trail',
    status: 'PUBLISHED',
    currentKm: 8500,
    pricePerDay: 110,
    imageUrl: '/images/motos/v85tt.jpg',
    description: 'Le charme rétro italien pour voyager.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 82,
    torque: 84,
    consumption: 4.8,
    range: 470
  },
  {
    id: '29',
    brand: 'BMW',
    model: 'R 18',
    registration: 'EF-234-GH',
    category: 'A',
    style: 'Custom',
    status: 'PUBLISHED',
    currentKm: 3400,
    pricePerDay: 180,
    imageUrl: '/images/motos/r18.jpg',
    description: 'Le cruiser avec le plus gros Boxer jamais conçu.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 91,
    torque: 158,
    consumption: 5.5,
    range: 290
  },
  {
    id: '30',
    brand: 'Kawasaki',
    model: 'Ninja 1000SX',
    registration: 'IJ-567-KL',
    category: 'A',
    style: 'Touring',
    status: 'PUBLISHED',
    currentKm: 12400,
    pricePerDay: 140,
    imageUrl: '/images/motos/ninja1000sx.jpg',
    description: 'L\'équilibre parfait entre sport et tourisme.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 145,
    torque: 112,
    consumption: 5.7,
    range: 340
  },
  {
    id: '31',
    brand: 'Kawasaki',
    model: 'ZX-6R',
    registration: 'MN-890-OP',
    category: 'A',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 1800,
    pricePerDay: 155,
    imageUrl: '/images/motos/zx-6r.jpg',
    description: 'La supersport de référence pour dominer la piste et la route.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 126,
    torque: 71,
    consumption: 6.0,
    range: 290
  },
  {
    id: '32',
    brand: 'Triumph',
    model: 'Street Triple 765RS',
    registration: 'QR-123-ST',
    category: 'A',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 5200,
    pricePerDay: 145,
    imageUrl: '/images/motos/streettriple765rs.jpg',
    description: 'Le roadster ultime, précis et performant avec son moteur triple.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 132,
    torque: 82,
    consumption: 5.3,
    range: 290
  },
  {
    id: '27',
    brand: 'Nasa',
    model: 'TZR-777',
    registration: 'TZ-777-RN',
    category: 'A',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 0,
    pricePerDay: 320,
    imageUrl: '/images/motos/TZR-777.jpg',
    description: 'Prototype ultra-performant : puissance spatiale et autonomie record.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 500,
    torque: 300,
    consumption: 20,
    range: 700
  },
  {
    id: '33',
    brand: 'Honda',
    model: 'CB125R',
    registration: 'CB-125-RN',
    category: 'A1',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 0,
    pricePerDay: 65,
    imageUrl: '/images/motos/cb125r.jpg',
    description: 'Roadster A1 premium, idéal pour la ville et les petites routes.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 15,
    torque: 11.6,
    consumption: 2.2,
    range: 460
  },
  {
    id: '34',
    brand: 'KTM',
    model: '125 Duke',
    registration: 'DK-125-RN',
    category: 'A1',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 0,
    pricePerDay: 70,
    imageUrl: '/images/motos/duke125.jpg',
    description: 'Le roadster A1 nerveux et joueur, parfait pour s’amuser.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 15,
    torque: 11.5,
    consumption: 2.42,
    range: 620
  },
  {
    id: '35',
    brand: 'Yamaha',
    model: 'R125',
    registration: 'R1-25-RN',
    category: 'A1',
    style: 'Sportive',
    status: 'PUBLISHED',
    currentKm: 0,
    pricePerDay: 75,
    imageUrl: '/images/motos/r125.jpg',
    description: 'Supersport A1 au look racing, idéale pour débuter en sportive.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 15,
    torque: 11.5,
    consumption: 2.1,
    range: 520
  }
];

export function getMotoById(id: string): Motorbike | undefined {
  return MOCK_MOTOS.find(m => m.id === id);
}

export default function MotosPage() {
  const [selectedStyle, setSelectedStyle] = useState('Tous');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const handleReset = () => {
    setSelectedStyle('Tous');
    setSelectedCategory('Tous');
  };

  const filteredMotos = MOCK_MOTOS.filter((moto) => {
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
                    className={`px-6 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap ${selectedStyle === st ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-200' : 'bg-white border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600'
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
                    className={`px-8 py-2 rounded-full text-sm font-bold border-2 transition-all ${selectedCategory === cat ? 'bg-black border-black text-white shadow-md shadow-gray-300' : 'bg-white border-gray-200 text-gray-700 hover:border-black hover:text-black'
                      }`}
                  >
                    {cat === 'Tous' ? 'TOUS' : `PERMIS ${cat}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
