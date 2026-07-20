import Image from 'next/image';

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
 * Brand logo component — always serves from frontend root /logo.png.
 * SSOT: logo lives only in apps/frontend/public/logo.png
 * Both frontend and admin consume the same asset via absolute URL.
 */
export function Logo({
  frontendUrl,
  width = 140,
  height = 36,
  alt = 'Logo',
  className,
}: LogoProps) {
  const src = frontendUrl
    ? `${frontendUrl.replace(/\/$/, '')}/logo.png`
    : '/logo.png';

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
