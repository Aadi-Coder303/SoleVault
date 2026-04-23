'use client';

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-widest text-center border-b border-neutral-200 pb-8">
        Contact Us
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Get in Touch</h2>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Have a question about an order, our authentication process, or looking for a specific pair? Fill out the form and our team will get back to you within 24 hours.
          </p>
          
          <div className="space-y-4 text-neutral-600">
            <p><strong>Email:</strong> support@solevault.com</p>
            <p><strong>Hours:</strong> Mon - Sat, 10:00 AM - 6:00 PM IST</p>
          </div>
        </div>

        <div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Name</label>
              <input type="text" required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Email</label>
              <input type="email" required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Order Number (Optional)</label>
              <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Message</label>
              <textarea rows={5} required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black resize-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-wider py-4 hover:bg-[#E63946] transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
