'use client';

const SECTIONS = [
  {
    id: 'editeur',
    title: 'Éditeur du site',
    paragraphs: [
      'City Moto Yard SAS au capital de 50 000 €\nSiège social : 12 avenue de la Grande Armée, 75017 Paris\nRCS Paris : 123 456 789\nDirecteur de la publication : Jean-Marc Dupont\nTéléphone : +33 1 23 45 67 89\nE-mail : contact@citymotoyard.fr',
    ],
  },
  {
    id: 'hebergement',
    title: 'Hébergement',
    paragraphs: [
      'Le site est hébergé par Vercel Inc.\n440 N Barranca Ave #4133, Covina, CA 91723, États-Unis\nvercel.com',
    ],
  },
  {
    id: 'propriete',
    title: 'Propriété intellectuelle',
    paragraphs: [
      "L'ensemble du contenu de ce site (textes, images, graphismes, logo, icônes) est la propriété exclusive de City Moto Yard SAS ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.",
      "Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation préalable et écrite de City Moto Yard SAS.",
    ],
  },
  {
    id: 'donnees',
    title: 'Données personnelles',
    paragraphs: [
      "Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité des données vous concernant.",
      'Les données collectées sur ce site sont utilisées uniquement dans le cadre de votre relation contractuelle avec City Moto Yard (gestion des réservations, communication client, facturation). Elles ne sont en aucun cas cédées à des tiers sans votre consentement.',
      'Pour exercer vos droits, adressez votre demande à : privacy@citymotoyard.fr',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies',
    paragraphs: [
      'Le site utilise des cookies techniques nécessaires à son bon fonctionnement (session utilisateur, préférences de navigation). Ces cookies ne nécessitent pas votre consentement préalable.',
      'Aucun cookie publicitaire ou de suivi tiers n\'est déposé sur votre appareil sans votre accord explicite.',
    ],
  },
  {
    id: 'responsabilite',
    title: 'Responsabilité',
    paragraphs: [
      "City Moto Yard SAS s'efforce d'assurer l'exactitude des informations publiées sur ce site. Toutefois, elle ne pourra être tenue responsable des erreurs ou omissions, ni de l'indisponibilité du service.",
      "Les liens hypertextes présents sur le site peuvent renvoyer vers des sites externes. City Moto Yard SAS n'exerce aucun contrôle sur ces sites tiers et décline toute responsabilité quant à leur contenu.",
    ],
  },
  {
    id: 'droit',
    title: 'Droit applicable',
    paragraphs: [
      "Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux compétents seront ceux du ressort de la Cour d'Appel de Paris.",
    ],
  },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 90;
  window.scrollTo({ top, behavior: 'smooth' });
}

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-[1080px] mx-auto px-10 pt-14 pb-20">

      {/* Header */}
      <div className="mb-9 max-w-[640px]">
        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
          Informations légales
        </p>
        <h1 className="font-serif font-semibold text-[60px] leading-none tracking-[-0.015em] mb-[14px]">
          Mentions légales
        </h1>
        <p className="font-mono text-[11px] text-[#a0967f]">
          Mise à jour le 1er janvier 2026
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] gap-11 items-start">
        {/* sommaire */}
        <div className="md:sticky md:top-24 border-t border-[#E4DECF]">
          {SECTIONS.map((sec, i) => (
            <button
              key={sec.id}
              onClick={() => scrollToId(`legal-${sec.id}`)}
              className="w-full text-left cursor-pointer flex items-baseline gap-3 py-[14px] px-1 border-b border-[#E4DECF] text-[13.5px] text-[#7a715a] hover:text-[#7E2E32] transition-colors"
            >
              <span className="font-mono text-[11px] text-[#b3a585]">
                {String(i + 1).padStart(2, '0')}
              </span>
              {sec.title}
            </button>
          ))}
        </div>

        {/* contenu */}
        <div className="flex flex-col gap-[14px]">
          {SECTIONS.map((sec, i) => (
            <div
              key={sec.id}
              id={`legal-${sec.id}`}
              style={{ scrollMarginTop: '96px' }}
              className="bg-white border border-[#ECE5D5] rounded-2xl px-[34px] py-8"
            >
              <div className="flex items-baseline gap-[14px] mb-4">
                <span className="font-mono text-[12px] text-[#7E2E32]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="font-serif font-semibold text-[30px] leading-none">
                  {sec.title}
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {sec.paragraphs.map((p, j) => (
                  <p key={j} className="text-[14.5px] leading-[1.75] text-[#56503f] whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
