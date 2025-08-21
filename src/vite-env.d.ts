/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_FX_TOGGLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
