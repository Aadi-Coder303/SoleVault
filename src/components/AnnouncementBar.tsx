'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

const messages = [
  '🔥 Free Shipping on all orders across India',
  '✅ 100% Authentic — Every pair verified before dispatch',
  '⚡ Ships within 24 hours of order confirmation',
  '🎁 Use code SOLEVAULT10 for 10% off your first order',
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);

  if (!visible) return null;

  return (
    <div className="bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest">
      <div className="container mx-auto px-4 h-9 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-6 overflow-hidden">
          <button
            onClick={() => setIdx((i) => (i - 1 + messages.length) % messages.length)}
            className="text-white/40 hover:text-white transition-colors shrink-0 hidden sm:block"
            aria-label="Previous message"
          >
            ‹
          </button>
          <span className="truncate text-center">{messages[idx]}</span>
          <button
            onClick={() => setIdx((i) => (i + 1) % messages.length)}
            className="text-white/40 hover:text-white transition-colors shrink-0 hidden sm:block"
            aria-label="Next message"
          >
            ›
          </button>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-white/40 hover:text-white transition-colors shrink-0"
          aria-label="Close announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
