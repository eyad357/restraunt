import { useMemo } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { en } from "../translations/en";
import { ar } from "../translations/ar";

type KitchenTranslationKey = keyof typeof en;
const dictionaries = { en, ar };

export function useKitchenTranslation() {
  const { locale } = useLocale();
  return useMemo(() => {
    const dictionary = dictionaries[locale];
    return (key: KitchenTranslationKey): string => dictionary[key];
  }, [locale]);
}
