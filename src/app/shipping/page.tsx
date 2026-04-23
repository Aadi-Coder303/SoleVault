export default function ShippingPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-widest text-center border-b border-neutral-200 pb-8">
        Shipping & Returns
      </h1>

      <div className="space-y-8 text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 uppercase tracking-wide text-black">Shipping Policy</h2>
          <p className="mb-4">
            We offer fast and reliable shipping across India. All our packages are double-boxed to ensure the shoebox arrives in pristine condition.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Standard Shipping:</strong> 3-5 business days (Free on orders over ₹15,000)</li>
            <li><strong>Express Shipping:</strong> 1-2 business days (Calculated at checkout)</li>
            <li><strong>Order Processing:</strong> 1-2 business days for verification and packaging.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 uppercase tracking-wide text-black mt-12">Return Policy</h2>
          <p className="mb-4">
            Sole Vault operates as a curated marketplace for highly sought-after, limited-edition sneakers. Because of market volatility and the exclusivity of our inventory, <strong>all sales are considered final</strong>.
          </p>
          <p className="mb-4">
            We do not accept returns, exchanges, or issue refunds for issues regarding sizing. Please ensure you know your correct size before purchasing.
          </p>
          <p>
            <strong>Exceptions:</strong> If you receive the incorrect item, or if the item is found to be inauthentic (which our verification process guarantees against), please contact support within 48 hours of delivery to initiate a claim.
          </p>
        </section>
      </div>
    </main>
  );
}
