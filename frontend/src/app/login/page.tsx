'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    router.push('/');
  };

  return (
    <div className="flex justify-center px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-[980px] bg-white border border-[#ECE5D5] rounded-[20px] overflow-hidden shadow-[0_40px_90px_-50px_rgba(40,30,20,0.45)]">
        <div className="relative bg-[#1B1A17] text-[#F4F1E9] px-11 py-12 flex flex-col justify-between min-h-[520px] overflow-hidden">
          <div className="font-serif text-[23px] font-semibold relative z-10">
            City Moto Yard<span className="text-[#d8a96a]">.</span>
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

            <label className="block">
              <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                Mot de passe
              </span>
              <input
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[14px] py-[13px] text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
              />
            </label>

            <div className="text-right">
              <a href="#" className="text-[12px] text-[#7E2E32] hover:opacity-70 transition-opacity">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#7E2E32] text-[#F4F1E9] text-[13.5px] tracking-[0.04em] py-[15px] rounded-full hover:bg-[#651f23] transition-colors mt-2"
            >
              Se connecter
            </button>
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
