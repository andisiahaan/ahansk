import Link from 'next/link';
import { Logo } from '@ahansk/ui';

const FOOTER_LINKS = {
  Product: [
    { label: 'Blog', href: '/blog' },
    { label: 'Changelog', href: '/pages/changelog' },
  ],
  Resources: [
    { label: 'Documentation', href: '/pages/about' },
    { label: 'GitHub', href: 'https://github.com' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/pages/privacy' },
    { label: 'Terms of Service', href: '/pages/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex">
              <Logo height={32} />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Production-ready full-stack starter kit.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {group}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Ahansk. All rights reserved.</p>
          <p>Built with NestJS, Next.js & Prisma.</p>
        </div>
      </div>
    </footer>
  );
}
