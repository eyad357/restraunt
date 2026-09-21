/**
 * Dashboard-module-local translations, following the same pattern as
 * modules/auth/translations/ — layered on the shared locale state, kept
 * out of the shared chrome dictionaries.
 */
export const en = {
  "dashboard.header.title": "Dashboard",
  "dashboard.header.subtitle": "Today's restaurant overview",
  "dashboard.header.branch.owner": "All branches",
  "dashboard.header.branch.cashier": "Your branch",
  "dashboard.header.role.owner": "Owner",
  "dashboard.header.role.cashier": "Cashier",

  "dashboard.kpi.todaySales": "Today's Sales",
  "dashboard.kpi.todaySales.ownerOnly": "Visible to Owner accounts",
  "dashboard.kpi.todayOrders": "Today's Orders",
  "dashboard.kpi.pendingOrders": "Pending Orders",
  "dashboard.kpi.completedOrders": "Completed Orders",
  "dashboard.kpi.cancelledOrders": "Cancelled Orders",
  "dashboard.kpi.activeDeliveries": "Active Delivery Orders",
  "dashboard.kpi.lowStock": "Low Stock Items",
  "dashboard.kpi.atLeast": "at least {count}",

  "dashboard.orderStatus.title": "Order Status Overview",
  "dashboard.orderStatus.subtitle": "Today's orders by status",
  "dashboard.orderStatus.DRAFT": "Draft",
  "dashboard.orderStatus.PLACED": "Pending",
  "dashboard.orderStatus.PREPARING": "Preparing",
  "dashboard.orderStatus.READY": "Ready",
  "dashboard.orderStatus.COMPLETED": "Completed",
  "dashboard.orderStatus.CANCELLED": "Cancelled",

  "dashboard.sales.title": "Sales Overview",
  "dashboard.sales.subtitle": "Completed-order revenue for the last 7 days",
  "dashboard.sales.notApplicable.title": "Owner accounts only",
  "dashboard.sales.notApplicable.body":
    "Sales reporting is available to Owner accounts, per the reporting contract.",
  "dashboard.sales.empty.title": "No completed sales yet",
  "dashboard.sales.empty.body": "This period has no completed orders yet.",

  "dashboard.recentOrders.title": "Recent Orders",
  "dashboard.recentOrders.subtitle": "The latest orders across the system",
  "dashboard.recentOrders.column.id": "Order",
  "dashboard.recentOrders.column.time": "Time",
  "dashboard.recentOrders.column.type": "Type",
  "dashboard.recentOrders.column.source": "Source",
  "dashboard.recentOrders.column.status": "Status",
  "dashboard.recentOrders.column.paymentStatus": "Payment",
  "dashboard.recentOrders.column.total": "Total",
  "dashboard.recentOrders.empty.title": "No orders yet",
  "dashboard.recentOrders.empty.body": "There are no orders for this period.",

  "dashboard.alerts.title": "Operational Alerts",
  "dashboard.alerts.subtitle": "Things that need attention right now",
  "dashboard.alerts.empty.title": "All caught up",
  "dashboard.alerts.empty.body": "No open alerts at the moment.",
  "dashboard.alerts.orderReady.title": "Order ready for pickup",
  "dashboard.alerts.orderReady.body": "Order {orderId}",
  "dashboard.alerts.lowStock.title": "Low stock",
  "dashboard.alerts.lowStock.body": "Item {itemId} — {quantity} remaining",
  "dashboard.alerts.dismiss": "Mark as read",
  "dashboard.alerts.dismissing": "Marking as read…",

  "dashboard.quickActions.title": "Quick Actions",
  "dashboard.quickActions.newOrder": "New Order",
  "dashboard.quickActions.kitchen": "Kitchen",
  "dashboard.quickActions.cashier": "Cashier",
  "dashboard.quickActions.delivery": "Delivery",
  "dashboard.quickActions.inventory": "Inventory",
  "dashboard.quickActions.comingSoon": "Not available yet",

  "dashboard.state.loading": "Loading…",
  "dashboard.state.error.title": "Couldn't load this",
  "dashboard.state.error.retry": "Retry",

  "dashboard.type.TAKEAWAY": "Takeaway",
  "dashboard.type.PICKUP": "Pickup",
  "dashboard.type.DELIVERY": "Delivery",
  "dashboard.type.PRE_ORDER": "Pre-order",

  "dashboard.source.CASHIER": "Cashier",
  "dashboard.source.PHONE": "Phone",
  "dashboard.source.ONLINE": "Online",

  "dashboard.paymentStatus.PENDING": "Pending",
  "dashboard.paymentStatus.PARTIAL": "Partial",
  "dashboard.paymentStatus.PAID": "Paid",
  "dashboard.paymentStatus.REFUNDED": "Refunded",
  "dashboard.paymentStatus.VOID": "Void",
} as const;
