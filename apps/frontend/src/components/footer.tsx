import Link from 'next/link';
import { Logo } from '@ahansk/ui';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="inline-flex">
            <Logo height={28} />
          </Link>
          
          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
            <p>© {new Date().getFullYear()} Ahansk. All rights reserved.</p>
            <p className="hidden sm:block">•</p>
            <div className="flex gap-4">
              <Link href="/pages/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/pages/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
