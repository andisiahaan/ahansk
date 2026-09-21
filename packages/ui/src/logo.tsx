
interface LogoProps {
  /** URL of the frontend root — logo.png is always at {frontendUrl}/logo.png */
  frontendUrl?: string;
  /** Width in px */
  width?: number;
  /** Height in px */
  height?: number;
  /** Alt text */
  alt?: string;
  className?: string;
}

/**
 * Brand logo component — always serves from web root /logo.png.
 * SSOT: logo lives only in apps/web/public/logo.png
 * Both web and admin consume the same asset via absolute URL.
 */
export function Logo({
  frontendUrl,
  width = 140,
  height = 36,
  alt = 'Logo',
  className = '',
}: LogoProps) {
  const baseUrl = frontendUrl || process.env.NEXT_PUBLIC_FRONTEND_URL || '';
  const src = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/logo.png`
    : '/logo.png';

  return (
    <img
      src={src}
      alt={alt}
      style={{ height, width: 'auto', maxWidth: width || '100%' }}
      className={`object-contain ${className}`.trim()}
    />
  );
}
