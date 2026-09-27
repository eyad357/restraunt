export const en = {
  "kitchen.header.title": "Kitchen",
  "kitchen.header.subtitle": "Live order queue for kitchen staff",

  "kitchen.column.RECEIVED": "Received",
  "kitchen.column.PREPARING": "Preparing",
  "kitchen.column.READY": "Ready",

  "kitchen.state.loading": "Loading…",
  "kitchen.state.error.title": "Couldn't load the kitchen board",
  "kitchen.state.error.retry": "Retry",
  "kitchen.state.empty.title": "No orders here",
  "kitchen.state.empty.body": "Nothing in this stage right now.",

  "kitchen.ticket.orderLabel": "Order",
  "kitchen.ticket.receivedAt": "Received",
  "kitchen.ticket.preparingAt": "Started",
  "kitchen.ticket.readyAt": "Ready since",
  "kitchen.ticket.notes": "Order note",
  "kitchen.ticket.itemNote": "Note",
  "kitchen.ticket.orderUnavailable": "Couldn't load this order's details.",
  "kitchen.ticket.orderLoading": "Loading order details…",
  "kitchen.ticket.retry": "Retry",

  "kitchen.action.start": "Start preparing",
  "kitchen.action.ready": "Mark ready",
  "kitchen.action.complete": "Complete",
  "kitchen.action.starting": "Starting…",
  "kitchen.action.markingReady": "Marking ready…",
  "kitchen.action.completing": "Completing…",
  "kitchen.action.deliveryGate":
    "This is a delivery order — it can't be completed until the driver has delivered it.",
  "kitchen.action.error": "Couldn't complete this action.",

  "kitchen.type.TAKEAWAY": "Takeaway",
  "kitchen.type.PICKUP": "Pickup",
  "kitchen.type.DELIVERY": "Delivery",
  "kitchen.type.PRE_ORDER": "Pre-order",

  "kitchen.source.CASHIER": "Cashier",
  "kitchen.source.PHONE": "Phone",
  "kitchen.source.ONLINE": "Online",
} as const;
