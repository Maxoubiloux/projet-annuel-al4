'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountSidebar from '@/components/ui/AccountSidebar';

interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
}

type LicenseCategory = 'A1' | 'A2' | 'A';

const PERSONAL_FIELDS: { key: keyof PersonalData; label: string; type: string }[] = [
  { key: 'firstName', label: 'Prénom', type: 'text' },
  { key: 'lastName', label: 'Nom', type: 'text' },
  { key: 'email', label: 'Adresse e-mail', type: 'email' },
  { key: 'phone', label: 'Téléphone', type: 'tel' },
  { key: 'address', label: 'Adresse', type: 'text' },
  { key: 'zipCode', label: 'Code postal', type: 'text' },
  { key: 'city', label: 'Ville', type: 'text' },
];

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

function allowedMotoCategories(category: LicenseCategory): string {
  if (category === 'A') return 'A, A2, A1';
  if (category === 'A2') return 'A2, A1';
  return 'A1';
}

function memberYear(createdAt?: string): string {
  if (!createdAt) return String(new Date().getFullYear());
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? String(new Date().getFullYear()) : String(date.getFullYear());
}

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    updateAccount,
    updatePassword,
    getTwoFactorStatus,
    startTwoFactorSetup,
    enableTwoFactor,
    disableTwoFactor,
  } = useAuth();
  const router = useRouter();
  const [personalDraft, setPersonalDraft] = useState<PersonalData | null>(null);
  const [licenseCategory, setLicenseCategory] = useState<LicenseCategory>('A1');
  const [accountMsg, setAccountMsg] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const personal: PersonalData = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    zipCode: user?.zipCode ?? '',
    city: user?.city ?? '',
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLicenseCategory(user.licenseCategory || 'A1');
  }, [user]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    let active = true;
    getTwoFactorStatus()
      .then((status) => {
        if (active) setTwoFactorEnabled(status.enabled);
      })
      .catch(() => {
        if (active) setTwoFactorEnabled(false);
      });

    return () => {
      active = false;
    };
  }, [getTwoFactorStatus, isAuthenticated, isLoading]);

  const accountInfo = [
    { label: 'Identifiant de connexion', value: personal.email },
    { label: 'N° de permis', value: user?.licenseNumber ?? '' },
    { label: 'Catégories motos accessibles', value: allowedMotoCategories(licenseCategory) },
    { label: 'Membre depuis', value: memberYear(user?.createdAt) },
  ];

  const licenseChanged = licenseCategory !== (user?.licenseCategory ?? 'A1');
  const personalChanged = !!personalDraft && !!user && (
    personalDraft.email !== user.email ||
    personalDraft.phone !== user.phone ||
    personalDraft.address !== user.address ||
    personalDraft.zipCode !== user.zipCode ||
    personalDraft.city !== user.city
  );

  if (isLoading || !isAuthenticated) return null;

  function startPersonalEdit() {
    setAccountMsg(null);
    setAccountError(null);
    setPersonalDraft(personal);
  }

  function cancelPersonalEdit() {
    setPersonalDraft(null);
  }

  async function savePersonal(e: React.FormEvent) {
    e.preventDefault();
    if (!personalDraft) return;
    setAccountMsg(null);
    setAccountError(null);
    setIsSavingAccount(true);
    try {
      await updateAccount({
        email: personalDraft.email.trim(),
        phone: personalDraft.phone.trim(),
        address: personalDraft.address.trim(),
        zipCode: personalDraft.zipCode.trim(),
        city: personalDraft.city.trim(),
        licenseCategory,
      });
      setPersonalDraft(null);
      setAccountMsg('Vos informations personnelles ont bien été enregistrées.');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Mise à jour impossible');
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    setAccountMsg(null);
    setAccountError(null);
    setIsSavingAccount(true);
    try {
      await updateAccount({
        email: personal.email,
        phone: personal.phone,
        address: personal.address,
        zipCode: personal.zipCode,
        city: personal.city,
        licenseCategory,
      });
      setAccountMsg('Votre catégorie de permis a bien été enregistrée.');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Mise à jour impossible');
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setAccountMsg(null);
    setAccountError(null);
    if (passwordDraft.newPassword.length < 8) {
      setAccountError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setAccountError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await updatePassword(passwordDraft.currentPassword, passwordDraft.newPassword);
      setPasswordDraft({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setAccountMsg('Votre mot de passe a bien été mis à jour.');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Mise à jour du mot de passe impossible');
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function startA2fSetup() {
    setAccountMsg(null);
    setAccountError(null);
    setTwoFactorLoading(true);
    try {
      const setup = await startTwoFactorSetup();
      setTwoFactorSetup({ secret: setup.secret, qrCodeDataUrl: setup.qrCodeDataUrl });
      setTwoFactorCode('');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Initialisation A2F impossible');
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function confirmA2fSetup(e: React.FormEvent) {
    e.preventDefault();
    if (!twoFactorSetup) return;
    setAccountMsg(null);
    setAccountError(null);
    setTwoFactorLoading(true);
    try {
      await enableTwoFactor(twoFactorSetup.secret, twoFactorCode);
      setTwoFactorEnabled(true);
      setTwoFactorSetup(null);
      setTwoFactorCode('');
      setAccountMsg('Authentification forte activée.');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Activation A2F impossible');
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function removeA2f() {
    setAccountMsg(null);
    setAccountError(null);
    setTwoFactorLoading(true);
    try {
      await disableTwoFactor();
      setTwoFactorEnabled(false);
      setTwoFactorSetup(null);
      setTwoFactorCode('');
      setAccountMsg('Authentification forte désactivée.');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Désactivation A2F impossible');
    } finally {
      setTwoFactorLoading(false);
    }
  }

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
                {!personalDraft && (
                  <Button variant="outline" size="sm" className="shrink-0 uppercase" onClick={startPersonalEdit}>
                    Modifier
                  </Button>
                )}
              </div>

              {!personalDraft ? (
                <FieldGrid>
                  {PERSONAL_FIELDS.map((f) => (
                    <FieldCell key={f.key} label={f.label} value={personal[f.key]} />
                  ))}
                </FieldGrid>
              ) : (
                <form onSubmit={savePersonal}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERSONAL_FIELDS.filter((f) => f.key !== 'firstName' && f.key !== 'lastName').map((f) => (
                      <label key={f.key} className={f.key === 'address' ? 'block sm:col-span-2' : 'block'}>
                        <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                          {f.label}
                        </span>
                        <input
                          type={f.type}
                          required
                          value={personalDraft[f.key]}
                          onChange={(e) => setPersonalDraft((draft) => (draft ? { ...draft, [f.key]: e.target.value } : draft))}
                          className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button type="submit" variant="primary" size="md" disabled={!personalChanged || isSavingAccount}>
                      {isSavingAccount ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button type="button" variant="ghost" size="md" onClick={cancelPersonalEdit}>
                      Annuler
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Compte & connexion */}
            <div className="bg-white border border-[#ECE5D5] rounded-[18px] px-8 py-[30px]">
              <h2 className="font-serif font-semibold text-[28px] mb-5">Compte &amp; connexion</h2>
              {accountError && (
                <div className="rounded-xl border border-[#e6b9b3] bg-[#F8ECEA] px-4 py-3 text-[13px] text-[#9a3b35] mb-5">
                  {accountError}
                </div>
              )}
              {accountMsg && (
                <div className="rounded-xl border border-[#bcd9c4] bg-[#EAF3EC] px-4 py-3 text-[13px] text-[#2f6b44] mb-5">
                  {accountMsg}
                </div>
              )}
              <div className="mb-6">
                <FieldGrid>
                  {accountInfo.map((f) => (
                    <FieldCell key={f.label} label={f.label} value={f.value} />
                  ))}
                </FieldGrid>
              </div>

              <form onSubmit={saveAccount} className="grid grid-cols-1 sm:grid-cols-[0.75fr_1.25fr_auto] gap-3 items-end mb-6">
                <label className="block">
                  <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                    Catégorie de permis
                  </span>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value as LicenseCategory)}
                    className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                  >
                    <option value="A1">Permis A1</option>
                    <option value="A2">Permis A2</option>
                    <option value="A">Permis A</option>
                  </select>
                </label>

                <label className="block">
                  <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                    N° de permis
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.licenseNumber ?? ''}
                    placeholder="0123 4567 8901"
                    className="w-full border border-[#E4DECF] bg-[#F1ECE0] rounded-[10px] px-[13px] py-3 text-[14px] text-[#7a715a] outline-none cursor-not-allowed"
                  />
                </label>

                <Button type="submit" variant="primary" size="md" disabled={!licenseChanged || isSavingAccount} className="whitespace-nowrap">
                  {isSavingAccount ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </form>

              <div className="mb-6 px-5 py-[18px] border border-[#EFE9DD] rounded-xl bg-[#FBF9F3]">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="text-[14.5px] text-[#1B1A17] font-medium mb-1">Authentification forte</div>
                    <p className="text-[13px] text-[#8a7f63] leading-[1.6] max-w-[540px]">
                      {twoFactorEnabled
                        ? 'Votre compte demande un code à usage unique à la connexion.'
                        : 'Ajoutez un code à usage unique via Aegis, Google Authenticator ou une application TOTP compatible.'}
                    </p>
                  </div>
                  <span className={[
                    'font-mono text-[10px] tracking-[0.1em] uppercase rounded-full px-3 py-[6px] self-start',
                    twoFactorEnabled ? 'text-[#3d7a52] bg-[#E6F0E8]' : 'text-[#9a8f74] bg-[#F1ECE0]',
                  ].join(' ')}>
                    {twoFactorEnabled ? 'Activée' : 'Inactive'}
                  </span>
                </div>

                {!twoFactorSetup && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {!twoFactorEnabled ? (
                      <Button type="button" variant="primary" size="md" disabled={twoFactorLoading} onClick={startA2fSetup}>
                        {twoFactorLoading ? 'Préparation...' : 'Activer l’A2F'}
                      </Button>
                    ) : (
                      <Button type="button" variant="ghost" size="md" disabled={twoFactorLoading} onClick={removeA2f}>
                        {twoFactorLoading ? 'Suppression...' : 'Désactiver l’A2F'}
                      </Button>
                    )}
                  </div>
                )}

                {twoFactorSetup && (
                  <form onSubmit={confirmA2fSetup} className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 mt-5 items-start">
                    <div className="bg-white border border-[#E4DECF] rounded-[12px] p-3 w-fit">
                      <img src={twoFactorSetup.qrCodeDataUrl} alt="QR code A2F" width={220} height={220} />
                    </div>
                    <div>
                      <label className="block mb-3">
                        <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                          Code de vérification
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          pattern="\d{6}"
                          maxLength={6}
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          className="w-full max-w-[220px] border border-[#E4DECF] bg-white rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                        />
                      </label>
                      <p className="text-[12.5px] text-[#8a7f63] leading-[1.6] mb-4">
                        Scannez le QR code avec Aegis puis saisissez le code généré.
                      </p>
                      <div className="flex gap-3">
                        <Button type="submit" variant="primary" size="md" disabled={twoFactorCode.length !== 6 || twoFactorLoading}>
                          {twoFactorLoading ? 'Activation...' : 'Valider'}
                        </Button>
                        <Button type="button" variant="ghost" size="md" onClick={() => setTwoFactorSetup(null)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              <div className="flex items-center justify-between gap-[18px] px-5 py-[18px] border border-[#EFE9DD] rounded-xl bg-[#FBF9F3]">
                <div className="w-full">
                  <div className="text-[14.5px] text-[#1B1A17] font-medium mb-4">Mot de passe</div>
                  <form onSubmit={savePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="password"
                      required
                      placeholder="Mot de passe actuel"
                      value={passwordDraft.currentPassword}
                      onChange={(e) => setPasswordDraft((draft) => ({ ...draft, currentPassword: e.target.value }))}
                      className="w-full border border-[#E4DECF] bg-white rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                    />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="Nouveau mot de passe"
                      value={passwordDraft.newPassword}
                      onChange={(e) => setPasswordDraft((draft) => ({ ...draft, newPassword: e.target.value }))}
                      className="w-full border border-[#E4DECF] bg-white rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                    />
                    <div className="flex gap-3">
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="Confirmer"
                        value={passwordDraft.confirmPassword}
                        onChange={(e) => setPasswordDraft((draft) => ({ ...draft, confirmPassword: e.target.value }))}
                        className="min-w-0 flex-1 border border-[#E4DECF] bg-white rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                      />
                      <Button type="submit" variant="primary" size="md" disabled={isSavingPassword} className="shrink-0">
                        {isSavingPassword ? '...' : 'OK'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
