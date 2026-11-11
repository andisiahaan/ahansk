'use client';

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import Script from 'next/script';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export type CaptchaProviderType = 'google' | 'turnstile';

export interface CaptchaContextValue {
  provider: CaptchaProviderType | null;
  siteKey: string | null;
  isEnabled: boolean;
  isReady: boolean;
  getCaptchaToken: (action?: string) => Promise<string | undefined>;
  activeToken: string | null;
  setActiveToken: (token: string | null) => void;
  turnstileWidgetId: string | null;
  setTurnstileWidgetId: (id: string | null) => void;
}

const CaptchaContext = createContext<CaptchaContextValue>({
  provider: null,
  siteKey: null,
  isEnabled: false,
  isReady: true,
  getCaptchaToken: async () => undefined,
  activeToken: null,
  setActiveToken: () => {},
  turnstileWidgetId: null,
  setTurnstileWidgetId: () => {},
});

export function useCaptchaContext(): CaptchaContextValue {
  return useContext(CaptchaContext);
}

function GoogleCaptchaInner({
  children,
  siteKey,
}: {
  children: ReactNode;
  siteKey: string;
}) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [activeToken, setActiveToken] = useState<string | null>(null);

  const getCaptchaToken = useCallback(
    async (action?: string): Promise<string | undefined> => {
      if (!executeRecaptcha) return undefined;
      try {
        return await executeRecaptcha(action || 'submit');
      } catch {
        return undefined;
      }
    },
    [executeRecaptcha],
  );

  return (
    <CaptchaContext.Provider
      value={{
        provider: 'google',
        siteKey,
        isEnabled: true,
        isReady: true,
        getCaptchaToken,
        activeToken,
        setActiveToken,
        turnstileWidgetId: null,
        setTurnstileWidgetId: () => {},
      }}
    >
      {children}
    </CaptchaContext.Provider>
  );
}

function TurnstileCaptchaInner({
  children,
  siteKey,
}: {
  children: ReactNode;
  siteKey: string;
}) {
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);
  const invisibleContainerRef = useRef<HTMLDivElement | null>(null);
  const invisibleWidgetIdRef = useRef<string | null>(null);
  const pendingResolversRef = useRef<Array<(token: string | undefined) => void>>([]);

  useEffect(() => {
    if (!isScriptReady || !window.turnstile || !invisibleContainerRef.current) return;
    if (invisibleWidgetIdRef.current) return;

    try {
      const id = window.turnstile.render(invisibleContainerRef.current, {
        sitekey: siteKey,
        size: 'invisible',
        execution: 'execute',
        callback: (token: string) => {
          setActiveToken(token);
          const resolvers = [...pendingResolversRef.current];
          pendingResolversRef.current = [];
          resolvers.forEach((resolve) => resolve(token));
        },
        'expired-callback': () => {
          setActiveToken(null);
        },
        'error-callback': () => {
          const resolvers = [...pendingResolversRef.current];
          pendingResolversRef.current = [];
          resolvers.forEach((resolve) => resolve(undefined));
        },
      });
      invisibleWidgetIdRef.current = id;
    } catch {
      // Ignored
    }

    return () => {
      if (invisibleWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(invisibleWidgetIdRef.current);
        invisibleWidgetIdRef.current = null;
      }
    };
  }, [isScriptReady, siteKey]);

  const getCaptchaToken = useCallback(
    async (action?: string): Promise<string | undefined> => {
      if (activeToken) {
        const token = activeToken;
        setActiveToken(null);
        if (turnstileWidgetId && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId);
        }
        return token;
      }

      if (window.turnstile && invisibleWidgetIdRef.current) {
        return new Promise<string | undefined>((resolve) => {
          pendingResolversRef.current.push(resolve);
          const timeout = setTimeout(() => {
            const idx = pendingResolversRef.current.indexOf(resolve);
            if (idx !== -1) {
              pendingResolversRef.current.splice(idx, 1);
              resolve(undefined);
            }
          }, 8000);

          try {
            window.turnstile?.execute(invisibleWidgetIdRef.current ?? undefined, {
              action,
            });
          } catch {
            clearTimeout(timeout);
            resolve(undefined);
          }
        });
      }

      return undefined;
    },
    [activeToken, turnstileWidgetId],
  );

  return (
    <CaptchaContext.Provider
      value={{
        provider: 'turnstile',
        siteKey,
        isEnabled: true,
        isReady: isScriptReady,
        getCaptchaToken,
        activeToken,
        setActiveToken,
        turnstileWidgetId,
        setTurnstileWidgetId,
      }}
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setIsScriptReady(true)}
      />
      <div
        ref={invisibleContainerRef}
        id="cf-turnstile-invisible-container"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      {children}
    </CaptchaContext.Provider>
  );
}

const rawProvider = (process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER ||
  (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? 'google' : '')) as
  | CaptchaProviderType
  | '';

const siteKey =
  process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ||
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
  '';

export function CaptchaProvider({ children }: { children: ReactNode }) {
  if (!rawProvider || !siteKey) {
    return <>{children}</>;
  }

  if (rawProvider === 'turnstile') {
    return <TurnstileCaptchaInner siteKey={siteKey}>{children}</TurnstileCaptchaInner>;
  }

  if (rawProvider === 'google') {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
        <GoogleCaptchaInner siteKey={siteKey}>{children}</GoogleCaptchaInner>
      </GoogleReCaptchaProvider>
    );
  }

  return <>{children}</>;
}

