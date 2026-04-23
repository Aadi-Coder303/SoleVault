export default function FilterSidebar() {
  return (
    <aside className="w-full">
      <h2 className="text-lg font-bold mb-6 uppercase tracking-wide">Filters</h2>
      
      <div className="space-y-8">
        {/* Brand Filter */}
        <div className="border-b border-neutral-200 pb-6">
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Brand</h3>
          <div className="space-y-3 text-sm text-neutral-600">
            {['Nike', 'Adidas', 'Jordan', 'New Balance', 'ASICS', 'Salomon'].map(brand => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer hover:text-black">
                <input type="checkbox" className="w-4 h-4 accent-black" /> 
                {brand}
              </label>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div className="border-b border-neutral-200 pb-6">
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Size (UK)</h3>
          <div className="grid grid-cols-3 gap-2">
            {[6, 7, 8, 9, 10, 11, 12].map(size => (
              <button key={size} className="border border-neutral-200 py-2 text-sm hover:border-black hover:bg-neutral-50 transition-colors">
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="border-b border-neutral-200 pb-6">
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Price Range</h3>
          <div className="space-y-3 text-sm text-neutral-600">
            {['Under ₹10,000', '₹10,000 - ₹20,000', '₹20,000 - ₹30,000', 'Over ₹30,000'].map(range => (
              <label key={range} className="flex items-center gap-3 cursor-pointer hover:text-black">
                <input type="radio" name="price" className="w-4 h-4 accent-black" /> 
                {range}
              </label>
            ))}
          </div>
        </div>

        {/* Condition Filter */}
        <div className="pb-6">
          <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Condition</h3>
          <div className="space-y-3 text-sm text-neutral-600">
            <label className="flex items-center gap-3 cursor-pointer hover:text-black">
              <input type="checkbox" className="w-4 h-4 accent-black" /> Brand New
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:text-black">
              <input type="checkbox" className="w-4 h-4 accent-black" /> Pre-Owned
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
