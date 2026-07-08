import { Download } from 'lucide-react';
import { Modal } from '@/core/components/ui/Modal';
import { Button } from '@/core/components/ui/Button';
import type { Payment } from '../types';

const STATUS_LABEL: Record<Payment['status'], string> = {
  paid: 'Paid', pending: 'Pending', refunded: 'Refunded', failed: 'Failed',
};

export function downloadReceipt(p: Payment) {
  const lines = [
    'RECEIPT',
    `Booking: #${p.ref}`,
    `Date: ${p.date}`,
    `Customer: ${p.customer}`,
    `Payment method: ${p.method}`,
    `Amount: €${p.amount}`,
    `Deposit: €${p.deposit}`,
    `Status: ${STATUS_LABEL[p.status]}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${p.ref}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-2)', fontSize: 13 }}>
      <span style={{ color: 'var(--faint)' }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export function ReceiptModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  return (
    <Modal
      title={`Receipt #${payment.ref}`}
      subtitle={payment.customer}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Close</Button>
          <Button size="md" style={{ flex: 1 }} onClick={() => downloadReceipt(payment)}>
            <Download size={14} strokeWidth={1.6} />Download
          </Button>
        </>
      }
    >
      <div>
        <Row label="Date" value={payment.date} />
        <Row label="Payment method" value={payment.method} />
        <Row label="Amount" value={`€${payment.amount}`} />
        <Row label="Deposit" value={`€${payment.deposit}`} />
        <Row label="Status" value={STATUS_LABEL[payment.status]} />
      </div>
    </Modal>
  );
}
