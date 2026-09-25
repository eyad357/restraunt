import type { Category, LocalizedString, Modifier, Money, Product, Variant } from "../../../../contracts/entities";

/**
 * GENUINE CONTRACT GAP — see INTEGRATION_REQUEST.md. No endpoint for
 * reading OR writing Category/Product/Variant/Modifier is documented
 * anywhere in docs/contracts/ (checked api-contract.md,
 * domain-entities.md, and grepped the whole docs/ tree). The canonical
 * entity SHAPES are confirmed (frontend/contracts/entities.ts), but their
 * wire endpoints are not. Request DTOs below omit `id` (server-assigned)
 * and any field not in the canonical entity — nothing invented beyond
 * what Category/Product/Variant/Modifier already declare.
 *
 * Category/Product/Variant/Modifier carry NO `branch_id` per
 * domain-entities.md's own table for each — the menu is not
 * branch-scoped in Phase 00, unlike Order/InventoryItem/etc. No branch
 * header/param is sent by services/menuService.ts for this reason (not
 * an oversight).
 */

export interface CreateCategoryRequest {
  name: LocalizedString;
  sort_order: number;
  is_active: boolean;
}
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export interface CreateProductRequest {
  category_id: string;
  name: LocalizedString;
  base_price: Money;
  is_active: boolean;
}
export type UpdateProductRequest = Partial<CreateProductRequest>;

/**
 * `is_default` per domain-entities.md: "Exactly one variant per product
 * should be default, enforced at application layer" — no documented
 * endpoint exists for atomically "switching" the default (e.g. no
 * `actions/set-default`), so this frontend does not attempt to
 * auto-unset other variants' `is_default` when one is created/edited —
 * see INTEGRATION_REQUEST.md.
 */
export interface CreateVariantRequest {
  name: LocalizedString;
  price: Money;
  is_default: boolean;
}
export type UpdateVariantRequest = Partial<CreateVariantRequest>;

export interface CreateModifierRequest {
  name: LocalizedString;
  price_delta: Money;
  is_active: boolean;
}
export type UpdateModifierRequest = Partial<CreateModifierRequest>;

/**
 * The authoritative frontend boundary for menu data — Orders' own
 * read-only `MenuCatalogService` (modules/orders/services/menuCatalogService.ts)
 * is a SEPARATE, module-local interface by design (per this phase's
 * "do not modify Orders" ownership rule): duplicating a small interface
 * shape across two self-contained modules is preferred here over one
 * module importing another module's internals. Both ultimately read the
 * same canonical `frontend/contracts/entities.ts` types — see
 * INTEGRATION_REQUEST.md for the proposal to unify them behind a shared
 * boundary once a real menu API exists.
 */
export interface MenuService {
  listCategories(): Promise<Category[]>;
  createCategory(body: CreateCategoryRequest): Promise<Category>;
  updateCategory(id: string, body: UpdateCategoryRequest): Promise<Category>;

  listProducts(categoryId?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product>;
  createProduct(body: CreateProductRequest): Promise<Product>;
  updateProduct(id: string, body: UpdateProductRequest): Promise<Product>;

  listVariants(productId: string): Promise<Variant[]>;
  createVariant(productId: string, body: CreateVariantRequest): Promise<Variant>;
  updateVariant(id: string, body: UpdateVariantRequest): Promise<Variant>;

  listModifiers(productId: string): Promise<Modifier[]>;
  createModifier(productId: string, body: CreateModifierRequest): Promise<Modifier>;
  updateModifier(id: string, body: UpdateModifierRequest): Promise<Modifier>;
}
