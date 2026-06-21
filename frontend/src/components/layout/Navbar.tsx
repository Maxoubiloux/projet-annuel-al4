'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const initials = user
    ? ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase()
    : '';

  function handleLogout() {
    setMenuOpen(false);
    logout();
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(244,241,233,0.88)] backdrop-blur-md border-b border-[#E4DECF]">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between px-10 py-[22px]">

        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-[24px] font-semibold tracking-[0.01em] text-[#1B1A17] hover:opacity-80 transition-opacity"
        >
          City Moto Yard<span className="text-[#7E2E32]">.</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-[34px]">
          {(['Motos', 'Univers', 'Agences', 'Offres'] as const).map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase()}`}
              className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#5d5749] hover:text-[#7E2E32] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-4">

          {isAuthenticated ? (
            /* ── User dropdown ── */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-[10px] px-[5px] pr-3 py-[5px] rounded-full border border-[#E4DECF] bg-white/55 hover:border-[#7E2E32] hover:bg-white transition-all focus-visible:outline-2 focus-visible:outline-[#7E2E32] focus-visible:outline-offset-2"
              >
                {/* Avatar */}
                <span className="w-[30px] h-[30px] rounded-full bg-[#1B1A17] text-[#F4F1E9] flex items-center justify-center font-serif text-[14px] font-semibold tracking-[0.02em] select-none shrink-0">
                  {initials}
                </span>
                <span className="text-[12.5px] text-[#1B1A17] tracking-[0.01em] whitespace-nowrap">
                  {user?.firstName} {user?.lastName}
                </span>
                {/* Chevron */}
                <svg
                  width="8" height="5" viewBox="0 0 8 5" fill="none"
                  className={`text-[#9a8f74] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+12px)] w-[250px] bg-white border border-[#ECE5D5] rounded-[14px] shadow-[0_30px_60px_-28px_rgba(40,30,20,0.5)] overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-[18px] py-[18px] pb-[15px] border-b border-[#F0EADB] bg-[#FBF9F3]">
                    <div className="font-serif text-[20px] font-semibold leading-none">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="font-mono text-[11px] text-[#9a8f74] mt-[7px] truncate">
                      {user?.email}
                    </div>
                  </div>

                  {/* Items */}
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-[11px] px-[18px] py-[13px] text-[13.5px] text-[#1B1A17] hover:bg-[#F6F1E8] hover:text-[#7E2E32] transition-colors outline-none"
                  >
                    <span className="w-[5px] h-[5px] rounded-full bg-[#7E2E32] shrink-0" />
                    Mon profil
                  </Link>
                  <Link
                    href="/reservations"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-[11px] px-[18px] py-[13px] text-[13.5px] text-[#1B1A17] hover:bg-[#F6F1E8] hover:text-[#7E2E32] transition-colors outline-none"
                  >
                    <span className="w-[5px] h-[5px] rounded-full bg-[#b9a87f] shrink-0" />
                    Mon espace client
                  </Link>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full text-left px-[18px] py-[13px] text-[13.5px] text-[#7a715a] border-t border-[#F0EADB] hover:bg-[#F6F1E8] hover:text-[#7E2E32] transition-colors outline-none"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Login link ── */
            <Link
              href="/login"
              className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#5d5749] hover:text-[#7E2E32] transition-colors"
            >
              Connexion
            </Link>
          )}

          {/* Réserver — always visible */}
          <Link
            href="/motos"
            className="font-mono text-[11.5px] tracking-[0.16em] uppercase border border-[#7E2E32] text-[#7E2E32] px-5 py-[9px] rounded-full hover:bg-[#7E2E32] hover:text-[#F4F1E9] transition-colors"
          >
            Réserver
          </Link>
        </div>
      </div>
    </nav>
  );
}
