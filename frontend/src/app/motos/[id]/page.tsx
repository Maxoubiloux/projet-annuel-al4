'use client';

import { Motorbike } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

// On importe les données mockées pour la démo (on pourrait aussi les mettre dans un service partagé)
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
    description: 'La reine des roadsters, maniable et joueuse. Parfaite pour débuter ou pour le plaisir pur.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 73.4,
    torque: 67,
    consumption: 4.2,
    range: 330
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
    description: 'Parfaite pour l\'aventure et les longs trajets. Une fiabilité légendaire.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 102,
    torque: 105,
    consumption: 4.9,
    range: 380
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
    description: 'Une supersportive sans concession pour les sensations fortes. Technologie de pointe.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 210,
    torque: 113,
    consumption: 6.4,
    range: 250
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
    description: 'Le style néo-rétro iconique avec un moteur moderne et coupleux.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 80,
    torque: 105,
    consumption: 4.7,
    range: 300
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
    description: 'Polyvalence et confort au quotidien. Idéale pour le duo.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 67,
    torque: 61,
    consumption: 4.5,
    range: 450
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
    description: 'L\'excellence italienne sur deux roues. Puissance et design à couper le souffle.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 215,
    torque: 124,
    consumption: 7.6,
    range: 210
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
    description: 'Le style custom authentique et minimaliste. Le son Harley inimitable.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2022,
    hp: 52,
    torque: 68,
    consumption: 4.8,
    range: 260
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
    description: 'Sportive équilibrée pour la route et le plaisir. Accessible et performante.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 68,
    torque: 64,
    consumption: 4.3,
    range: 350
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
    description: 'L\'esprit rallye-raid accessible à tous. Prête pour tous les terrains.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 73,
    torque: 68,
    consumption: 4.2,
    range: 380
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
    hp: 145,
    torque: 149,
    consumption: 4.8,
    range: 400
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
    description: 'L\'essence même du roadster sportif italien. Légèreté et caractère.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 111,
    torque: 93,
    consumption: 5.2,
    range: 270
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
    description: 'Puissance brute et design Sugomi. Un quatre cylindres rageur.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 125,
    torque: 98,
    consumption: 5.7,
    range: 300
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
    description: 'L\'icône massive du custom américain. Une présence incroyable.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 94,
    torque: 155,
    consumption: 5.5,
    range: 340
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
    description: 'La légende de la vitesse et de la puissance. Un confort surprenant.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 190,
    torque: 150,
    consumption: 6.7,
    range: 300
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
    description: 'Le summum du confort pour le grand tourisme. Comme un tapis volant.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 126,
    torque: 170,
    consumption: 5.5,
    range: 380
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
    hp: 190,
    torque: 145,
    consumption: 5.9,
    range: 290
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
    description: 'Technologie issue de la compétition pour la route. Un moteur crossplane unique.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 200,
    torque: 113,
    consumption: 7.2,
    range: 240
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
    description: 'Six cylindres pour un voyage en première classe. Velouté et puissance.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 160,
    torque: 180,
    consumption: 5.9,
    range: 450
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
    description: 'Sportivité et aventure sans limites. Quatre motos en une.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 170,
    torque: 125,
    consumption: 6.5,
    range: 340
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
    description: 'L\'unique moto de série compressée. Accélérations foudroyantes.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 231,
    torque: 141,
    consumption: 8.5,
    range: 200
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
    description: 'Le bagger américain authentique. Confort et technologie.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 92,
    torque: 171,
    consumption: 5.8,
    range: 320
  },
  {
    id: '22',
    brand: 'Triumph',
    model: 'Tiger 900 GT Pro',
    registration: 'GH-456-IJ',
    category: 'A',
    style: 'Trail',
    status: 'PUBLISHED',
    currentKm: 10500,
    pricePerDay: 135,
    imageUrl: '/images/motos/tiger900.jpg',
    description: 'Le trail polyvalent par excellence. Moteur trois cylindres généreux.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 95,
    torque: 87,
    consumption: 5.2,
    range: 350
  },
  {
    id: '23',
    brand: 'BMW',
    model: 'M 1000 R',
    registration: 'KL-789-MN',
    category: 'A',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 1800,
    pricePerDay: 240,
    imageUrl: '/images/motos/m1000r.jpg',
    description: 'L\'hyper roadster par BMW Motorrad. Performances de circuit sans carénage.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 210,
    torque: 113,
    consumption: 6.4,
    range: 250
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
    description: 'Musclée, agressive et incroyablement agile. Un cruiser hors normes.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 168,
    torque: 126,
    consumption: 6.4,
    range: 310
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
    description: 'Le custom urbain moderne et accessible. Position de conduite ajustable.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 61,
    torque: 63,
    consumption: 4.4,
    range: 300
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
    description: 'Née pour gagner sur circuit. ADN de compétition pur.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 217,
    torque: 113,
    consumption: 6.6,
    range: 240
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
    description: 'Le charme rétro italien pour voyager. Cardan et moteur en V face à la route.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 80,
    torque: 82,
    consumption: 4.9,
    range: 460
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
    description: 'Le cruiser avec le plus gros Boxer jamais conçu. Retour aux sources.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 91,
    torque: 158,
    consumption: 5.6,
    range: 280
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
    description: 'L\'équilibre parfait entre sport et tourisme. Confort et protection.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 142,
    torque: 111,
    consumption: 5.8,
    range: 330
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
    description: 'La supersport de référence pour dominer la piste et la route. Précision chirurgicale.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 124,
    torque: 69,
    consumption: 6.1,
    range: 280
  },
  {
    id: '32',
    brand: 'Triumph',
    model: 'Street Triple 765RS',
    registration: 'QR-123-ST',
    category: 'A',
    style: 'Roadster',
    status: 'PUBLISHED',
    currentKm: 2500,
    pricePerDay: 145,
    imageUrl: '/images/motos/street765rs.jpg',
    description: 'Le roadster de moyenne cylindrée le plus performant. Moteur Moto2.',
    createdAt: '2026-03-26T10:30:00.000Z',
    year: 2026,
    hp: 130,
    torque: 80,
    consumption: 5.4,
    range: 270
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

export default function MotoDetails() {
  const params = useParams();
  const id = params?.id as string;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const moto = MOCK_MOTOS.find(m => m.id === id);

  if (!moto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">MOTO NON TROUVÉE</h1>
        <p className="text-gray-600 mb-8">Désolé, la moto que vous recherchez n&apos;existe pas ou a été retirée.</p>
        <Link href="/motos" className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return diffDays * moto.pricePerDay;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation Breadcrumbs */}
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
          {/* Image Section */}
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
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-white ${moto.category === 'A' ? 'bg-red-600' : moto.category === 'A2' ? 'bg-orange-500' : 'bg-green-600'
                  }`}>
                  PERMIS {moto.category}
                </span>
                <span className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-white">
                  {moto.style}
                </span>
              </div>
            </div>

            {/* Technical Specs Cards */}
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
                <p className="text-xl font-bold text-gray-900" suppressHydrationWarning>{moto.currentKm.toLocaleString()} <span className="text-sm">km</span></p>
              </div>
            </div>
          </div>

          {/* Details & Booking Section */}
          <div className="flex flex-col">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 italic uppercase leading-none mb-4">
                {moto.brand} <span className="text-red-600">{moto.model}</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {moto.description}
              </p>
            </div>

            {/* Booking Card */}
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

              {/* Trust Badges */}
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
