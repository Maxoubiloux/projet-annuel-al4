'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

type LicenseCategory = 'A1' | 'A2' | 'A';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    zipCode: string;
    city: string;
    licenseCategory: LicenseCategory;
    licenseNumber: string;
    password: string;
    confirmPassword: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    licenseCategory: 'A1',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        zipCode: formData.zipCode,
        city: formData.city,
        licenseCategory: formData.licenseCategory,
        licenseNumber: formData.licenseNumber,
        password: formData.password,
      });
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création du compte impossible');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-[980px] bg-white border border-[#ECE5D5] rounded-[20px] overflow-hidden shadow-[0_40px_90px_-50px_rgba(40,30,20,0.45)]">
        <div className="relative bg-[#1B1A17] text-[#F4F1E9] px-11 py-12 flex flex-col justify-between min-h-[560px] overflow-hidden">
          <div className="font-serif text-[23px] font-semibold relative z-10">
            Plein Gaz Loc<span className="text-[#d8a96a]">.</span>
          </div>
          <div className="relative z-10">
            <h2 className="font-serif font-medium text-[42px] leading-[1.05] mb-3">
              Rejoignez<br />
              <span className="italic text-[#d8a96a]">le garage.</span>
            </h2>
            <p className="text-[14px] text-[#bcb3a1] max-w-[280px] mb-5">
              Réservation en deux minutes, assurance incluse et tarifs membres dès la première location.
            </p>
            <div className="flex flex-col gap-[10px] text-[13px] text-[#d6cdbb]">
              <span>✓ Réservez sans frais de dossier</span>
              <span>✓ Annulation gratuite jusqu&apos;à 48h</span>
              <span>✓ Offres réservées aux membres</span>
            </div>
          </div>
          <div className="absolute right-[-80px] bottom-4 w-[420px] opacity-90 pointer-events-none z-[1] mix-blend-lighten">
            <Image
              src="/images/motos/panigale_v4.jpg"
              alt=""
              width={420}
              height={270}
              className="object-contain"
            />
          </div>
        </div>

        <div className="px-12 py-12">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#7E2E32] mb-[10px]">
            Nouveau membre
          </p>
          <h1 className="font-serif font-semibold text-[36px] mb-6">Créer un compte</h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-xl border border-[#e6b9b3] bg-[#F8ECEA] px-4 py-3 text-[13px] text-[#9a3b35]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Prénom
                </span>
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="Marie"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                />
              </label>
              <label className="block">
                <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Nom
                </span>
                <input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Durand"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                />
              </label>
            </div>

            <label className="block">
              <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                Adresse e-mail
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="vous@exemple.fr"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
              />
            </label>

            <label className="block">
              <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                Téléphone
              </span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+33 6 12 34 56 78"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
              />
            </label>

            <label className="block">
              <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                Adresse
              </span>
              <input
                name="address"
                type="text"
                autoComplete="street-address"
                required
                placeholder="14 rue des Lilas"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
              />
            </label>

            <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
              <label className="block">
                <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Code postal
                </span>
                <input
                  name="zipCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                  placeholder="75011"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                />
              </label>
              <label className="block">
                <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Ville
                </span>
                <input
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  required
                  placeholder="Paris"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                />
              </label>
            </div>

            <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
              <label className="block">
                <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Catégorie permis
                </span>
                <select
                  name="licenseCategory"
                  required
                  value={formData.licenseCategory}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, licenseCategory: e.target.value as 'A1' | 'A2' | 'A' }))
                  }
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
                  name="licenseNumber"
                  type="text"
                  required
                  placeholder="0123 4567 8901"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                />
              </label>
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-3">
              <label className="block">
                <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Mot de passe
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                />
              </label>
              <label className="block">
                <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Confirmer
                </span>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-[#E4DECF] bg-[#FBF9F3] rounded-[10px] px-[13px] py-3 text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors"
                />
              </label>
            </div>

            <Button type="submit" disabled={isSubmitting} variant="primary" size="lg" className="w-full mt-3">
              {isSubmitting ? 'Création...' : 'Créer mon compte'}
            </Button>
          </form>

          <p className="text-center text-[13.5px] text-[#56503f] mt-[22px]">
            Déjà inscrit ?{' '}
            <Link
              href="/login"
              className="text-[#7E2E32] border-b border-[#7E2E32] pb-px hover:opacity-70 transition-opacity"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
