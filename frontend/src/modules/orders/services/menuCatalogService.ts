/**
 * Menu catalog service boundary.
 *
 * GENUINE CONTRACT GAP — see INTEGRATION_REQUEST.md: no endpoint for
 * listing Category/Product/Variant/Modifier data is documented anywhere
 * in docs/contracts/ (checked api-contract.md, domain-entities.md, and
 * grepped the whole docs/ tree for "/products", "/categories",
 * "/variants", "/modifiers" — the only hit was the unrelated
 * `GET /reports/products` ranking endpoint). Order creation needs to
 * browse the menu (Category → Product → Variant → Modifier, per this
 * phase's brief), but this frontend cannot invent that endpoint.
 *
 * Design: `MenuCatalogService` (types/order.ts) is the boundary order
 * creation depends on. The ONLY implementation this module ships and
 * uses by default is `UnavailableMenuCatalogService`, which always
 * rejects with `MenuCatalogUnavailableError` — order creation shows a
 * clear "menu data isn't available yet" state, never fake products.
 *
 * A second, clearly-isolated implementation
 * (`ExperimentalHttpMenuCatalogService`) exists ONLY to let this phase's
 * own interactive QA exercise the cart-building UI end to end. It is
 * NEVER used unless the operator explicitly sets
 * `VITE_ORDERS_EXPERIMENTAL_MENU_API=1` in their own local `.env` — unset
 * by default, not present in `.env.example`'s committed template, and
 * calls endpoint names (`/categories`, `/products`, etc.) that are a
 * PROPOSAL for what such endpoints might look like, not a contract fact.
 * This matches this phase's explicit allowance: "temporary development
 * mocks are allowed ONLY if isolated, clearly development-only, and not a
 * permanent production fallback."
 */

import { apiGetList } from "../../../api/client";
import type { Category, Modifier, Product, Variant } from "../../../../contracts/entities";
import type { MenuCatalogService } from "../types/order";

export class MenuCatalogUnavailableError extends Error {
  constructor() {
    super(
      "No menu/catalog endpoint is documented in the Phase 00 contracts yet " +
        "(see INTEGRATION_REQUEST.md). Order creation cannot browse products " +
        "until one exists.",
    );
    this.name = "MenuCatalogUnavailableError";
  }
}

class UnavailableMenuCatalogService implements MenuCatalogService {
  listCategories(): Promise<Category[]> {
    return Promise.reject(new MenuCatalogUnavailableError());
  }
  listProducts(): Promise<Product[]> {
    return Promise.reject(new MenuCatalogUnavailableError());
  }
  listVariants(): Promise<Variant[]> {
    return Promise.reject(new MenuCatalogUnavailableError());
  }
  listModifiers(): Promise<Modifier[]> {
    return Promise.reject(new MenuCatalogUnavailableError());
  }
}

/**
 * NOT the production default — see the file-level doc comment. Endpoint
 * names here are an unconfirmed proposal, not a contract fact.
 */
class ExperimentalHttpMenuCatalogService implements MenuCatalogService {
  async listCategories(): Promise<Category[]> {
    const result = await apiGetList<Category>("categories", { query: { page_size: 100 } });
    return result.data;
  }
  async listProducts(categoryId: string): Promise<Product[]> {
    const result = await apiGetList<Product>("products", {
      query: { category_id: categoryId, page_size: 100 },
    });
    return result.data;
  }
  async listVariants(productId: string): Promise<Variant[]> {
    const result = await apiGetList<Variant>(`products/${productId}/variants`, {
      query: { page_size: 100 },
    });
    return result.data;
  }
  async listModifiers(productId: string): Promise<Modifier[]> {
    const result = await apiGetList<Modifier>(`products/${productId}/modifiers`, {
      query: { page_size: 100 },
    });
    return result.data;
  }
}

export function createMenuCatalogService(): MenuCatalogService {
  const experimentalFlag = (import.meta.env as Record<string, string | undefined>)
    .VITE_ORDERS_EXPERIMENTAL_MENU_API;
  if (experimentalFlag === "1") {
    return new ExperimentalHttpMenuCatalogService();
  }
  return new UnavailableMenuCatalogService();
}
