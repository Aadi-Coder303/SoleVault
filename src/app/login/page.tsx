'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { OWNER_EMAILS } from '@/lib/constants';

function LoginClient() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'options' | 'otp'>('options');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    const fullPhone = `+91${digits}`;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setStep('otp');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullPhone = `+91${phone.replace(/\D/g, '')}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Check if user is owner and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && OWNER_EMAILS.includes(user.email)) {
        router.push('/dashboard');
      } else {
        router.push(redirectTo);
      }
      router.refresh();
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center container mx-auto px-4 py-12">
      <div className="w-full max-w-md bg-neutral-50 p-8 border border-neutral-200 shadow-sm">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-center mb-2">
          {step === 'options' ? 'Welcome Back' : 'Verify Phone'}
        </h1>
        <p className="text-sm text-neutral-500 text-center mb-8">
          {step === 'options' 
            ? 'Sign in to your SoleVault account.' 
            : `We sent a 6-digit code to +91 ${phone}.`}
        </p>

        {error && (
          <div className="bg-red-50 text-[#E63946] border border-red-200 p-3 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        {step === 'options' ? (
          <div className="flex flex-col gap-6">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={twMerge(
                "w-full bg-white border border-neutral-300 text-black py-3 font-bold tracking-wider transition-colors flex justify-center items-center gap-3",
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-neutral-100"
              )}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.72 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.86 14.14H2.18V16.99C4.01 20.63 7.71 23 12 23Z" fill="#34A853"/>
                <path d="M5.86 14.14C5.64 13.48 5.51 12.76 5.51 12C5.51 11.24 5.64 10.52 5.86 9.86V7.01H2.18C1.43 8.5 1 10.2 1 12C1 13.8 1.43 15.5 2.18 16.99L5.86 14.14Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.35 3.87C17.46 2.11 14.97 1 12 1C7.71 1 4.01 3.37 2.18 7.01L5.86 9.86C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
              CONTINUE WITH GOOGLE
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-300"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs font-bold uppercase">or</span>
              <div className="flex-grow border-t border-neutral-300"></div>
            </div>

            {/* Phone OTP Form */}
            <form onSubmit={handleSendPhoneOtp} className="flex flex-col gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-2">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-neutral-100 border border-r-0 border-neutral-300 text-sm font-semibold text-neutral-600 select-none">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={twMerge(
                  "w-full bg-black text-white py-3 font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2",
                  loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#E63946]"
                )}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Send Login Code
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold mb-2">6-Digit Code</label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full border border-neutral-300 p-3 text-center text-xl tracking-[0.5em] focus:outline-none focus:border-black bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={twMerge(
                "w-full bg-[#E63946] text-white py-3 font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 mt-2",
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-black"
              )}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Verify & Log In
            </button>
            <button
              type="button"
              onClick={() => setStep('options')}
              className="text-sm text-neutral-500 hover:text-black underline mt-4"
            >
              Use a different method
            </button>
          </form>
        )}


      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="animate-pulse text-neutral-400">Loading…</div></div>}>
      <LoginClient />
    </Suspense>
  );
}
