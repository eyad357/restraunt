/**
 * Auth-module-local translations. Kept out of the shared chrome
 * dictionaries (src/i18n/translations/) per this phase's instructions —
 * only this module reads these keys, via useAuthTranslation.
 */
import type { en } from "./en";

export const ar: Record<keyof typeof en, string> = {
  "auth.login.title": "تسجيل الدخول",
  "auth.login.subtitle": "أدخل اسم المستخدم ورقم التعريف الشخصي للمتابعة.",
  "auth.login.usernameLabel": "اسم المستخدم",
  "auth.login.usernamePlaceholder": "أدخل اسم المستخدم",
  "auth.login.pinLabel": "رقم التعريف الشخصي",
  "auth.login.pinPlaceholder": "أدخل رقم التعريف الشخصي",
  "auth.login.submit": "تسجيل الدخول",
  "auth.login.submitting": "جارِ تسجيل الدخول…",
  "auth.validation.usernameRequired": "اسم المستخدم مطلوب.",
  "auth.validation.pinRequired": "رقم التعريف الشخصي مطلوب.",
  "auth.validation.pinDigitsOnly": "يجب أن يتكون رقم التعريف الشخصي من أرقام فقط.",
  "auth.validation.pinLength": "يجب أن يتكون رقم التعريف الشخصي من 4 إلى 8 أرقام.",
  "auth.error.transport": "تعذّر الوصول إلى الخادم. تحقق من الاتصال وحاول مرة أخرى.",
  "auth.error.generic": "فشل تسجيل الدخول. تحقق من اسم المستخدم ورقم التعريف الشخصي وحاول مرة أخرى.",
  "auth.logout.signingOut": "جارِ تسجيل الخروج…",
};
