'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AccountSidebar from '@/components/ui/AccountSidebar';

type FlashMsg = { type: 'success' | 'error'; text: string } | null;

interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

const PERSONAL_FIELDS: { key: keyof PersonalData; label: string; type: string }[] = [
  { key: 'firstName', label: 'Prénom', type: 'text' },
  { key: 'lastName', label: 'Nom', type: 'text' },
  { key: 'email', label: 'Adresse e-mail', type: 'email' },
  { key: 'phone', label: 'Téléphone', type: 'tel' },
  { key: 'address', label: 'Adresse', type: 'text' },
  { key: 'city', label: 'Code postal & ville', type: 'text' },
];

function validEmail(v: string) {
  return /.+@.+\..+/.test(String(v || '').trim());
}

function FlashBanner({ msg }: { msg: FlashMsg }) {
  if (!msg) return null;
  const tone =
    msg.type === 'success'
      ? 'border-[#bcd9c4] bg-[#EAF3EC] text-[#2f6b44]'
      : 'border-[#e6b9b3] bg-[#F8ECEA] text-[#9a3b35]';
  return (
    <div className={`rounded-xl px-[18px] py-[14px] text-[13.5px] leading-[1.5] mb-[22px] border ${tone}`}>
      {msg.text}
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#EFE9DD] border border-[#EFE9DD] rounded-xl overflow-hidden">
      {children}
    </div>
  );
}

function FieldCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-[18px]">
      <div className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-[7px]">
        {label}
      </div>
      <div className="text-[15.5px] text-[#1B1A17]">{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [personal, setPersonal] = useState<PersonalData>(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: '+33 6 12 34 56 78',
    address: '14 rue des Lilas',
    city: '75011 Paris',
  }));
  const [profileEdit, setProfileEdit] = useState(false);
  const [draft, setDraft] = useState<PersonalData | null>(null);
  const [profileMsg, setProfileMsg] = useState<FlashMsg>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState<FlashMsg>(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  if (!isAuthenticated) return null;

  function flash(msg: FlashMsg) {
    setProfileMsg(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setProfileMsg(null), 4200);
  }

  function startEdit() {
    setDraft({ ...personal });
    setProfileMsg(null);
    setProfileEdit(true);
  }

  function cancelEdit() {
    setProfileEdit(false);
    setDraft(null);
  }

  function saveProfile() {
    if (!draft) return;
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      flash({ type: 'error', text: 'Le prénom et le nom sont obligatoires.' });
      return;
    }
    if (!validEmail(draft.email)) {
      flash({ type: 'error', text: 'Veuillez saisir une adresse e-mail valide.' });
      return;
    }
    setPersonal({ ...draft });
    setProfileEdit(false);
    setDraft(null);
    flash({ type: 'success', text: 'Vos informations ont bien été enregistrées.' });
  }

  function togglePw() {
    setPwOpen((o) => !o);
    setPwMsg(null);
    setPw({ current: '', next: '', confirm: '' });
  }

  function savePw() {
    if (!pw.current) {
      setPwMsg({ type: 'error', text: 'Saisissez votre mot de passe actuel.' });
      return;
    }
    if (pw.next.length < 8) {
      setPwMsg({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    setPwMsg({ type: 'success', text: 'Votre mot de passe a été mis à jour.' });
    setPw({ current: '', next: '', confirm: '' });
  }

  const accountInfo = [
    { label: 'Identifiant de connexion', value: personal.email },
    { label: 'Catégorie de permis', value: 'Permis A' },
    { label: 'N° de permis', value: '0123 4567 8901' },
    { label: 'Membre depuis', value: '2024' },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-16">

        {/* Header */}
        <div className="mb-9">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
            Espace client
          </p>
          <h1 className="font-serif font-semibold text-[56px] leading-none tracking-[-0.015em]">
            Mon profil
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.26fr_0.74fr] gap-11 items-start">
          <AccountSidebar />

          <div>
            <FlashBanner msg={profileMsg} />

            {/* Informations personnelles */}
            <div className="bg-white border border-[#ECE5D5] rounded-[18px] px-8 py-[30px] mb-6">
              <div className="flex items-start justify-between gap-[18px] mb-6">
                <div>
                  <h2 className="font-serif font-semibold text-[28px] mb-1">
                    Informations personnelles
                  </h2>
                  <p className="text-[13px] text-[#8a7f63]">
                    Ces informations apparaissent sur vos contrats de location.
                  </p>
                </div>
                {!profileEdit && (
                  <button
                    onClick={startEdit}
                    className="shrink-0 whitespace-nowrap font-mono text-[11.5px] tracking-[0.1em] uppercase border border-[#1B1A17] text-[#1B1A17] px-[18px] py-[10px] rounded-full hover:bg-[#1B1A17] hover:text-[#F4F1E9] transition-colors"
                  >
                    Modifier mes informations
                  </button>
                )}
              </div>

              {!profileEdit ? (
                <FieldGrid>
                  {PERSONAL_FIELDS.map((f) => (
                    <FieldCell key={f.key} label={f.label} value={personal[f.key]} />
                  ))}
                </FieldGrid>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                    {PERSONAL_FIELDS.map((f) => (
                      <label key={f.key} className="block">
                        <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                          {f.label}
                        </span>
                        <input
                          type={f.type}
                          value={draft ? draft[f.key] : ''}
                          onChange={(e) =>
                            setDraft((d) => (d ? { ...d, [f.key]: e.target.value } : d))
                          }
                          className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-[22px]">
                    <button
                      onClick={saveProfile}
                      className="bg-[#7E2E32] text-[#F4F1E9] font-mono text-[13px] tracking-[0.04em] px-7 py-[13px] rounded-full hover:bg-[#651f23] transition-colors"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="border border-[#E4DECF] text-[#5d5749] font-mono text-[13px] tracking-[0.04em] px-[26px] py-[13px] rounded-full hover:border-[#1B1A17] hover:text-[#1B1A17] transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Compte & connexion */}
            <div className="bg-white border border-[#ECE5D5] rounded-[18px] px-8 py-[30px]">
              <h2 className="font-serif font-semibold text-[28px] mb-5">Compte &amp; connexion</h2>
              <div className="mb-6">
                <FieldGrid>
                  {accountInfo.map((f) => (
                    <FieldCell key={f.label} label={f.label} value={f.value} />
                  ))}
                </FieldGrid>
              </div>

              <div className="flex items-center justify-between gap-[18px] px-5 py-[18px] border border-[#EFE9DD] rounded-xl bg-[#FBF9F3]">
                <div>
                  <div className="text-[14.5px] text-[#1B1A17] font-medium">Mot de passe</div>
                  <div className="font-mono text-[14px] text-[#a0967f] tracking-[0.18em] mt-[5px]">
                    ••••••••••
                  </div>
                </div>
                <button
                  onClick={togglePw}
                  className="shrink-0 whitespace-nowrap font-mono text-[11.5px] tracking-[0.1em] uppercase border border-[#1B1A17] text-[#1B1A17] px-[18px] py-[10px] rounded-full hover:bg-[#1B1A17] hover:text-[#F4F1E9] transition-colors"
                >
                  Changer mon mot de passe
                </button>
              </div>

              {pwOpen && (
                <div className="mt-[18px] px-6 pt-6 pb-[26px] border border-[#E4DECF] rounded-[14px] bg-white">
                  <FlashBanner msg={pwMsg} />
                  <div className="flex flex-col gap-[14px]">
                    {[
                      { key: 'current' as const, label: 'Mot de passe actuel' },
                      { key: 'next' as const, label: 'Nouveau mot de passe' },
                      { key: 'confirm' as const, label: 'Confirmer le nouveau mot de passe' },
                    ].map((f) => (
                      <label key={f.key} className="block">
                        <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                          {f.label}
                        </span>
                        <input
                          type="password"
                          value={pw[f.key]}
                          placeholder="••••••••"
                          onChange={(e) => setPw((p) => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={savePw}
                      className="bg-[#7E2E32] text-[#F4F1E9] font-mono text-[13px] tracking-[0.04em] px-7 py-[13px] rounded-full hover:bg-[#651f23] transition-colors"
                    >
                      Mettre à jour
                    </button>
                    <button
                      onClick={togglePw}
                      className="border border-[#E4DECF] text-[#5d5749] font-mono text-[13px] tracking-[0.04em] px-[26px] py-[13px] rounded-full hover:border-[#1B1A17] hover:text-[#1B1A17] transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
