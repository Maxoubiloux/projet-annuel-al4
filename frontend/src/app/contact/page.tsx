'use client';

import Link from 'next/link';
import { useState } from 'react';

const SUBJECTS = [
  'Réservation',
  'Informations générales',
  'Réclamation',
  'Partenariat',
  'Autre',
];

const COORDS = [
  { label: 'Par e-mail', value: 'contact@citymotoyard.fr', sub: 'Réponse sous 24h ouvrées' },
  { label: 'Par téléphone', value: '+33 1 23 45 67 89', sub: 'Du lundi au samedi' },
  { label: 'Siège', value: '12 avenue de la Grande Armée, 75017 Paris', sub: 'Sur rendez-vous' },
  { label: 'Horaires', value: 'Lun – Sam · 08h – 20h', sub: 'Assistance 24h/24 incluse' },
];

function validEmail(v: string) {
  return /.+@.+\..+/.test(String(v || '').trim());
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: '', email: '', subject: SUBJECTS[0], message: '' };

function inputClass(hasError: boolean) {
  return `w-full border rounded-[10px] px-[14px] py-[13px] text-[14px] text-[#1B1A17] outline-none transition-colors ${hasError ? 'border-[#c2554d]' : 'border-[#E4DECF] focus:border-[#7E2E32]'
    }`;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [sent, setSent] = useState(false);

  function setField(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: false }));
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof FormState, boolean>> = {};
    if (!form.name.trim()) nextErrors.name = true;
    if (!validEmail(form.email)) nextErrors.email = true;
    if (!form.message.trim()) nextErrors.message = true;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSent(true);
  }

  function resetContact() {
    setSent(false);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  return (
    <div className="max-w-[1240px] mx-auto px-10 pt-14 pb-20">

      {/* Header */}
      <div className="mb-10 max-w-[620px]">
        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#7E2E32] mb-3">
          Nous sommes à votre écoute
        </p>
        <h1 className="font-serif font-semibold text-[60px] leading-none tracking-[-0.015em] mb-3">
          Nous contacter
        </h1>
        <p className="text-[16px] text-[#56503f]">
          Une question sur une réservation, une moto ou nos agences ? Écrivez-nous, notre équipe vous répond sous 24 heures ouvrées.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-11 items-start">

        {/* form */}
        <div className="bg-white border border-[#ECE5D5] rounded-[18px] px-9 py-[34px]">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-[14px]">
              <h2 className="font-serif font-semibold text-[26px] mb-[8px]">Votre message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                <div>
                  <label htmlFor="name" className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={setField('name')}
                    placeholder="Marie Durand"
                    className={inputClass(!!errors.name)}
                  />
                  {errors.name && (
                    <span className="block text-[11.5px] text-[#c2554d] mt-[6px]">
                      Veuillez indiquer votre nom.
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={setField('email')}
                    placeholder="vous@exemple.fr"
                    className={inputClass(!!errors.email)}
                  />
                  {errors.email && (
                    <span className="block text-[11.5px] text-[#c2554d] mt-[6px]">
                      Adresse e-mail invalide.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Sujet
                </label>
                <select
                  id="subject"
                  value={form.subject}
                  onChange={setField('subject')}
                  className="w-full border border-[#E4DECF] rounded-[10px] px-[14px] py-[13px] text-[14px] text-[#1B1A17] outline-none focus:border-[#7E2E32] transition-colors appearance-none cursor-pointer"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#a0967f] mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={setField('message')}
                  placeholder="Bonjour, je souhaiterais..."
                  rows={6}
                  className={`${inputClass(!!errors.message)} resize-y min-h-[150px] leading-[1.6]`}
                />
                {errors.message && (
                  <span className="block text-[11.5px] text-[#c2554d] mt-[6px]">
                    Veuillez saisir votre message.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-[18px] pt-1">
                <button
                  type="submit"
                  className="bg-[#7E2E32] text-[#F4F1E9] font-mono text-[13.5px] tracking-[0.04em] px-8 py-[15px] rounded-full hover:bg-[#651f23] transition-colors"
                >
                  Envoyer le message
                </button>
                <span className="text-[12px] text-[#a0967f]">Réponse sous 24h ouvrées</span>
              </div>
            </form>
          ) : (
            <div className="text-center py-[30px] px-[10px] pb-5">
              <div className="w-16 h-16 rounded-full bg-[#7E2E32] text-[#F4F1E9] flex items-center justify-center text-[28px] mx-auto mb-[22px]">
                ✓
              </div>
              <h2 className="font-serif font-semibold text-[32px] mb-3">Message envoyé</h2>
              <p className="text-[14.5px] leading-[1.7] text-[#56503f] max-w-[380px] mx-auto mb-[26px]">
                Merci de nous avoir écrit. Notre équipe vous répondra à l&apos;adresse indiquée sous 24 heures ouvrées.
              </p>
              <button
                onClick={resetContact}
                className="inline-block border border-[#1B1A17] text-[#1B1A17] font-mono text-[13px] tracking-[0.04em] px-7 py-[13px] rounded-full hover:bg-[#1B1A17] hover:text-[#F4F1E9] transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          )}
        </div>

        {/* coordinates */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-[#1B1A17] text-[#F4F1E9] rounded-[18px] px-8 py-8 mb-[18px]">
            <h3 className="font-serif font-medium text-[24px] mb-[22px]">
              Autres moyens de nous joindre
            </h3>
            <div className="flex flex-col gap-5">
              {COORDS.map((c) => (
                <div key={c.label} className="border-t border-white/10 pt-4">
                  <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#d8a96a] mb-2">
                    {c.label}
                  </div>
                  <div className="text-[16px] text-[#F4F1E9] whitespace-pre-line">{c.value}</div>
                  <div className="text-[12.5px] text-[#9a9388] mt-1">{c.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/agences"
            className="bg-white border border-[#ECE5D5] rounded-2xl px-6 py-[22px] flex items-center justify-between gap-[14px] hover:border-[#7E2E32] transition-colors"
          >
            <div>
              <div className="font-serif font-semibold text-[20px]">Plus de 50 agences</div>
              <div className="text-[13px] text-[#8a7f63] mt-[3px]">
                Trouvez celle la plus proche de chez vous.
              </div>
            </div>
            <span className="text-[13px] text-[#7E2E32] whitespace-nowrap">Voir →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
