import { useMemo, useState } from "react";
import { createMenuCatalogService } from "../services/menuCatalogService";
import { useAsyncData } from "./useAsyncData";

/**
 * One service instance per component tree lifetime is enough — the
 * service itself holds no state (see services/menuCatalogService.ts).
 */
const menuCatalogService = createMenuCatalogService();

export function useCategories() {
  return useAsyncData(() => menuCatalogService.listCategories(), []);
}

export function useProducts(categoryId: string | null) {
  return useAsyncData(
    () => (categoryId ? menuCatalogService.listProducts(categoryId) : Promise.resolve([])),
    [categoryId],
  );
}

export function useProductOptions(productId: string | null) {
  const variants = useAsyncData(
    () => (productId ? menuCatalogService.listVariants(productId) : Promise.resolve([])),
    [productId],
  );
  const modifiers = useAsyncData(
    () => (productId ? menuCatalogService.listModifiers(productId) : Promise.resolve([])),
    [productId],
  );
  return useMemo(() => ({ variants, modifiers }), [variants, modifiers]);
}

/** Selected-category UI state, kept out of the fetch hooks themselves. */
export function useCategorySelection() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  return { selectedCategoryId, setSelectedCategoryId };
}
