import { useMemo } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { en } from "../translations/en";
import { ar } from "../translations/ar";

type OrdersTranslationKey = keyof typeof en;

const dictionaries = { en, ar };

export function useOrdersTranslation() {
  const { locale } = useLocale();

  return useMemo(() => {
    const dictionary = dictionaries[locale];
    return (key: OrdersTranslationKey, params?: Record<string, string | number>): string => {
      const template = dictionary[key];
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
      );
    };
  }, [locale]);
}
