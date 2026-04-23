export default function AuthenticityPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-widest text-center border-b border-neutral-200 pb-8">
        Authenticity Guarantee
      </h1>

      <div className="space-y-8 text-neutral-600 leading-relaxed">
        <p className="text-lg">
          At Sole Vault, authenticity is our foundation. We understand the sneaker market is flooded with high-tier replicas, which is why we have developed a strict, multi-point verification process to ensure every pair we sell is 100% genuine.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-neutral-50 p-8 border border-neutral-200">
            <h3 className="font-bold text-black uppercase tracking-wide mb-3">1. Sourcing</h3>
            <p className="text-sm">
              We acquire our inventory exclusively from verified retail partners, official brand drops, and a highly vetted network of premium suppliers.
            </p>
          </div>

          <div className="bg-neutral-50 p-8 border border-neutral-200">
            <h3 className="font-bold text-black uppercase tracking-wide mb-3">2. Physical Inspection</h3>
            <p className="text-sm">
              Our experts examine the material quality, stitching patterns, glue strokes, and overall build structure. We compare these against known retail benchmarks.
            </p>
          </div>

          <div className="bg-neutral-50 p-8 border border-neutral-200">
            <h3 className="font-bold text-black uppercase tracking-wide mb-3">3. Packaging & Tags</h3>
            <p className="text-sm">
              Authenticity goes beyond the shoe. We verify the box labeling, font weights, inner tissue paper, and manufacturer tags to ensure they match retail standards perfectly.
            </p>
          </div>

          <div className="bg-neutral-50 p-8 border border-neutral-200">
            <h3 className="font-bold text-black uppercase tracking-wide mb-3">4. UV & Blacklight</h3>
            <p className="text-sm">
              Using specialized UV lighting, we scan for hidden manufacturer marks, correct fluorescence in materials, and invisible stamps often used by counterfeiters.
            </p>
          </div>
        </div>

        <div className="mt-12 p-8 border-l-4 border-black bg-neutral-50">
          <p className="font-medium text-black">
            Every sneaker purchased from Sole Vault ships with our custom verification tag. If a product fails any step of our authentication process, it never makes it to our inventory. Period.
          </p>
        </div>
      </div>
    </main>
  );
}
