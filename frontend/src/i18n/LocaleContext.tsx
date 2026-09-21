/**
 * Shared i18n foundation.
 *
 * Per docs/contracts/localization-contract.md:
 *  - Arabic (`ar`) is the primary/default locale, English (`en`) secondary.
 *  - The frontend picks its own UI chrome language independently of any
 *    server data — `LocalizedString` fields from the API always carry both
 *    `{ar, en}` and the UI decides which key to render (see
 *    frontend/contracts/entities.ts).
 *  - RTL for `ar`, LTR for `en` is a frontend layout concern only.
 *
 * This module owns: locale state, a minimal translation-key lookup
 * structure, and `<html dir/lang>` switching. It does NOT contain any
 * business-module translation strings — each module owns its own
 * translation keys once it exists (see `src/i18n/translations/*` for the
 * shared/chrome-only keys defined in this phase).
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "../../contracts/enums";
import { en } from "./translations/en";
import { ar } from "./translations/ar";

export type { Locale };

const DEFAULT_LOCALE: Locale = "ar";
const LOCALE_STORAGE_KEY = "rms.locale";

const dictionaries: Record<Locale, Record<string, string>> = { ar, en };

export function directionFor(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

interface LocaleContextValue {
  locale: Locale;
  direction: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  /** Translate a shared/chrome key. Modules will get their own `t` scoped
   * to their own translation files once they exist — this is the shared
   * infrastructure primitive that scoped hook will build on. */
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "ar" || stored === "en" ? stored : DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    document.documentElement.dir = directionFor(locale);
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const dictionary = dictionaries[locale];
    return {
      locale,
      direction: directionFor(locale),
      setLocale: setLocaleState,
      t: (key: string) => dictionary[key] ?? key,
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
