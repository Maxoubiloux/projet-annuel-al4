'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountSidebar from '@/components/ui/AccountSidebar';
import { ReservationSummary, reservationsService } from '@/services/reservations.service';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' });

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

function isPastReservation(reservation: ReservationSummary): boolean {
  if (['completed', 'cancelled'].includes(reservation.status)) return true;
  const end = new Date(reservation.endDate);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
}

function statusLabel(status: string): string {
  if (status === 'confirmed') return 'Confirmée';
  if (status === 'pending') return 'En attente';
  if (status === 'in_progress') return 'En cours';
  if (status === 'completed') return 'Terminée';
  if (status === 'cancelled') return 'Annulée';
  return status;
}

function paymentStatusLabel(status: string): string {
  if (status === 'paid') return 'Payé';
  if (status === 'pending') return 'Paiement en attente';
  if (status === 'failed') return 'Paiement refusé';
  if (status === 'refunded') return 'Remboursé';
  return status;
}

function StatusBadge({ status }: { status: string }) {
  const label = statusLabel(status);
  const base = 'font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-[6px] rounded-full';
  if (status === 'completed' || status === 'cancelled') {
    return <span className={`${base} text-[#9a8f74] bg-[#F1ECE0]`}>{label}</span>;
  }
  if (status === 'pending') {
    return <span className={`${base} text-[#7E2E32] bg-[#F6E9E6]`}>{label}</span>;
  }
  return <span className={`${base} text-[#3d7a52] bg-[#E6F0E8]`}>{label}</span>;
}

function PaymentStatusBadge({ status }: { status: string }) {
  const label = paymentStatusLabel(status);
  const base = 'font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-[6px] rounded-full';
  if (status === 'paid') {
    return <span className={`${base} text-[#3d7a52] bg-[#E6F0E8]`}>{label}</span>;
  }
  if (status === 'failed') {
    return <span className={`${base} text-[#9a3b35] bg-[#F8ECEA]`}>{label}</span>;
  }
  return <span className={`${base} text-[#7E2E32] bg-[#F6E9E6]`}>{label}</span>;
}

function ReservationCard({
  reservation,
  compact = false,
  onPay,
  paying,
}: {
  reservation: ReservationSummary;
  compact?: boolean;
  onPay?: (reservation: ReservationSummary) => void;
  paying?: boolean;
}) {
  const moto = reservation.moto;
  const shop = reservation.shop;
  const from = dateFormatter.format(new Date(reservation.startDate));
  const to = dateFormatter.format(new Date(reservation.endDate));
  const days = daysBetween(reservation.startDate, reservation.endDate);
  const imageUrl = moto?.imageUrl || '/images/motos/default.jpg';

  return (
    <div
      className={[
        compact ? 'bg-[#FBF9F3] grid-cols-[90px_1fr_auto] py-[18px]' : 'bg-white grid-cols-[120px_1fr_auto] py-5',
        'border border-[#ECE5D5] rounded-[14px] px-[22px] grid gap-[22px] items-center',
      ].join(' ')}
    >
      <div
        className={[
          compact ? 'h-[60px] p-[6px]' : 'h-20 p-2',
          'border border-[#F0EADB] rounded-[10px] flex items-center justify-center',
        ].join(' ')}
        style={{ background: 'radial-gradient(closest-side, #ffffff 60%, #faf7f0 100%)' }}
      >
        <Image
          src={imageUrl}
          alt={moto?.model || 'Moto'}
          width={compact ? 80 : 100}
          height={compact ? 52 : 64}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-[7px]">
          <span className={`font-mono text-[10px] tracking-[0.14em] uppercase ${compact ? 'text-[#a0967f]' : 'text-[#7E2E32]'}`}>
            {moto?.brand || 'Moto'}
          </span>
          <StatusBadge status={reservation.status} />
          <PaymentStatusBadge status={reservation.paymentStatus} />
        </div>
        <h3 className={`${compact ? 'text-[21px] text-[#3c352c]' : 'text-[24px]'} font-serif font-semibold leading-none mb-[6px]`}>
          {moto?.model || 'Modèle'}
        </h3>
        <p className={`font-mono text-[11px] ${compact ? 'text-[#9a8f74]' : 'text-[#8a7f63]'}`}>
          {from} → {to} · {days} jour{days > 1 ? 's' : ''} · {shop ? shop.name : 'Agence à définir'} · {reservation.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
      <div className="text-right">
        <div className={`${compact ? 'text-[22px] text-[#3c352c]' : 'text-[26px]'} font-serif font-semibold`}>
          {reservation.totalAmount}€
        </div>
        {reservation.paymentStatus === 'pending' && reservation.status === 'pending' && onPay ? (
          <button
            type="button"
            disabled={paying}
            onClick={() => onPay(reservation)}
            className="inline-block text-[12px] text-[#7E2E32] border-b border-[#7E2E32] pb-[2px] mt-2 hover:text-[#1B1A17] hover:border-[#1B1A17] transition-colors disabled:opacity-60"
          >
            {paying ? 'Redirection...' : 'Payer maintenant →'}
          </button>
        ) : (
          <Link
            href={moto ? `/motos/${moto.id}` : '/motos'}
            className="inline-block text-[12px] text-[#1B1A17] border-b border-[#b9a87f] pb-[2px] mt-2 hover:text-[#7E2E32] hover:border-[#7E2E32] transition-colors"
          >
            Voir la moto →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingReservationId, setPayingReservationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    let active = true;
    reservationsService.getMine()
      .then((data) => {
        if (!active) return;
        setReservations(data);
        setError(null);
      })
      .catch((e) => {
        if (active) setError(e.message || 'Erreur lors du chargement des réservations.');
      })
      .finally(() => {
        if (active) setLoadingReservations(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) return null;

  const firstName = user?.firstName ?? 'vous';
  const upcoming = reservations.filter((r) => !isPastReservation(r));
  const past = reservations.filter(isPastReservation);
  const totalKm = reservations.length * 320;
  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  async function resumePayment(reservation: ReservationSummary) {
    setError(null);
    setPayingReservationId(reservation.id);
    try {
      const checkout = await reservationsService.payMine(reservation.id);
      window.location.href = checkout.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Paiement impossible.');
      setPayingReservationId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5 mb-9">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
              Espace client
            </p>
            <h1 className="font-serif font-semibold text-[56px] leading-none tracking-[-0.015em]">
              Bonjour,{' '}
              <span className="italic text-[#7E2E32]">{firstName}</span>
            </h1>
          </div>
          <div className="flex gap-9 text-right">
            {[
              { value: String(reservations.length), label: 'Réservations' },
              { value: totalKm.toLocaleString('fr-FR'), label: 'Km estimés' },
              { value: String(memberYear), label: 'Membre depuis' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif font-semibold text-[30px] leading-none">{s.value}</div>
                <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#8a7f63] mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.26fr_0.74fr] gap-11 items-start">
          <AccountSidebar />

          <div>
            {loadingReservations ? (
              <div className="flex flex-col gap-[14px]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[122px] bg-white border border-[#ECE5D5] rounded-[14px] animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-[74px] px-[30px] border border-dashed border-[#d9cfb8] rounded-[18px] bg-[#FBF9F3]">
                <h2 className="font-serif font-semibold italic text-[28px] text-[#1B1A17] mb-3">
                  Chargement impossible
                </h2>
                <p className="text-[14.5px] leading-[1.7] text-[#7a715a] max-w-[420px] mx-auto">
                  {error}
                </p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-[74px] px-[30px] border border-dashed border-[#d9cfb8] rounded-[18px] bg-[#FBF9F3]">
                <h2 className="font-serif font-semibold italic text-[28px] text-[#1B1A17] mb-3">
                  Aucune réservation pour le moment
                </h2>
                <p className="text-[14.5px] leading-[1.7] text-[#7a715a] max-w-[390px] mx-auto mb-[26px]">
                  Choisissez une moto et une période pour créer votre première réservation.
                </p>
                <Link
                  href="/motos"
                  className="inline-block bg-[#7E2E32] text-[#F4F1E9] font-mono text-[13px] tracking-[0.04em] px-[30px] py-[14px] rounded-full hover:bg-[#651f23] transition-colors"
                >
                  Découvrir les motos
                </Link>
              </div>
            ) : (
              <>
                <h2 className="font-serif font-semibold text-[28px] mb-[18px]">À venir</h2>
                <div className="flex flex-col gap-[14px] mb-11">
                  {upcoming.length > 0 ? (
                    upcoming.map((r) => (
                      <ReservationCard
                        key={r.id}
                        reservation={r}
                        onPay={resumePayment}
                        paying={payingReservationId === r.id}
                      />
                    ))
                  ) : (
                    <div className="text-[14px] text-[#8a7f63] border border-dashed border-[#d9cfb8] rounded-[14px] px-5 py-6 bg-[#FBF9F3]">
                      Aucune réservation à venir.
                    </div>
                  )}
                </div>

                <h2 className="font-serif font-semibold text-[28px] mb-[18px]">Historique</h2>
                <div className="flex flex-col gap-[14px]">
                  {past.length > 0 ? (
                    past.map((r) => <ReservationCard key={r.id} reservation={r} compact />)
                  ) : (
                    <div className="text-[14px] text-[#8a7f63] border border-dashed border-[#d9cfb8] rounded-[14px] px-5 py-6 bg-[#FBF9F3]">
                      Aucun historique pour le moment.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
