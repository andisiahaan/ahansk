export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  icon: string;
  direction?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    icon: '🇺🇸',
    direction: 'ltr',
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    icon: '🇮🇩',
    direction: 'ltr',
  },
];

export const DEFAULT_LOCALE = 'en';

export type SupportedLanguageCode = string;

