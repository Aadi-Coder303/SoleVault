'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingBag, Menu, User, LogOut, X, Package, LayoutDashboard } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { OWNER_EMAILS } from '@/lib/constants';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isOwner = mounted && user?.email && OWNER_EMAILS.includes(user.email);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearch(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // ── Owner: minimal navbar ──
  if (isOwner) {
    return (
      <header className="sticky top-0 z-50 w-full bg-neutral-950 text-white border-b border-neutral-800">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-black tracking-widest uppercase">
            SOLE VAULT <span className="text-[10px] font-bold tracking-wider text-neutral-500 ml-2">ADMIN</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <button onClick={handleSignOut} className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#E63946] transition-colors flex items-center gap-1.5">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ── Buyer: full navbar ──
  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-sm'
        : 'bg-white border-b border-neutral-200'
    }`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden hover:text-[#E63946] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="text-2xl font-bold tracking-widest uppercase" onClick={() => setMobileMenuOpen(false)}>
            SOLE VAULT
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex gap-8">
          <Link href="/products?category=men" className="text-sm uppercase tracking-[0.08em] font-medium text-neutral-500 hover:text-black hover:underline underline-offset-4 transition-all">Men</Link>
          <Link href="/products?category=women" className="text-sm uppercase tracking-[0.08em] font-medium text-neutral-500 hover:text-black hover:underline underline-offset-4 transition-all">Women</Link>
          <Link href="/products?category=kids" className="text-sm uppercase tracking-[0.08em] font-medium text-neutral-500 hover:text-black hover:underline underline-offset-4 transition-all">Kids</Link>
          <Link href="/products?category=sale" className="text-sm uppercase tracking-[0.08em] font-bold text-[#E63946] hover:text-black hover:underline underline-offset-4 transition-all">Sale</Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative">
            <button 
              onClick={() => setShowSearch(!showSearch)} 
              aria-label="Search" 
              className="hover:text-[#E63946] transition-colors mt-1"
            >
              <Search size={20} />
            </button>
            
            {showSearch && (
              <div className="absolute top-8 right-0 bg-white border border-neutral-200 p-2 shadow-lg w-64 md:w-80">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for sneakers..." 
                    className="w-full border border-neutral-300 p-2 text-sm focus:outline-none focus:border-black"
                  />
                  <button type="submit" className="bg-black text-white px-3 text-xs font-bold uppercase hover:bg-[#E63946]">Go</button>
                </form>
              </div>
            )}
          </div>
          <Link href="/wishlist" aria-label="Wishlist" className="hover:text-[#E63946] transition-colors relative">
            <Heart size={20} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="hover:text-[#E63946] transition-colors relative">
            <ShoppingBag size={20} />
            {mounted && getTotalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#E63946] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                {getTotalItems()}
              </span>
            )}
          </Link>
          {/* Desktop auth */}
          <div className="hidden sm:block">
            {mounted && !user && (
              <Link href="/login" className="text-sm font-bold uppercase tracking-wide hover:text-[#E63946]">
                Log In
              </Link>
            )}
            {mounted && user && (
              <div className="flex items-center gap-4">
                <Link href="/orders" className="hover:text-[#E63946] transition-colors" aria-label="My Orders">
                  <Package size={20} />
                </Link>
                <button onClick={handleSignOut} className="hover:text-[#E63946] transition-colors" aria-label="Sign Out">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
          {/* Mobile-only login icon */}
          <div className="sm:hidden">
            {mounted && !user && (
              <Link href="/login" aria-label="Log In" className="hover:text-[#E63946] transition-colors">
                <User size={20} />
              </Link>
            )}
            {mounted && user && (
              <button onClick={handleSignOut} className="hover:text-[#E63946] transition-colors" aria-label="Sign Out">
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white animate-in slide-in-from-top duration-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Link href="/products?category=men" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all">Men</Link>
            <Link href="/products?category=women" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all">Women</Link>
            <Link href="/products?category=kids" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all">Kids</Link>
            <Link href="/products?category=sale" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-bold text-[#E63946] hover:text-black hover:bg-neutral-50 transition-all">Sale</Link>
            <div className="border-t border-neutral-200 mt-2 pt-2">
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all flex items-center gap-2">
                <Heart size={16} /> Wishlist
              </Link>
              {mounted && user && (
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all flex items-center gap-2">
                  <Package size={16} /> My Orders
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
