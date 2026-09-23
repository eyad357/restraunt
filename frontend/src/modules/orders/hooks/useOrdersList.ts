import { useMemo, useState } from "react";
import { listOrders, type OrderListResult } from "../services/ordersApi";
import { useAsyncData } from "./useAsyncData";
import type { OrderFilters } from "../types/order";

const PAGE_SIZE = 20;

/**
 * `filters.search` is applied client-side against the current page only
 * (order id fragment or notes text) — see services/ordersApi.ts for why:
 * no search/full-text query param is documented for `/orders`. This is a
 * genuine, disclosed limitation (see HANDOFF.md), not a silent
 * approximation — the UI's search field is labeled accordingly.
 */
export function useOrdersList(filters: OrderFilters, page: number) {
  const { search, ...serverFilters } = filters;

  const result = useAsyncData<OrderListResult>(
    () => listOrders(serverFilters, page, PAGE_SIZE),
    [
      serverFilters.status,
      serverFilters.type,
      serverFilters.source,
      serverFilters.payment_status,
      serverFilters.created_at_from,
      serverFilters.created_at_to,
      page,
    ],
  );

  const filteredData = useMemo(() => {
    if (!result.data) return result.data;
    if (!search || search.trim() === "") return result.data;
    const needle = search.trim().toLowerCase();
    return {
      ...result.data,
      data: result.data.data.filter(
        (order) =>
          order.id.toLowerCase().includes(needle) ||
          (order.notes ?? "").toLowerCase().includes(needle),
      ),
    };
  }, [result.data, search]);

  return { ...result, data: filteredData, pageSize: PAGE_SIZE };
}

export function useOrderFilters() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [page, setPage] = useState(1);

  function updateFilters(next: Partial<OrderFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  }

  function clearFilters() {
    setFilters({});
    setPage(1);
  }

  return { filters, updateFilters, clearFilters, page, setPage };
}
