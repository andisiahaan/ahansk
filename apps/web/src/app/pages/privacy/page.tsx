import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Ahansk',
  description: 'Privacy Policy explaining how Ahansk collects, uses, and safeguards personal data.',
};

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: September 19, 2026</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect information that you directly provide when registering an account, updating your profile,
              or communicating with us. This includes your name, email address, IP address, and browser information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use the collected information to authenticate users, deliver account notifications, ensure security
              and prevent abuse, optimize performance, and maintain platform stability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Data Security & Storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Security is foundational to our architecture. Passwords are encrypted using Argon2id, sensitive tokens
              are securely hashed in database records, and authentication tokens are kept in encrypted httpOnly cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Cookies and Tracking</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We only use essential cookies strictly necessary for authentication and CSRF security, as well as
              preferences such as language and theme selection. We do not sell user data to third parties.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground">5. Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions or concerns regarding our privacy practices, please contact us at{' '}
              <span className="text-primary font-medium">privacy@ahansk.domain.com</span>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
