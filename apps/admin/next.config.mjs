import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const config = {
  basePath: process.env.NEXT_BASE_PATH || '',
  transpilePackages: ['@ahansk/ui', '@ahansk/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  turbopack: {
    resolveAlias: {
      'next-intl/config': './src/i18n/request.ts',
    }
  }
};

const nextConfig = withNextIntl(config);

if (nextConfig.experimental && nextConfig.experimental.turbo) {
  delete nextConfig.experimental.turbo;
  if (Object.keys(nextConfig.experimental).length === 0) {
    delete nextConfig.experimental;
  }
}

export default nextConfig;
