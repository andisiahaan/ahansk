import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Ahansk',
  description: 'Terms of Service and conditions for using Ahansk platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        <article className="rounded-2xl border border-border bg-card p-6 sm:p-10 space-y-6 shadow-sm">
          <header className="space-y-2 border-b border-border pb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Terms of Service</h1>
            <p className="text-xs text-muted-foreground">Last updated: September 19, 2026</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using this platform, you agree to comply with and be bound by these Terms of Service.
              If you do not agree with any part of these terms, you must discontinue use of the services immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. User Accounts & Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your credentials and account information.
              Any activities that occur under your account remain your sole responsibility. Notify us immediately
              upon detecting any unauthorized access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Acceptable Use Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You agree not to misuse the services or help anyone else do so. Prohibited actions include attempting
              to probe, scan, or test the vulnerability of any system or network, breaching security or authentication
              measures, or distributing malicious software.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time without notice for conduct that
              violates these Terms or is harmful to other users, our business interests, or third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, Ahansk and its affiliates shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising out of your access to or
              use of our services.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground">6. Contact Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any questions regarding these Terms, please contact support at{' '}
              <span className="text-primary font-medium">support@ahansk.domain.com</span>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
