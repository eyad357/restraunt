/**
 * Reads the CURRENT locale from the shared `useLocale()` (single source of
 * truth for which language is active/RTL-vs-LTR) but resolves keys against
 * this module's own dictionaries, per this phase's instruction to keep
 * business-module strings out of the shared chrome translation files.
 *
 * This is not a second i18n system — it's a thin lookup layered on top of
 * the shared locale state.
 */
import { useMemo } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { en } from "../translations/en";
import { ar } from "../translations/ar";

type AuthTranslationKey = keyof typeof en;

const dictionaries = { en, ar };

export function useAuthTranslation() {
  const { locale } = useLocale();

  return useMemo(() => {
    const dictionary = dictionaries[locale];
    return (key: AuthTranslationKey): string => dictionary[key];
  }, [locale]);
}
