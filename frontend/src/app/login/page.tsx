'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      await login(email || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Saisissez votre email avant de demander la réinitialisation.');
      return;
    }
    try {
      await resetPassword(email);
      setInfo('Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.');
    } catch {
      setInfo('Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.');
    }
  };

  return (
    <div className="flex justify-center px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-[980px] bg-white border border-[#ECE5D5] rounded-[20px] overflow-hidden shadow-[0_40px_90px_-50px_rgba(40,30,20,0.45)]">
        <div className="relative bg-[#1B1A17] text-[#F4F1E9] px-11 py-12 flex flex-col justify-between min-h-[520px] overflow-hidden">
          <div className="font-serif text-[23px] font-semibold relative z-10">
            Plein Gaz Loc<span className="text-[#d8a96a]">.</span>
          </div>
          <div className="relative z-10">
            <h2 className="font-serif font-medium text-[42px] leading-[1.05] mb-3">
              Reprenez<br />
              <span className="italic text-[#d8a96a]">la route.</span>
            </h2>
            <p className="text-[14px] text-[#bcb3a1] max-w-[280px]">
              Retrouvez vos réservations, vos favoris et vos offres personnalisées.
            </p>
          </div>
          <div className="absolute right-[-70px] bottom-6 w-[400px] opacity-90 pointer-events-none z-[1] mix-blend-lighten">
            <Image
              src="/images/motos/diavelv4.jpg"
              alt=""
              width={400}
              height={260}
              className="object-contain"
            />
          </div>
        </div>

        <div className="px-12 py-[52px]">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#7E2E32] mb-[10px]">
            Espace client
          </p>
          <h1 className="font-serif font-semibold text-[38px] mb-7">Se connecter</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-[#e6b9b3] bg-[#F8ECEA] px-4 py-3 text-[13px] text-[#9a3b35]">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl border border-[#bcd9c4] bg-[#EAF3EC] px-4 py-3 text-[13px] text-[#2f6b44]">
                {info}
              </div>
            )}

            <label className="block">
              <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                Adresse e-mail
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[14px] py-[13px] text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
              />
            </label>

            <div className="text-right">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[12px] text-[#7E2E32] hover:opacity-70 transition-opacity cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button type="submit" disabled={isSubmitting} variant="primary" size="lg" className="w-full mt-2">
              {isSubmitting ? 'Redirection...' : 'Se connecter avec Keycloak'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-[26px]">
            <span className="flex-1 h-px bg-[#E4DECF]" />
            <span className="text-[11px] text-[#a0967f]">ou</span>
            <span className="flex-1 h-px bg-[#E4DECF]" />
          </div>

          <p className="text-center text-[13.5px] text-[#56503f]">
            Pas encore de compte ?{' '}
            <Link
              href="/register"
              className="text-[#7E2E32] border-b border-[#7E2E32] pb-px hover:opacity-70 transition-opacity"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
