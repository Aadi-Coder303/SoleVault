'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] bg-neutral-950 flex items-center justify-center overflow-hidden">

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#E63946]/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div
          className="transition-all duration-700 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}
        >
          <span className="inline-block text-[#E63946] text-xs font-bold uppercase tracking-[0.3em] mb-6 border border-[#E63946]/30 px-4 py-1.5 rounded-sm">
            100% Authentic • India's Premium Resale
          </span>
        </div>

        <div
          className="transition-all duration-700 ease-out delay-100"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '100ms' }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 uppercase leading-none">
            Step Into
            <br />
            <span className="text-[#E63946]">Greatness</span>
          </h1>
        </div>

        <div
          className="transition-all duration-700 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '200ms' }}
        >
          <p className="text-base md:text-lg text-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Exclusive sneakers sourced from official drops. Verified authentic, delivered to your door anywhere in India.
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '300ms', transition: 'all 0.7s ease-out' }}
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 bg-[#E63946] text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-[#E63946]/30"
          >
            Shop Now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/authenticity"
            className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 font-bold uppercase tracking-wider hover:border-white hover:bg-white/5 transition-all duration-300"
          >
            Authenticity Guarantee
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-white text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-white/40 animate-pulse" />
      </div>
    </section>
  );
}
