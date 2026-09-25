import { useMemo } from "react";
import { useLocale } from "../../../i18n/LocaleContext";
import { en } from "../translations/en";
import { ar } from "../translations/ar";

type MenuTranslationKey = keyof typeof en;
const dictionaries = { en, ar };

export function useMenuTranslation() {
  const { locale } = useLocale();
  return useMemo(() => {
    const dictionary = dictionaries[locale];
    return (key: MenuTranslationKey): string => dictionary[key];
  }, [locale]);
}
