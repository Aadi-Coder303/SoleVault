import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="text-xl font-bold tracking-widest uppercase block mb-4">
            SOLE VAULT
          </Link>
          <p className="text-sm text-neutral-500 max-w-xs">
            100% authentic sneakers sourced from official drops. Elevate your collection with verified pairs.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-wide mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-neutral-500">
            <li><Link href="/products?category=men" className="hover:text-black">Men</Link></li>
            <li><Link href="/products?category=women" className="hover:text-black">Women</Link></li>
            <li><Link href="/products?category=kids" className="hover:text-black">Kids</Link></li>
            <li><Link href="/products?category=sale" className="hover:text-black">Sale</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wide mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-neutral-500">
            <li><Link href="/faq" className="hover:text-black">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-black">Shipping & Returns</Link></li>
            <li><Link href="/contact" className="hover:text-black">Contact Us</Link></li>
            <li><Link href="/authenticity" className="hover:text-black">Authenticity Guarantee</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wide mb-4">Newsletter</h4>
          <p className="text-sm text-neutral-500 mb-4">Sign up for early access to drops.</p>
          <div className="flex">
            <input type="email" placeholder="Email address" className="bg-white border border-neutral-300 px-4 py-2 w-full text-sm focus:outline-none focus:border-black" />
            <button className="bg-black text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-neutral-200 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} Sole Vault. All rights reserved.
      </div>
    </footer>
  );
}
