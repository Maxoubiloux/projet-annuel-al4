'use client';

import { reservationsService } from '@/services/reservations.service';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservationId');
  const sessionId = searchParams.get('session_id');
  const hasIncompleteStripeReturn = !reservationId || !sessionId;
  const { isAuthenticated, isLoading } = useAuth();
  const [message, setMessage] = useState('Validation du paiement...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (hasIncompleteStripeReturn) return;

    let active = true;
    reservationsService.confirmPayment(reservationId, sessionId)
      .then(() => {
        if (!active) return;
        setMessage('Paiement validé. Redirection vers vos réservations...');
        setTimeout(() => router.replace('/reservations'), 900);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Paiement impossible à valider.');
      });

    return () => {
      active = false;
    };
  }, [hasIncompleteStripeReturn, isAuthenticated, isLoading, reservationId, router, sessionId]);

  const displayError = error ?? (hasIncompleteStripeReturn ? 'Retour Stripe incomplet.' : null);

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[520px] border border-[#ECE5D5] bg-white rounded-[16px] px-8 py-10 text-center">
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#7E2E32] mb-3">
          Paiement Stripe
        </p>
        <h1 className="font-serif font-semibold text-[38px] leading-none mb-4">
          {displayError ? 'Validation impossible' : 'Paiement reçu'}
        </h1>
        <p className="text-[14.5px] leading-[1.7] text-[#7a715a] mb-7">
          {displayError ?? message}
        </p>
        {displayError && (
          <Link
            href="/reservations"
            className="inline-block bg-[#7E2E32] text-[#F4F1E9] font-mono text-[13px] tracking-[0.04em] px-[30px] py-[14px] rounded-full hover:bg-[#651f23] transition-colors"
          >
            Voir mes réservations
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
