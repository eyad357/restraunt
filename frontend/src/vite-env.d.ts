/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the backend API. See src/config/env.ts. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
