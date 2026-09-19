'use client';
import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getRecaptchaToken = useCallback(
    async (action: string): Promise<string | undefined> => {
      if (!siteKey) {
        return undefined;
      }
      if (!executeRecaptcha) {
        return undefined;
      }
      try {
        return await executeRecaptcha(action);
      } catch {
        return undefined;
      }
    },
    [executeRecaptcha]
  );

  return { getRecaptchaToken };
}
