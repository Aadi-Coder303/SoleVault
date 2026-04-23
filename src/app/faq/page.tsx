export default function FAQPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-widest text-center border-b border-neutral-200 pb-8">
        Frequently Asked Questions
      </h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-3 uppercase tracking-wide">Are all sneakers authentic?</h2>
          <p className="text-neutral-600 leading-relaxed">
            Yes, every single pair on Sole Vault goes through a rigorous multi-point authenticity verification process. 
            We source directly from official drops and trusted retail partners. We do not sell fakes, B-grades, or factory variants.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 uppercase tracking-wide">How long does shipping take?</h2>
          <p className="text-neutral-600 leading-relaxed">
            Orders are typically processed within 1-2 business days. Standard shipping within India takes 3-5 business days. 
            Express shipping options are available at checkout.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 uppercase tracking-wide">Do you accept returns?</h2>
          <p className="text-neutral-600 leading-relaxed">
            Due to the limited nature of our products, all sales are final. However, if there is a verified defect or 
            fulfillment error on our part, we will offer a replacement or refund within 7 days of delivery.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 uppercase tracking-wide">How can I track my order?</h2>
          <p className="text-neutral-600 leading-relaxed">
            Once your order ships, you will receive a tracking number via email and SMS. You can also track your order 
            status by logging into your account dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}
