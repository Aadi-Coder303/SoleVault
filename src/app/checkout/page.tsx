export default function CheckoutPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold uppercase tracking-wide mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3 flex flex-col gap-10">
          
          {/* Shipping Address Form (Indian Format) */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Shipping Address</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="John Doe" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <input type="tel" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="+91 9876543210" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Address Line 1</label>
                <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Flat / House No. / Building" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Address Line 2 (Optional)</label>
                <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Street, Sector, Area" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Pincode</label>
                <input type="text" maxLength={6} className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="400001" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">City</label>
                <input type="text" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black" placeholder="Mumbai" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">State</label>
                <select className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-black bg-white">
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Karnataka</option>
                  {/* Additional states will be dynamically rendered later */}
                </select>
              </div>
            </form>
          </section>

          {/* Shipping Module Placeholder */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Shipping Method</h2>
            <div className="border border-neutral-300 p-4 flex justify-between items-center cursor-pointer bg-neutral-50">
              <div>
                <p className="font-bold">Standard Delivery</p>
                <p className="text-sm text-neutral-500">Delivered in 3-5 business days</p>
              </div>
              <span className="font-bold">Free</span>
            </div>
            {/* TODO: Integrate Shiprocket/Delhivery here in a future phase */}
          </section>

          {/* Payment Module Placeholder (Razorpay) */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Payment</h2>
            <div className="bg-neutral-50 p-6 border border-neutral-200 text-center">
              <p className="text-neutral-600 mb-4">Secure payment powered by Razorpay</p>
              <p className="text-sm text-neutral-500 mb-4">(Supports UPI, Cards, Netbanking, Wallets)</p>
              <button className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors">
                Pay Now
              </button>
            </div>
          </section>

        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-neutral-50 p-6 sticky top-8">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6 border-b border-neutral-200 pb-6">
              {[1].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 bg-neutral-200 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">Air Jordan 1 High OG</h3>
                    <p className="text-xs text-neutral-500 mb-1">UK 9  x  1</p>
                    <span className="font-bold text-sm">₹16,500</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold">₹16,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 pt-4 flex justify-between items-center">
              <span className="font-bold uppercase tracking-wide">Total</span>
              <span className="text-xl font-bold">₹16,500</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
