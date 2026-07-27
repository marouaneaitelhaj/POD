/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_BASE_URL: string;
  readonly VITE_ANALYZE_WEBHOOK_PATH: string;
  readonly VITE_GENERATE_WEBHOOK_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
