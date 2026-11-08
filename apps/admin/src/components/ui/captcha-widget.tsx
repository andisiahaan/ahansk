'use client';

import { useEffect, useRef } from 'react';
import { useCaptchaContext } from '@/providers/captcha-provider';

interface CaptchaWidgetProps {
  action?: string;
  className?: string;
  onVerify?: (token: string) => void;
  onError?: (error: unknown) => void;
  onExpire?: () => void;
}

export function CaptchaWidget({
  action,
  className,
  onVerify,
  onError,
  onExpire,
}: CaptchaWidgetProps) {
  const { provider, siteKey, isEnabled, setActiveToken, setTurnstileWidgetId } =
    useCaptchaContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (provider !== 'turnstile' || !siteKey || !containerRef.current || !window.turnstile) {
      return;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme: 'auto',
        callback: (token: string) => {
          setActiveToken(token);
          onVerify?.(token);
        },
        'expired-callback': () => {
          setActiveToken(null);
          onExpire?.();
        },
        'error-callback': (err: string) => {
          setActiveToken(null);
          onError?.(err);
        },
      });
      widgetIdRef.current = id;
      setTurnstileWidgetId(id);
    } catch {
      // Ignored
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
        setTurnstileWidgetId(null);
      }
    };
  }, [provider, siteKey, action, setActiveToken, setTurnstileWidgetId, onVerify, onError, onExpire]);

  if (!isEnabled || provider !== 'turnstile') {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}

