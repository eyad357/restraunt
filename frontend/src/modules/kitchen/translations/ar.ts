import type { en } from "./en";

export const ar: Record<keyof typeof en, string> = {
  "kitchen.header.title": "المطبخ",
  "kitchen.header.subtitle": "قائمة الطلبات الحية لفريق المطبخ",

  "kitchen.column.RECEIVED": "مستلَم",
  "kitchen.column.PREPARING": "قيد التحضير",
  "kitchen.column.READY": "جاهز",

  "kitchen.state.loading": "جارِ التحميل…",
  "kitchen.state.error.title": "تعذّر تحميل لوحة المطبخ",
  "kitchen.state.error.retry": "إعادة المحاولة",
  "kitchen.state.empty.title": "لا توجد طلبات هنا",
  "kitchen.state.empty.body": "لا يوجد شيء في هذه المرحلة حاليًا.",

  "kitchen.ticket.orderLabel": "الطلب",
  "kitchen.ticket.receivedAt": "وقت الاستلام",
  "kitchen.ticket.preparingAt": "بدأ التحضير",
  "kitchen.ticket.readyAt": "جاهز منذ",
  "kitchen.ticket.notes": "ملاحظة الطلب",
  "kitchen.ticket.itemNote": "ملاحظة",
  "kitchen.ticket.orderUnavailable": "تعذّر تحميل تفاصيل هذا الطلب.",
  "kitchen.ticket.orderLoading": "جارِ تحميل تفاصيل الطلب…",
  "kitchen.ticket.retry": "إعادة المحاولة",

  "kitchen.action.start": "بدء التحضير",
  "kitchen.action.ready": "تعليم كجاهز",
  "kitchen.action.complete": "إكمال",
  "kitchen.action.starting": "جارِ البدء…",
  "kitchen.action.markingReady": "جارِ التعليم كجاهز…",
  "kitchen.action.completing": "جارِ الإكمال…",
  "kitchen.action.deliveryGate": "هذا طلب توصيل — لا يمكن إكماله حتى يقوم السائق بتسليمه.",
  "kitchen.action.error": "تعذّر إتمام هذا الإجراء.",

  "kitchen.type.TAKEAWAY": "طلب خارجي",
  "kitchen.type.PICKUP": "استلام",
  "kitchen.type.DELIVERY": "توصيل",
  "kitchen.type.PRE_ORDER": "طلب مسبق",

  "kitchen.source.CASHIER": "كاشير",
  "kitchen.source.PHONE": "هاتف",
  "kitchen.source.ONLINE": "أونلاين",
};
