/**
 * Menu service boundary.
 *
 * GENUINE CONTRACT GAP — see INTEGRATION_REQUEST.md and types/menu.ts's
 * doc comment. No read OR write endpoint for Category/Product/Variant/
 * Modifier is documented anywhere in docs/contracts/.
 *
 * The ONLY implementation this module ships and uses by default is
 * `UnavailableMenuService`, which always rejects with
 * `MenuServiceUnavailableError` — every Menu page shows a clear "menu
 * management isn't available yet" state, never fake categories/products.
 *
 * A second implementation (`ExperimentalHttpMenuService`) exists ONLY to
 * let this phase's own interactive QA exercise the CRUD screens end to
 * end. It is NEVER used unless the operator explicitly sets
 * `VITE_MENU_EXPERIMENTAL_API=1` in their own local `.env` — unset by
 * default, not present in the committed `.env.example`, calling endpoint
 * names that are a PROPOSAL, not a contract fact. Same isolation pattern
 * already established in modules/orders/services/menuCatalogService.ts
 * for the read-only subset of this same gap.
 */

import { apiGet, apiGetList, apiPatch, apiPost } from "../../../api/client";
import type { Category, Modifier, Product, Variant } from "../../../../contracts/entities";
import type {
  CreateCategoryRequest,
  CreateModifierRequest,
  CreateProductRequest,
  CreateVariantRequest,
  MenuService,
  UpdateCategoryRequest,
  UpdateModifierRequest,
  UpdateProductRequest,
  UpdateVariantRequest,
} from "../types/menu";

export class MenuServiceUnavailableError extends Error {
  constructor() {
    super(
      "No menu-management endpoint is documented in the Phase 00 contracts " +
        "yet (see INTEGRATION_REQUEST.md). Category/Product/Variant/Modifier " +
        "management cannot reach a backend until one exists.",
    );
    this.name = "MenuServiceUnavailableError";
  }
}

class UnavailableMenuService implements MenuService {
  listCategories(): Promise<Category[]> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  createCategory(): Promise<Category> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  updateCategory(): Promise<Category> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  listProducts(): Promise<Product[]> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  getProduct(): Promise<Product> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  createProduct(): Promise<Product> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  updateProduct(): Promise<Product> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  listVariants(): Promise<Variant[]> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  createVariant(): Promise<Variant> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  updateVariant(): Promise<Variant> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  listModifiers(): Promise<Modifier[]> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  createModifier(): Promise<Modifier> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
  updateModifier(): Promise<Modifier> {
    return Promise.reject(new MenuServiceUnavailableError());
  }
}

/**
 * NOT the production default — see the file-level doc comment. Endpoint
 * names/nesting here are an unconfirmed proposal, not a contract fact.
 */
class ExperimentalHttpMenuService implements MenuService {
  async listCategories(): Promise<Category[]> {
    const result = await apiGetList<Category>("categories", { query: { page_size: 100 } });
    return result.data;
  }
  async createCategory(body: CreateCategoryRequest): Promise<Category> {
    return apiPost<Category>("categories", { body });
  }
  async updateCategory(id: string, body: UpdateCategoryRequest): Promise<Category> {
    return apiPatch<Category>(`categories/${id}`, { body });
  }

  async listProducts(categoryId?: string): Promise<Product[]> {
    const result = await apiGetList<Product>("products", {
      query: { category_id: categoryId, page_size: 100 },
    });
    return result.data;
  }
  async getProduct(id: string): Promise<Product> {
    return apiGet<Product>(`products/${id}`);
  }
  async createProduct(body: CreateProductRequest): Promise<Product> {
    return apiPost<Product>("products", { body });
  }
  async updateProduct(id: string, body: UpdateProductRequest): Promise<Product> {
    return apiPatch<Product>(`products/${id}`, { body });
  }

  async listVariants(productId: string): Promise<Variant[]> {
    const result = await apiGetList<Variant>(`products/${productId}/variants`, {
      query: { page_size: 100 },
    });
    return result.data;
  }
  async createVariant(productId: string, body: CreateVariantRequest): Promise<Variant> {
    return apiPost<Variant>(`products/${productId}/variants`, { body });
  }
  async updateVariant(id: string, body: UpdateVariantRequest): Promise<Variant> {
    return apiPatch<Variant>(`variants/${id}`, { body });
  }

  async listModifiers(productId: string): Promise<Modifier[]> {
    const result = await apiGetList<Modifier>(`products/${productId}/modifiers`, {
      query: { page_size: 100 },
    });
    return result.data;
  }
  async createModifier(productId: string, body: CreateModifierRequest): Promise<Modifier> {
    return apiPost<Modifier>(`products/${productId}/modifiers`, { body });
  }
  async updateModifier(id: string, body: UpdateModifierRequest): Promise<Modifier> {
    return apiPatch<Modifier>(`modifiers/${id}`, { body });
  }
}

export function createMenuService(): MenuService {
  const experimentalFlag = (import.meta.env as Record<string, string | undefined>).VITE_MENU_EXPERIMENTAL_API;
  if (experimentalFlag === "1") {
    return new ExperimentalHttpMenuService();
  }
  return new UnavailableMenuService();
}
