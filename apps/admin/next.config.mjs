import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const config = {
  // Kosongkan untuk deployment subdomain (admin.domain.com)
  // Isi "/admin" untuk path-based single domain (domain.com/admin)
  basePath: process.env.NEXT_BASE_PATH || '',
  transpilePackages: ['@ahansk/ui', '@ahansk/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

export default withNextIntl(config);
