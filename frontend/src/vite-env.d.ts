/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_USDC_TO_BRL_RATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
