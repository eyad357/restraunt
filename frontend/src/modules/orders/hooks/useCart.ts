import { useCallback, useMemo, useState } from "react";
import type { Modifier, Product, Variant } from "../../../../contracts/entities";
import { scaleMoney, sumMoney } from "../../../money/formatMoney";
import type { CartLine, CreateOrderItemInput } from "../types/order";

function lineUnitPrice(product: Product, variant: Variant | null, modifiers: Modifier[]): string {
  const base = variant ? variant.price : product.base_price;
  return sumMoney([base, ...modifiers.map((m) => m.price_delta)]);
}

function lineTotal(line: CartLine): string {
  return scaleMoney(lineUnitPrice(line.product, line.variant, line.modifiers), line.quantity);
}

/**
 * Cart state is pure client-side React state — nothing here is persisted
 * to the backend until `toCreateOrderItems()` is submitted via
 * hooks/useOrderMutations.ts's `useCreateOrder`. Per-line pricing shown
 * here is an ESTIMATE for the operator (see money/formatMoney.ts's
 * sumMoney/scaleMoney doc comments) — the real `unit_price`/`line_total`
 * are computed server-side once the order is actually created.
 */
export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addLine = useCallback(
    (product: Product, variant: Variant | null, modifiers: Modifier[], quantity: number, notes: string) => {
      setLines((prev) => [
        ...prev,
        { lineId: crypto.randomUUID(), product, variant, modifiers, quantity, notes },
      ]);
    },
    [],
  );

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((line) => line.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((prev) =>
      prev.map((line) => (line.lineId === lineId ? { ...line, quantity: Math.max(1, quantity) } : line)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const estimatedTotal = useMemo(() => sumMoney(lines.map(lineTotal)), [lines]);

  const toCreateOrderItems = useCallback((): CreateOrderItemInput[] => {
    return lines.map((line) => ({
      product_id: line.product.id,
      variant_id: line.variant?.id ?? null,
      modifier_ids: line.modifiers.map((m) => m.id),
      quantity: line.quantity,
      notes: line.notes.trim() === "" ? null : line.notes.trim(),
    }));
  }, [lines]);

  return {
    lines,
    addLine,
    removeLine,
    updateQuantity,
    clear,
    estimatedTotal,
    lineTotal,
    lineUnitPrice: (line: CartLine) => lineUnitPrice(line.product, line.variant, line.modifiers),
    toCreateOrderItems,
  };
}
