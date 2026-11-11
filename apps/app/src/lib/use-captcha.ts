'use client';

import { useCallback } from 'react';
import { useCaptchaContext } from '@/providers/captcha-provider';

export function useCaptcha() {
  const { isEnabled, provider, getCaptchaToken, activeToken } = useCaptchaContext();

  const getToken = useCallback(
    async (action?: string): Promise<string | undefined> => {
      if (!isEnabled) {
        return undefined;
      }
      return getCaptchaToken(action);
    },
    [isEnabled, getCaptchaToken],
  );

  return {
    isEnabled,
    provider,
    activeToken,
    getCaptchaToken: getToken,
    getRecaptchaToken: getToken,
  };
}

export const useRecaptcha = useCaptcha;

