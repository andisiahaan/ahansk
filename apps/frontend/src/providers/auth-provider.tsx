'use client';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';

/** Hydrates user data on first mount. Must wrap app shell. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useRef(false);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (accessToken) fetchMe();
  }, [accessToken, fetchMe]);

  return <>{children}</>;
}
