/**
 * Shared/chrome translation keys only.
 *
 * Business-module strings (orders, menu, kitchen, etc.) belong in each
 * module's own translation file once that module is implemented — do not
 * add module-specific keys here (see LocaleContext.tsx doc comment).
 */
export const ar: Record<string, string> = {
  "app.name": "نظام إدارة المطاعم",
  "app.loading": "جارِ التحميل…",
  "app.error.title": "حدث خطأ ما",
  "app.error.body": "حدث خطأ غير متوقع. حاول إعادة تحميل الصفحة.",
  "app.error.reload": "إعادة التحميل",
  "app.notFound.title": "الصفحة غير موجودة",
  "app.notFound.body": "الصفحة التي تبحث عنها غير موجودة.",
  "app.notFound.home": "الذهاب إلى الرئيسية",
  "app.locale.toggle": "English",
};
