import { useMemo } from "react";
import { createMenuService } from "../services/menuService";
import { useAsyncData } from "./useAsyncData";

/** One service instance per app lifetime — it holds no state. */
const menuService = createMenuService();

export function useCategories() {
  return useAsyncData(() => menuService.listCategories(), []);
}

export function useProducts(categoryId?: string) {
  return useAsyncData(() => menuService.listProducts(categoryId), [categoryId]);
}

export function useProduct(productId: string) {
  return useAsyncData(() => menuService.getProduct(productId), [productId]);
}

export function useVariants(productId: string) {
  return useAsyncData(() => menuService.listVariants(productId), [productId]);
}

export function useModifiers(productId: string) {
  return useAsyncData(() => menuService.listModifiers(productId), [productId]);
}

/** Exposed for hooks/useMenuMutations.ts so both read and write go
 * through the same service instance. */
export function useMenuServiceInstance() {
  return useMemo(() => menuService, []);
}
