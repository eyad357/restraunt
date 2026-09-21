import { useMemo } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { en } from "../translations/en";
import { ar } from "../translations/ar";

type DashboardTranslationKey = keyof typeof en;

const dictionaries = { en, ar };

/**
 * Same pattern as modules/auth/hooks/useAuthTranslation.ts, extended with
 * simple `{placeholder}` interpolation for the handful of dashboard
 * strings that need to embed a value (e.g. "Order {orderId}").
 */
export function useDashboardTranslation() {
  const { locale } = useLocale();

  return useMemo(() => {
    const dictionary = dictionaries[locale];
    return (key: DashboardTranslationKey, params?: Record<string, string | number>): string => {
      const template = dictionary[key];
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
      );
    };
  }, [locale]);
}
