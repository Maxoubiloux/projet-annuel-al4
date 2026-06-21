'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountSidebar from '@/components/ui/AccountSidebar';

type DocStatus = 'validated' | 'pending' | 'refused' | 'expired' | 'available' | 'missing';
type DocGroup = 'justificatif' | 'location';

interface Doc {
  id: string;
  name: string;
  type: string;
  group: DocGroup;
  status: DocStatus;
  date: string;
  format: string;
}

const DOCUMENTS: Doc[] = [
  { id: 'permis', name: 'Permis de conduire', type: "Pièce d'identité", group: 'justificatif', status: 'validated', date: '12/03/2026', format: 'JPG' },
  { id: 'cni', name: 'Carte nationale d’identité', type: "Pièce d'identité", group: 'justificatif', status: 'validated', date: '12/03/2026', format: 'JPG' },
  { id: 'domicile', name: 'Justificatif de domicile', type: 'Domicile', group: 'justificatif', status: 'pending', date: '02/06/2026', format: 'PDF' },
  { id: 'assurance', name: "Attestation d'assurance", type: 'Assurance', group: 'justificatif', status: 'expired', date: '15/01/2025', format: 'PDF' },
  { id: 'rib', name: 'RIB · caution', type: 'Bancaire', group: 'justificatif', status: 'missing', date: '—', format: '—' },
  { id: 'contrat', name: 'Contrat de location · CMY-2026-5320', type: 'Contrat', group: 'location', status: 'available', date: '13/06/2026', format: 'PDF' },
  { id: 'facture', name: 'Facture · CMY-2026-2210', type: 'Facture', group: 'location', status: 'available', date: '14/04/2026', format: 'PDF' },
];

const STATUS_STYLE: Record<DocStatus, { label: string; color: string; bg: string }> = {
  validated: { label: 'Validé', color: '#2f6b44', bg: '#E6F0E8' },
  pending: { label: 'En attente', color: '#8a6d2f', bg: '#F4ECDB' },
  refused: { label: 'Refusé', color: '#9a3b35', bg: '#F8ECEA' },
  expired: { label: 'Expiré', color: '#9a3b35', bg: '#F8ECEA' },
  available: { label: 'Disponible', color: '#5d5749', bg: '#F1ECE0' },
  missing: { label: 'À fournir', color: '#8a7f63', bg: '#F4ECE0' },
};

const ghostBtn =
  'cursor-pointer font-sans text-[11.5px] tracking-[0.04em] px-4 py-[9px] rounded-full border border-[#E4DECF] text-[#5d5749] bg-white whitespace-nowrap hover:border-[#1B1A17] hover:text-[#1B1A17] transition-colors';
const primaryBtn =
  'cursor-pointer font-sans text-[11.5px] tracking-[0.04em] px-4 py-[9px] rounded-full border border-[#7E2E32] text-[#7E2E32] bg-white whitespace-nowrap hover:border-[#1B1A17] hover:text-[#1B1A17] transition-colors';

function actionsFor(d: Doc): { label: string; primary: boolean }[] {
  if (d.group === 'location') return [{ label: 'Voir', primary: false }, { label: 'Télécharger', primary: true }];
  if (d.status === 'missing') return [{ label: 'Ajouter', primary: true }];
  if (d.status === 'expired' || d.status === 'refused') return [{ label: 'Voir', primary: false }, { label: 'Remplacer', primary: true }];
  if (d.status === 'pending') return [{ label: 'Voir', primary: false }, { label: 'Remplacer', primary: false }];
  return [{ label: 'Voir', primary: false }];
}

function DocRow({ doc, dateLabel }: { doc: Doc; dateLabel: string }) {
  const status = STATUS_STYLE[doc.status];
  const actions = actionsFor(doc);
  return (
    <div
      className={`rounded-[14px] px-[22px] py-[18px] grid grid-cols-[46px_1.5fr_auto_auto] gap-5 items-center border hover:border-[#d9cfb8] transition-colors ${
        doc.group === 'location' ? 'bg-[#FBF9F3] border-[#ECE5D5]' : 'bg-white border-[#ECE5D5]'
      }`}
    >
      <div
        className={`w-[46px] h-[46px] flex-shrink-0 rounded-[10px] flex items-center justify-center font-mono text-[9px] tracking-[0.04em] text-[#9a8f74] ${
          doc.status === 'missing' ? 'bg-[#FBF9F3] border border-dashed border-[#cdbfa0]' : 'bg-[#F4F1E9] border border-[#ECE5D5]'
        }`}
      >
        {doc.format}
      </div>
      <div className="min-w-0">
        <div className="text-[15px] text-[#1B1A17] font-medium">{doc.name}</div>
        <div className="font-mono text-[10.5px] tracking-[0.06em] uppercase text-[#a0967f] mt-1">
          {doc.type}
        </div>
      </div>
      <div className="text-left whitespace-nowrap">
        <span
          className="inline-block font-mono text-[9.5px] tracking-[0.1em] uppercase px-[11px] py-[5px] rounded-full"
          style={{ color: status.color, background: status.bg }}
        >
          {status.label}
        </span>
        <div className="font-mono text-[10.5px] text-[#9a8f74] mt-[7px]">
          {dateLabel} {doc.date}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {actions.map((a) => (
          <span key={a.label} className={a.primary ? primaryBtn : ghostBtn}>
            {a.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [documents] = useState<Doc[]>(DOCUMENTS);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const justificatifs = documents.filter((d) => d.group === 'justificatif');
  const locationDocs = documents.filter((d) => d.group === 'location');
  const docTotal = justificatifs.length;
  const docValidated = justificatifs.filter((d) => d.status === 'validated').length;
  const docPct = docTotal ? Math.round((docValidated / docTotal) * 100) : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-16">

        {/* Header */}
        <div className="mb-9">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
            Espace client
          </p>
          <h1 className="font-serif font-semibold text-[56px] leading-none tracking-[-0.015em]">
            Mes documents
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.26fr_0.74fr] gap-11 items-start">
          <AccountSidebar />

          <div>
            {documents.length > 0 ? (
              <>
                {/* progress */}
                <div className="bg-white border border-[#ECE5D5] rounded-2xl px-[26px] py-6 mb-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
                  <div>
                    <div className="flex items-baseline gap-[10px] mb-3">
                      <span className="font-serif font-semibold text-[30px] leading-none">
                        {docValidated} / {docTotal}
                      </span>
                      <span className="text-[13px] text-[#8a7f63]">pièces justificatives validées</span>
                    </div>
                    <div className="h-2 bg-[#F1ECE0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7E2E32] rounded-full transition-[width] duration-300"
                        style={{ width: `${docPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-[9px] text-[12.5px] text-[#7a715a] max-w-[240px] leading-[1.5]">
                    <span className="w-2 h-2 rounded-full bg-[#B5792F] flex-shrink-0" />
                    Complétez vos pièces pour louer sans délai au comptoir.
                  </div>
                </div>

                {/* info */}
                <div className="flex gap-[14px] items-start bg-[#FBF9F3] border border-[#ECE5D5] rounded-2xl px-5 py-[18px] mb-[30px]">
                  <span className="w-[30px] h-[30px] flex-shrink-0 rounded-[8px] bg-[#1B1A17] text-[#F4F1E9] flex items-center justify-center text-[14px]">
                    ⚲
                  </span>
                  <div>
                    <div className="text-[13.5px] font-medium text-[#1B1A17] mb-1">
                      Pourquoi ces documents ?
                    </div>
                    <p className="text-[13px] leading-[1.6] text-[#7a715a]">
                      Pour louer une moto, nous vérifions votre permis, votre identité et votre assurance.
                      Vos documents sont conservés de façon sécurisée et ne sont jamais partagés.
                    </p>
                  </div>
                </div>

                {/* justificatifs */}
                <h2 className="font-serif font-semibold text-[26px] mb-4">Pièces justificatives</h2>
                <div className="flex flex-col gap-3 mb-[38px]">
                  {justificatifs.map((d) => (
                    <DocRow key={d.id} doc={d} dateLabel="Maj" />
                  ))}
                </div>

                {/* location docs */}
                <h2 className="font-serif font-semibold text-[26px] mb-4">Documents de location</h2>
                <div className="flex flex-col gap-3">
                  {locationDocs.map((d) => (
                    <DocRow key={d.id} doc={d} dateLabel="Émis le" />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-[74px] px-[30px] border border-dashed border-[#d9cfb8] rounded-[18px] bg-[#FBF9F3]">
                <div className="w-[60px] h-[60px] rounded-full bg-[#F4ECE0] text-[#cdbfa0] flex items-center justify-center text-[24px] mx-auto mb-[22px]">
                  ⚲
                </div>
                <h2 className="font-serif font-semibold italic text-[28px] text-[#1B1A17] mb-3">
                  Aucun document pour le moment
                </h2>
                <p className="text-[14.5px] leading-[1.7] text-[#7a715a] max-w-[400px] mx-auto mb-[26px]">
                  Ajoutez votre permis, votre pièce d&apos;identité et votre assurance pour pouvoir réserver une moto en quelques minutes.
                </p>
                <span className="inline-block bg-[#7E2E32] text-[#F4F1E9] font-mono text-[13px] tracking-[0.04em] px-[30px] py-[14px] rounded-full cursor-pointer hover:bg-[#651f23] transition-colors">
                  Ajouter un document
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
