import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { getBrandIcons } from '@ahansk/ui';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/providers/theme-provider';
import { IntlProvider } from '@/providers/intl-provider';
import { QueryProvider } from '@/providers/query-provider';
import { GoogleAuthProvider } from '@/providers/google-auth-provider';
import { RecaptchaProvider } from '@/providers/recaptcha-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { AppShell } from '@/components/layouts/app-shell';
import { Toaster } from '@/components/ui/toast';
import { cookies } from 'next/headers';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: { default: 'Ahansk Hub', template: '%s | Ahansk Hub' },
  description: 'Manage your account, security, and preferences seamlessly.',
  ...getBrandIcons(process.env.NEXT_PUBLIC_FRONTEND_URL),
};

export const dynamic = 'force-dynamic';

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.add(t || sys);
  } catch(e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get('access_token')?.value;

  return (
    <html lang={locale} className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <IntlProvider locale={locale} messages={messages}>
          <QueryProvider>
            <GoogleAuthProvider>
              <RecaptchaProvider>
                <ThemeProvider>
                  <AuthProvider isLoggedIn={isLoggedIn}>
                    <AppShell>{children}</AppShell>
                    <Toaster />
                  </AuthProvider>
                </ThemeProvider>
              </RecaptchaProvider>
            </GoogleAuthProvider>
          </QueryProvider>
        </IntlProvider>
      </body>
    </html>
  );
}

