import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#E4DECF] mt-16">
      <div className="max-w-[1240px] mx-auto px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-serif text-[21px] font-semibold text-[#1B1A17]">
              City Moto Yard<span className="text-[#7E2E32]">.</span>
            </div>
            <p className="text-[13px] text-[#8a7f63] leading-relaxed max-w-[240px] mt-3">
              Le spécialiste de la location de motos et scooters en France.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#b3a585] mb-4">
              Location
            </p>
            <ul className="space-y-[9px]">
              <li>
                <Link href="/motos" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Toutes nos motos
                </Link>
              </li>
              <li>
                <Link href="/agences" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Nos agences
                </Link>
              </li>
              <li>
                <Link href="/univers" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Nos univers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#b3a585] mb-4">
              Compte
            </p>
            <ul className="space-y-[9px]">
              <li>
                <Link href="/login" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Mes réservations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#b3a585] mb-4">
              Contact
            </p>
            <ul className="space-y-[9px]">
              <li>
                <Link href="/offres" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Offres &amp; promotions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[13px] text-[#7a715a] hover:text-[#7E2E32] transition-colors">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E4DECF] text-center font-mono text-[11px] text-[#9a8f74] tracking-[0.06em]">
          © {new Date().getFullYear()} City Moto Yard. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
