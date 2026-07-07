import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Mail, Phone, UserCheck, UserX, Ellipsis, X, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { CUSTOMERS_MOCK } from '@/mocks/reservations';
import type { Customer } from '@/domains/reservations/types';
import { ConfirmDialog } from '@/core/components/ui/ConfirmDialog';
import { Button } from '@/core/components/ui/Button';

type StatusFilter = 'all' | 'active' | 'suspended';
type LicenceFilter = 'all' | 'verified' | 'pending';
type SortField = 'name' | 'status' | 'licenseVerified' | 'totalRentals';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

function RowActionsMenu({ customer, onClose, onSuspend }: { customer: Customer; onClose: () => void; onSuspend: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', right: 0, top: 32,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, boxShadow: 'var(--shadow)',
      minWidth: 170, padding: 5, zIndex: 50,
    }}>
      {['View profile', 'Edit', 'View bookings'].map(label => (
        <button key={label} onClick={onClose} style={{
          display: 'block', width: '100%', padding: '7px 10px',
          textAlign: 'left', fontSize: 12.5, color: 'var(--ink)',
          border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer',
        }}>{label}</button>
      ))}
      <div style={{ borderTop: '1px solid var(--border-2)', marginTop: 4, paddingTop: 4 }}>
        <button onClick={() => { onClose(); onSuspend(); }} style={{
          display: 'block', width: '100%', padding: '7px 10px',
          textAlign: 'left', fontSize: 12.5, color: 'var(--cmy-amber)',
          border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer',
        }}>
          {customer.status === 'active' ? 'Suspend' : 'Reactivate'}
        </button>
      </div>
    </div>
  );
}

const STATUS_OPTIONS: { key: StatusFilter; label: string; color?: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'active',    label: 'Active',    color: 'var(--cmy-green)' },
  { key: 'suspended', label: 'Suspended', color: 'var(--cmy-red)'   },
];

const LICENCE_OPTIONS: { key: LicenceFilter; label: string; color?: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'verified', label: 'Verified', color: 'var(--cmy-green)'  },
  { key: 'pending',  label: 'Pending',  color: 'var(--cmy-amber)'  },
];

export function CustomerListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [licenceFilter, setLicenceFilter] = useState<LicenceFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [suspendTarget, setSuspendTarget] = useState<Customer | null>(null);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'name', dir: 'asc' });

  const filtered = CUSTOMERS_MOCK.filter(c => {
    const matchSearch = !search ||
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchLicence = licenceFilter === 'all' ||
      (licenceFilter === 'verified' && c.licenseVerified) ||
      (licenceFilter === 'pending' && !c.licenseVerified);
    return matchSearch && matchStatus && matchLicence;
  });

  const sorted = [...filtered].sort((a, b) => {
    const d = sort.dir === 'asc' ? 1 : -1;
    if (sort.field === 'name')
      return d * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    if (sort.field === 'status')
      return d * a.status.localeCompare(b.status);
    if (sort.field === 'licenseVerified')
      return d * (Number(a.licenseVerified) - Number(b.licenseVerified));
    if (sort.field === 'totalRentals')
      return d * ((a.totalRentals ?? 0) - (b.totalRentals ?? 0));
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (licenceFilter !== 'all' ? 1 : 0);

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' });
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ArrowUpDown size={11} style={{ opacity: 0.4 }} />;
    return sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />;
  };

  const colBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Geist Mono',monospace", fontSize: 10,
    letterSpacing: '.08em', textTransform: 'uppercase',
    color: 'var(--faint)', padding: 0,
  };

  const chipBtn = (active: boolean, color?: string): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: 7, fontSize: 12,
    border: '1px solid var(--border)',
    background: active ? (color || 'var(--ink)') : 'transparent',
    color: active ? 'var(--bg)' : 'var(--muted)',
    cursor: 'pointer',
  });

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden',
  };

  return (
    <div>
      {suspendTarget && (
        <ConfirmDialog
          title={suspendTarget.status === 'active' ? 'Suspend customer' : 'Reactivate customer'}
          message={
            suspendTarget.status === 'active'
              ? `Suspend ${suspendTarget.firstName} ${suspendTarget.lastName}? They will no longer be able to make reservations.`
              : `Reactivate ${suspendTarget.firstName} ${suspendTarget.lastName}? They will be able to make reservations again.`
          }
          confirmLabel={suspendTarget.status === 'active' ? 'Suspend' : 'Reactivate'}
          danger={suspendTarget.status === 'active'}
          onConfirm={() => {
            // TODO: PATCH /api/customers/:id with { status: ... }
            setSuspendTarget(null);
          }}
          onCancel={() => setSuspendTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Customers</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            {CUSTOMERS_MOCK.length} registered customers
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant={filtersOpen ? 'secondary' : 'outline'}
            size="md"
            onClick={() => setFiltersOpen(o => !o)}
            style={filtersOpen ? { background: 'var(--surface-2)' } : undefined}
          >
            <SlidersHorizontal size={15} strokeWidth={1.6} />Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: 'var(--brand)', color: '#fff',
                borderRadius: 999, width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontFamily: "'Geist Mono',monospace",
              }}>{activeFilterCount}</span>
            )}
          </Button>
          {/* TODO: open CreateCustomerModal + POST /api/customers */}
          <Button size="md">
            <Plus size={15} strokeWidth={1.6} />New customer
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '16px 18px', marginBottom: 14,
          display: 'flex', alignItems: 'flex-start', gap: 28, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Status</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map(o => (
                <button key={o.key} onClick={() => { setStatusFilter(o.key); setPage(1); }} style={chipBtn(statusFilter === o.key, o.color)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Licence</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LICENCE_OPTIONS.map(o => (
                <button key={o.key} onClick={() => { setLicenceFilter(o.key); setPage(1); }} style={chipBtn(licenceFilter === o.key, o.color)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setStatusFilter('all'); setLicenceFilter('all'); setPage(1); }} style={{
              display: 'flex', alignItems: 'center', gap: 5, alignSelf: 'flex-end',
              fontSize: 12, color: 'var(--faint)', border: 'none',
              background: 'transparent', cursor: 'pointer',
            }}>
              <X size={13} />Clear filters
            </button>
          )}
        </div>
      )}

      {/* Search row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, color: 'var(--faint)', minWidth: 260,
        }}>
          <Search size={14} strokeWidth={1.6} />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div style={card}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.8fr 1fr 90px 44px',
          gap: 12, alignItems: 'center', padding: '11px 20px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <button style={colBtn} onClick={() => toggleSort('name')}>
            Customer <SortIcon field="name" />
          </button>
          <span style={{ ...colBtn, cursor: 'default' }}>Contact</span>
          <button style={colBtn} onClick={() => toggleSort('licenseVerified')}>
            Licence <SortIcon field="licenseVerified" />
          </button>
          <button style={colBtn} onClick={() => toggleSort('status')}>
            Status <SortIcon field="status" />
          </button>
          <span />
        </div>

        {paginated.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
            No customers found.
          </div>
        ) : (
          paginated.map(c => {
            const initials = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();
            return (
              <div key={c.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.8fr 1fr 90px 44px',
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
                    <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>
                      #{c.id}
                      {c.totalRentals !== undefined && (
                        <> · {c.totalRentals} rental{c.totalRentals !== 1 ? 's' : ''} · €{c.totalSpent?.toLocaleString()}</>
                      )}
                    </div>
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
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                    aria-label="Customer actions"
                    style={{
                      width: 28, height: 28, border: 'none', background: 'transparent',
                      borderRadius: 7, color: 'var(--faint)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Ellipsis size={15} strokeWidth={1.6} />
                  </button>
                  {openMenuId === c.id && (
                    <RowActionsMenu
                      customer={c}
                      onClose={() => setOpenMenuId(null)}
                      onSuspend={() => setSuspendTarget(c)}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', borderTop: '1px solid var(--border-2)',
            background: 'var(--surface-2)',
          }}>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--faint)' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: page === 1 ? 'var(--border)' : 'var(--ink)', cursor: page === 1 ? 'default' : 'pointer',
              }}><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: page === totalPages ? 'var(--border)' : 'var(--ink)', cursor: page === totalPages ? 'default' : 'pointer',
              }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
