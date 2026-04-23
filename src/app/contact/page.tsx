'use client';

import toast from 'react-hot-toast';
import { Send, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl min-h-[60vh]">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-3">Get in Touch</p>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Contact Us
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Have a question about an order, our authentication process, or looking for a specific pair? Fill out the form and our team will get back to you within 24 hours.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-neutral-600 p-4 bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-colors">
              <Mail size={18} className="text-[#E63946] shrink-0" />
              <div>
                <p className="font-bold text-sm text-black">Email</p>
                <p className="text-sm">support@solevault.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-neutral-600 p-4 bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-colors">
              <Clock size={18} className="text-[#E63946] shrink-0" />
              <div>
                <p className="font-bold text-sm text-black">Hours</p>
                <p className="text-sm">Mon – Sat, 10:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Message sent!'); }}>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Name</label>
              <input type="text" required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-[#E63946] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Email</label>
              <input type="email" required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-[#E63946] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Order Number (Optional)</label>
              <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-[#E63946] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Message</label>
              <textarea rows={5} required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-[#E63946] transition-colors resize-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-wider py-4 hover:bg-[#E63946] transition-all duration-200 flex items-center justify-center gap-2 btn-press">
              <Send size={16} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
