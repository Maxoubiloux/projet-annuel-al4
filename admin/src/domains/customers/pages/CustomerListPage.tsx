import { useState } from 'react';
import { Search, Plus, Mail, Phone, UserCheck, UserX, Ellipsis } from 'lucide-react';
import { CUSTOMERS_MOCK } from '@/mocks/reservations';

export function CustomerListPage() {
  const [search, setSearch] = useState('');

  const filtered = CUSTOMERS_MOCK.filter(c =>
    !search ||
    c.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Customers</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            {CUSTOMERS_MOCK.length} registered customers
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
          background: 'var(--brand)', color: '#fff',
          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>
          <Plus size={15} strokeWidth={1.6} />New customer
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, color: 'var(--faint)', minWidth: 280,
        }}>
          <Search size={14} strokeWidth={1.6} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }}
          />
        </div>
      </div>

      <div style={card}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.8fr 1fr 90px 60px',
          gap: 12, alignItems: 'center', padding: '11px 20px',
          fontFamily: "'Geist Mono',monospace", fontSize: 10,
          letterSpacing: '.08em', textTransform: 'uppercase',
          color: 'var(--faint)', background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <span>Customer</span>
          <span>Contact</span>
          <span>Licence</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
            No customers found.
          </div>
        ) : (
          filtered.map(c => {
            const initials = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();
            return (
              <div key={c.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.8fr 1fr 90px 60px',
                gap: 12, alignItems: 'center', padding: '12px 20px',
                borderTop: '1px solid var(--border-2)', fontSize: 12.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: 'var(--brand-tint)', color: 'var(--brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Geist Mono',monospace", fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>{initials}</div>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{c.firstName} {c.lastName}</div>
                    <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>#{c.id}</div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 3 }}>
                    <Mail size={11} strokeWidth={1.6} />{c.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                    <Phone size={11} strokeWidth={1.6} />{c.phone}
                  </div>
                </div>
                <div>
                  {c.licenseVerified ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: "'Geist Mono',monospace", fontSize: 9.5,
                      textTransform: 'uppercase', letterSpacing: '.04em',
                      padding: '3px 7px', borderRadius: 999,
                      color: 'var(--cmy-green)',
                      background: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)',
                    }}>
                      <UserCheck size={11} />Verified
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: "'Geist Mono',monospace", fontSize: 9.5,
                      textTransform: 'uppercase', letterSpacing: '.04em',
                      padding: '3px 7px', borderRadius: 999,
                      color: 'var(--cmy-amber)',
                      background: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)',
                    }}>
                      <UserX size={11} />Pending
                    </span>
                  )}
                </div>
                <div>
                  {c.status === 'active' ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: "'Geist Mono',monospace", fontSize: 9.5,
                      textTransform: 'uppercase', letterSpacing: '.04em',
                      padding: '3px 7px', borderRadius: 999,
                      color: 'var(--cmy-green)',
                      background: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--cmy-green)' }} />
                      Active
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: "'Geist Mono',monospace", fontSize: 9.5,
                      textTransform: 'uppercase', letterSpacing: '.04em',
                      padding: '3px 7px', borderRadius: 999,
                      color: 'var(--cmy-red)',
                      background: 'color-mix(in srgb,var(--cmy-red) 14%,transparent)',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--cmy-red)' }} />
                      Suspended
                    </span>
                  )}
                </div>
                <button style={{
                  width: 28, height: 28, border: 'none', background: 'transparent',
                  borderRadius: 7, color: 'var(--faint)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ellipsis size={15} strokeWidth={1.6} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
