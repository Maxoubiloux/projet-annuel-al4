'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(244,241,233,0.88)] backdrop-blur-md border-b border-[#E4DECF]">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between px-10 py-[22px]">
        <Link
          href="/"
          className="font-serif text-[24px] font-semibold tracking-[0.01em] text-[#1B1A17] hover:opacity-80 transition-opacity"
        >
          City Moto Yard<span className="text-[#7E2E32]">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-[34px]">
          <Link
            href="/motos"
            className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#5d5749] hover:text-[#7E2E32] transition-colors"
          >
            Motos
          </Link>
          <Link
            href="/univers"
            className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#5d5749] hover:text-[#7E2E32] transition-colors"
          >
            Univers
          </Link>
          <Link
            href="/agences"
            className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#5d5749] hover:text-[#7E2E32] transition-colors"
          >
            Agences
          </Link>
          <Link
            href="/offres"
            className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#5d5749] hover:text-[#7E2E32] transition-colors"
          >
            Offres
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-[18px]">
          {isAuthenticated ? (
            <>
              <span className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#5d5749]">
                {user?.firstName}
              </span>
              <button
                onClick={logout}
                className="font-mono text-[11.5px] tracking-[0.16em] uppercase border border-[#7E2E32] text-[#7E2E32] px-5 py-[9px] rounded-full hover:bg-[#7E2E32] hover:text-[#F4F1E9] transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#5d5749] hover:text-[#7E2E32] transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/motos"
                className="font-mono text-[11.5px] tracking-[0.16em] uppercase border border-[#7E2E32] text-[#7E2E32] px-5 py-[9px] rounded-full hover:bg-[#7E2E32] hover:text-[#F4F1E9] transition-colors"
              >
                Réserver
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
