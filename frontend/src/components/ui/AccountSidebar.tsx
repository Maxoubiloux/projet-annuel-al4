'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { label: 'Mes réservations', href: '/reservations' },
  { label: 'Mon profil',       href: '/profile' },
  { label: 'Mes favoris',      href: '/favoris' },
  { label: 'Mes documents',    href: '/documents' },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <div className="lg:sticky lg:top-24 border-t border-[#E4DECF]">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return active ? (
          <div
            key={item.label}
            className="py-4 border-b border-[#E4DECF] flex items-center gap-[10px]"
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[#7E2E32] shrink-0" />
            <span className="text-[13.5px] text-[#1B1A17]">{item.label}</span>
          </div>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            className="py-4 border-b border-[#E4DECF] flex text-[13.5px] text-[#7a715a] hover:text-[#7E2E32] transition-colors"
          >
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="py-4 flex text-[13.5px] text-[#7a715a] hover:text-[#7E2E32] transition-colors w-full text-left"
      >
        Déconnexion
      </button>
    </div>
  );
}
