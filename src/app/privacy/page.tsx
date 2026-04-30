import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Sole Vault',
  description: 'Privacy Policy and Data Protection guidelines for Sole Vault',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-3">Legal</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-neutral-500">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="lead text-lg mb-8 text-neutral-600 dark:text-neutral-400">
          At Sole Vault, we are committed to protecting your privacy and ensuring that your personal data is handled securely and in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">1. Information We Collect</h2>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300">
          We collect personal information that you provide to us directly when you:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2 text-neutral-700 dark:text-neutral-300">
          <li>Create an account or make a purchase.</li>
          <li>Subscribe to our newsletter.</li>
          <li>Contact our customer support team.</li>
        </ul>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          This information may include your name, email address, phone number, shipping address, and payment information.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">2. How We Use Your Data</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          We process your personal data for the following purposes:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2 text-neutral-700 dark:text-neutral-300">
          <li>To fulfill and manage your orders, payments, and returns.</li>
          <li>To communicate with you regarding your order status and provide customer support.</li>
          <li>To send promotional communications, subject to your explicit consent.</li>
          <li>To improve our website functionality and security.</li>
        </ul>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">3. Data Sharing & Security</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          We do not sell your personal data. We may share necessary data with trusted third-party service providers (e.g., payment gateways like PayU, logistics partners like Delhivery) strictly for fulfilling your order. We implement robust security measures to protect your data against unauthorized access or breaches.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">4. Your Rights</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          Under the DPDP Act, you have the right to:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2 text-neutral-700 dark:text-neutral-300">
          <li>Access a summary of the personal data we hold about you.</li>
          <li>Request correction or deletion of your personal data.</li>
          <li>Withdraw your consent for processing your personal data at any time.</li>
          <li>Nominate an individual to exercise these rights in the event of death or incapacity.</li>
        </ul>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">5. Contact Us</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          For any questions, concerns, or to exercise your rights regarding your personal data, please contact our Grievance Officer at: <br />
          <a href="mailto:privacy@solevault.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@solevault.com</a>
        </p>
      </div>
      
      <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}
