'use client';

import { Motorbike } from '@/types';
import { Button } from '@/components/ui/Button';
import { isMotoUnavailable, MotoAvailability, motosService } from '@/services/motos.service';
import { favoritesService } from '@/services/favorites.service';
import { reservationsService } from '@/services/reservations.service';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const kmFormatter = new Intl.NumberFormat('fr-FR');

const categoryDot: Record<string, string> = {
  A: '#7E2E32',
  A2: '#B5792F',
  A1: '#5d7a4a',
};

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });
const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isSameDay(a: Date, b: Date) {
  return toDateInputValue(a) === toDateInputValue(b);
}

function isBeforeDay(a: Date, b: Date) {
  return fromDateInputValue(toDateInputValue(a)).getTime() < fromDateInputValue(toDateInputValue(b)).getTime();
}

function isBetweenDays(day: Date, start: Date, end: Date) {
  const time = fromDateInputValue(toDateInputValue(day)).getTime();
  return time > start.getTime() && time < end.getTime();
}

function isDateInRanges(value: string, ranges: { startDate: string; endDate: string }[]) {
  return ranges.some((range) => value >= range.startDate && value <= range.endDate);
}

function hasUnavailableDayBetween(startValue: string, endValue: string, ranges: { startDate: string; endDate: string }[]) {
  return ranges.some((range) => range.startDate <= endValue && range.endDate >= startValue);
}

function getCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  unavailableRanges,
}: {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  unavailableRanges: { startDate: string; endDate: string }[];
}) {
  const today = fromDateInputValue(toDateInputValue(new Date()));
  const selectedStart = startDate ? fromDateInputValue(startDate) : null;
  const selectedEnd = endDate ? fromDateInputValue(endDate) : null;
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = selectedStart ?? today;
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const selectDay = (day: Date) => {
    const value = toDateInputValue(day);
    if (isBeforeDay(day, today) || isDateInRanges(value, unavailableRanges)) return;

    if (!selectedStart || selectedEnd || isBeforeDay(day, selectedStart)) {
      onStartDateChange(value);
      onEndDateChange('');
      return;
    }

    if (hasUnavailableDayBetween(startDate, value, unavailableRanges)) {
      onStartDateChange(value);
      onEndDateChange('');
      return;
    }

    onEndDateChange(value);
  };

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const days = getCalendarDays(visibleMonth);

  return (
    <div className="mb-[18px]">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-4 py-3">
          <p className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-[5px]">
            Départ
          </p>
          <p className="font-serif font-semibold text-[22px] leading-none text-[#1B1A17]">
            {selectedStart ? shortDateFormatter.format(selectedStart) : 'Choisir'}
          </p>
        </div>
        <div className="border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-4 py-3">
          <p className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-[5px]">
            Retour
          </p>
          <p className="font-serif font-semibold text-[22px] leading-none text-[#1B1A17]">
            {selectedEnd ? shortDateFormatter.format(selectedEnd) : 'Choisir'}
          </p>
        </div>
      </div>

      <div className="border border-[#E4DECF] bg-[#FBF9F3] rounded-[12px] p-3">
        <div className="flex items-center justify-between px-1 mb-3">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label="Mois précédent"
            className="w-9 h-9 rounded-full border border-[#E4DECF] bg-white text-[#7E2E32] hover:border-[#7E2E32] transition-colors"
          >
            &lt;
          </button>
          <p className="font-serif font-semibold text-[24px] leading-none capitalize">
            {monthFormatter.format(visibleMonth)}
          </p>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label="Mois suivant"
            className="w-9 h-9 rounded-full border border-[#E4DECF] bg-white text-[#7E2E32] hover:border-[#7E2E32] transition-colors"
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdayLabels.map((label) => (
            <div key={label} className="h-7 flex items-center justify-center font-mono text-[9px] tracking-[0.1em] uppercase text-[#a0967f]">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inCurrentMonth = day.getMonth() === visibleMonth.getMonth();
            const disabled = isBeforeDay(day, today);
            const unavailable = isDateInRanges(toDateInputValue(day), unavailableRanges);
            const isStart = !!selectedStart && isSameDay(day, selectedStart);
            const isEnd = !!selectedEnd && isSameDay(day, selectedEnd);
            const inRange = !!selectedStart && !!selectedEnd && isBetweenDays(day, selectedStart, selectedEnd);

            return (
              <button
                key={toDateInputValue(day)}
                type="button"
                disabled={disabled || unavailable}
                onClick={() => selectDay(day)}
                title={unavailable ? 'Déjà réservée' : undefined}
                className={[
                  'h-10 rounded-[8px] text-[13px] transition-colors outline-none focus:ring-2 focus:ring-[#7E2E32]/25',
                  inCurrentMonth ? 'text-[#1B1A17]' : 'text-[#c0b69f]',
                  disabled ? 'cursor-not-allowed text-[#d2c8b4]' : 'hover:bg-white hover:text-[#7E2E32]',
                  unavailable ? 'cursor-not-allowed border border-[#e6b9b3] bg-[#F8ECEA] text-[#9a3b35] line-through hover:bg-[#F8ECEA] hover:text-[#9a3b35]' : '',
                  inRange ? 'bg-[#EFE8DA] text-[#7E2E32]' : '',
                  isStart || isEnd ? 'bg-[#7E2E32] text-[#F4F1E9] hover:bg-[#651f23] hover:text-[#F4F1E9]' : '',
                ].join(' ')}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-[10.5px] tracking-[0.08em] uppercase text-[#a0967f]">
        {!selectedStart && 'Sélectionnez une date de départ'}
        {selectedStart && !selectedEnd && 'Sélectionnez une date de retour'}
        {selectedStart && selectedEnd && 'Période sélectionnée'}
      </p>
      {unavailableRanges.length > 0 && (
        <p className="mt-2 text-center font-mono text-[10px] tracking-[0.08em] uppercase text-[#9a3b35]">
          Les jours rouges sont déjà réservés
        </p>
      )}
    </div>
  );
}

export default function MotoDetails() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params?.id as string;

  const [moto, setMoto] = useState<Motorbike | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [availability, setAvailability] = useState<MotoAvailability | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const paymentRedirectingRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([motosService.getById(id), motosService.getAvailability(id)])
      .then(([motoData, availabilityData]) => {
        setMoto(motoData);
        setAvailability(availabilityData);
      })
      .catch((e) => setError(e.message || 'Moto introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || authLoading || !isAuthenticated) {
      setIsFavorite(false);
      return;
    }

    let active = true;
    favoritesService.getIds()
      .then((ids) => {
        if (active) setIsFavorite(ids.includes(id));
      })
      .catch(() => {
        if (active) setIsFavorite(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, id, isAuthenticated]);

  const days = (() => {
    if (!startDate || !endDate) return 1;
    const d = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
    return Math.max(d, 1);
  })();

  const subtotal = moto ? days * moto.pricePerDay : 0;
  const unavailableRanges = availability?.unavailableRanges ?? [];
  const isAvailable = !!moto && !isMotoUnavailable(moto.status);

  async function toggleFavorite() {
    if (!moto) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const previous = isFavorite;
    setIsFavorite(!previous);
    setSavingFavorite(true);
    try {
      if (previous) await favoritesService.remove(moto.id);
      else await favoritesService.add(moto.id);
    } catch {
      setIsFavorite(previous);
    } finally {
      setSavingFavorite(false);
    }
  }

  async function confirmReservation() {
    if (!moto) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!startDate || !endDate) return;
    if (hasUnavailableDayBetween(startDate, endDate, unavailableRanges)) {
      setBookingError('Cette période contient déjà des jours réservés.');
      return;
    }

    setBookingError(null);
    setPaymentOpen(true);
  }

  async function submitPayment() {
    if (isBooking || paymentRedirectingRef.current) return;
    if (!moto) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!startDate || !endDate) return;
    if (hasUnavailableDayBetween(startDate, endDate, unavailableRanges)) {
      setBookingError('Cette période contient déjà des jours réservés.');
      return;
    }

    setBookingError(null);
    setIsBooking(true);
    paymentRedirectingRef.current = true;
    try {
      const reservation = await reservationsService.createMine({ motoId: moto.id, startDate, endDate });
      const checkout = await reservationsService.payMine(reservation.id);
      window.location.href = checkout.checkoutUrl;
    } catch (e) {
      paymentRedirectingRef.current = false;
      setBookingError(e instanceof Error ? e.message : 'Paiement impossible.');
      setIsBooking(false);
    } finally {
      if (!paymentRedirectingRef.current) setIsBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-10 py-9 animate-pulse">
        <div className="h-4 bg-[#ece8df] rounded w-56 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-11">
          <div className="space-y-6">
            <div className="aspect-[4/3] rounded-[18px] bg-[#ece8df]" />
            <div className="grid grid-cols-3 gap-0 border border-[#E4DECF]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[90px] bg-[#ece8df] border-r border-b border-[#E4DECF]" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-3 bg-[#ece8df] rounded w-1/4" />
            <div className="h-12 bg-[#ece8df] rounded w-3/4" />
            <div className="h-4 bg-[#ece8df] rounded w-full" />
            <div className="h-4 bg-[#ece8df] rounded w-2/3" />
            <div className="h-64 bg-[#ece8df] rounded-[16px] mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !moto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="font-serif font-semibold text-[48px] mb-4">Moto introuvable</h1>
        <p className="text-[#56503f] mb-8">{error || 'La moto que vous recherchez n\'existe pas ou a été retirée.'}</p>
        <Link
          href="/motos"
          className="bg-[#7E2E32] text-[#F4F1E9] px-8 py-4 rounded-full text-[13px] hover:bg-[#651f23] transition-colors"
        >
          ← Collection
        </Link>
      </div>
    );
  }

  const specs = [
    { label: 'Puissance', value: moto.hp, unit: 'ch' },
    { label: 'Couple', value: moto.torque, unit: 'Nm' },
    { label: 'Consommation', value: moto.consumption, unit: 'L/100' },
    { label: 'Autonomie', value: moto.range, unit: 'km' },
    { label: 'Année', value: moto.year, unit: '' },
    { label: 'Compteur', value: kmFormatter.format(moto.currentKm), unit: 'km' },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-10 pt-[34px] pb-5">
      <p className="font-mono text-[11px] tracking-[0.1em] text-[#9a8f74] mb-7">
        <Link href="/motos" className="text-[#7E2E32] hover:opacity-70 transition-opacity">
          ← Collection
        </Link>
        {' '}&nbsp;/&nbsp; {moto.brand} {moto.model}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-11 items-start">
        <div>
          <div
            className="relative bg-white border border-[#ECE5D5] rounded-[18px] h-[420px] flex items-center justify-center overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(closest-side, #ffffff 55%, rgba(255,255,255,0) 80%)' }}
            />
            <span className="absolute top-5 left-5 flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-[#5d5749] border border-[#ECE5D5] px-3 py-[6px] rounded-full bg-white/90">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: categoryDot[moto.category] ?? '#9a8f74' }}
              />
              Permis {moto.category}
            </span>
            <span className="absolute top-5 right-5 font-mono text-[10px] tracking-[0.16em] uppercase text-[#9a8f74]">
              {moto.style}
            </span>
            <Image
              src={moto.imageUrl}
              alt={`${moto.brand} ${moto.model}`}
              width={460}
              height={340}
              className="relative max-h-[340px] w-auto object-contain"
              priority
            />
          </div>

          <h2 className="font-serif font-semibold text-[30px] mt-10 mb-[18px]">Caractéristiques</h2>
          <div
            className="grid grid-cols-3 border-t border-l border-[#E4DECF]"
          >
            {specs.map((s) => (
              <div
                key={s.label}
                className="px-5 py-[22px] border-r border-b border-[#E4DECF]"
              >
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#a0967f] mb-[7px]">
                  {s.label}
                </p>
                <p className="font-serif font-semibold text-[30px] leading-none">
                  {s.value}
                  <span className="text-[13px] font-sans font-normal text-[#9a8f74]"> {s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#7E2E32] mb-2">
            {moto.brand}
          </p>
          <h1 className="font-serif font-semibold text-[50px] leading-[1.0] tracking-[-0.01em] mb-[18px]">
            {moto.model}
          </h1>
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={savingFavorite}
            className={[
              'mb-5 inline-flex items-center gap-2 border px-4 py-[10px] rounded-full font-mono text-[11.5px] tracking-[0.08em] uppercase transition-colors cursor-pointer',
              isFavorite
                ? 'bg-[#7E2E32] border-[#7E2E32] text-white'
                : 'bg-white border-[#E4DECF] text-[#7E2E32] hover:border-[#7E2E32]',
              savingFavorite ? 'opacity-60 cursor-wait' : '',
            ].join(' ')}
          >
            <span className="text-[16px] leading-none">{isFavorite ? '♥' : '♡'}</span>
            {isFavorite ? 'Dans mes favoris' : 'Ajouter aux favoris'}
          </button>
          <p className="text-[15px] leading-[1.7] text-[#56503f] mb-7">
            {moto.description}
          </p>

          <div className="bg-white border border-[#ECE5D5] rounded-[16px] p-7">
            <div className="flex items-baseline justify-between mb-[22px]">
              <div>
                <span className="font-serif font-semibold text-[38px]">{moto.pricePerDay}€</span>
                <span className="text-[13px] text-[#9a8f74]"> /jour</span>
              </div>
              <span className={`font-mono text-[11px] tracking-[0.08em] ${isAvailable ? 'text-[#5d9a6a]' : 'text-[#9a3b35]'}`}>
                {isAvailable ? '✓ Disponible' : 'Indisponible'}
              </span>
            </div>

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(value) => {
                setStartDate(value);
                setPaymentOpen(false);
                setBookingError(null);
              }}
              onEndDateChange={(value) => {
                setEndDate(value);
                setPaymentOpen(false);
                setBookingError(null);
              }}
              unavailableRanges={unavailableRanges}
            />

            {paymentOpen && (
              <div className="border border-[#E4DECF] bg-[#FBF9F3] rounded-[12px] p-4 mb-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#7E2E32] mb-1">
                      Paiement Stripe
                    </p>
                    <p className="text-[12.5px] text-[#8a7f63]">
                      Vous allez être redirigé vers Stripe Checkout en mode test.
                    </p>
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#5d9a6a] bg-white border border-[#D9E8D9] rounded-full px-3 py-[6px]">
                    Externe
                  </span>
                </div>
                <p className="mt-3 text-[11.5px] leading-[1.6] text-[#8a7f63]">
                  Carte de test acceptée: 4242 4242 4242 4242. Aucun paiement réel ne sera débité avec une clé Stripe de test.
                </p>
              </div>
            )}

            <div className="border-t border-[#F0EADB] pt-4">
              <div className="flex justify-between text-[13.5px] text-[#56503f] mb-[10px]">
                <span>{moto.pricePerDay}€ × {days} jour{days > 1 ? 's' : ''}</span>
                <span>{subtotal}€</span>
              </div>
              <div className="flex justify-between text-[13.5px] text-[#56503f] mb-3">
                <span>Assurance &amp; assistance</span>
                <span className="text-[#5d9a6a]">Incluses</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-[#E4DECF] pt-3">
                <span className="text-[13px] uppercase tracking-[0.04em]">Total</span>
                <span className="font-serif font-semibold text-[34px]">{subtotal}€</span>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full mt-5"
              disabled={!startDate || !endDate || isBooking}
              onClick={paymentOpen ? submitPayment : confirmReservation}
            >
              {isBooking ? 'Redirection...' : paymentOpen ? 'Payer avec Stripe' : 'Confirmer la réservation'}
            </Button>
            {bookingError && (
              <p className="text-center text-[12px] text-[#9a3b35] mt-3">
                {bookingError}
              </p>
            )}
            <p className="text-center text-[11.5px] text-[#a0967f] mt-3">
              Annulation gratuite jusqu&apos;à 48h avant le départ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
