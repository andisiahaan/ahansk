'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type LanguageOption } from '@ahansk/shared';
import { cn } from '@/lib/cn';

interface LanguageSwitcherProps {
  className?: string;
}

function setLocaleCookie(code: string): void {
  document.cookie = `locale=${code}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const currentLocale = useLocale();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const selectLanguage = (lang: LanguageOption) => {
    setLocaleCookie(lang.code);
    setOpen(false);
    window.location.reload();
  };

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLocale) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Current language: ${activeLang.nativeName}. Click to change language`}
        className={cn(
          'inline-flex items-center justify-center size-9 rounded-full',
          'border border-border bg-muted text-muted-foreground',
          'hover:bg-secondary hover:text-foreground transition-colors cursor-pointer',
        )}
      >
        <span className="text-sm select-none" title={activeLang.name}>
          {activeLang.icon || <Globe className="size-4" />}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Select Language
          </div>
          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLocale;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => selectLanguage(lang)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.icon}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {isSelected && <Check className="size-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
