'use client';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919876543210'; // Replace with actual WhatsApp business number
const DEFAULT_MESSAGE = 'Hi! I have a question about a product on SoleVault.';

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 bg-[#25D366] text-white rounded-full shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 transition-all duration-300 hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      {/* Label — expands on hover on desktop */}
      <span className="hidden sm:block max-w-0 overflow-hidden group-hover:max-w-[160px] transition-all duration-300 whitespace-nowrap text-sm font-bold pl-0 group-hover:pl-4">
        Chat with us
      </span>
      <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0">
        <MessageCircle size={26} strokeWidth={2} />
      </div>
    </a>
  );
}
