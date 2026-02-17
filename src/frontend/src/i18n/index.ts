import { en } from './translations/en';
import { ptBR } from './translations/pt-BR';

export type Locale = 'en' | 'pt-BR';

export type TranslationKey = keyof typeof en;

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  'en': en,
  'pt-BR': ptBR,
};

export const supportedLocales: Locale[] = ['en', 'pt-BR'];

export type { TranslationKey as default };
