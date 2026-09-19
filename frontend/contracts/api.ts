/**
 * Generic API envelope types shared by every endpoint.
 * SOURCE OF TRUTH: docs/contracts/api/api-contract.md, docs/contracts/error-contract.md
 */

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiListMeta {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ApiListSuccess<T> {
  data: T[];
  meta: ApiListMeta;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> & { fields?: Record<string, string> };
  };
}

export interface ListQueryParams {
  page?: number;
  page_size?: number;
  sort?: string; // field name, optionally "-" prefixed for descending
  [filterKey: string]: unknown; // endpoint-specific filters, see api-contract.md
}
