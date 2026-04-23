'use client';
import { useEffect, useRef } from 'react';

const brands = ['NIKE', 'ADIDAS', 'JORDAN', 'NEW BALANCE', 'ASICS', 'PUMA', 'CONVERSE', 'VANS'];

export default function BrandTicker() {
  return (
    <section className="py-5 bg-neutral-950 border-y border-white/5 overflow-hidden">
      <div className="flex gap-0 whitespace-nowrap">
        {/* Duplicate for seamless loop */}
        {[0, 1].map((pass) => (
          <div
            key={pass}
            className="flex shrink-0 gap-16 px-8 animate-marquee"
            aria-hidden={pass === 1}
          >
            {brands.map((b) => (
              <span key={b} className="text-sm font-black tracking-[0.3em] uppercase text-white/20 hover:text-white/60 transition-colors cursor-default select-none">
                {b}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
