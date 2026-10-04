// Global environment types for Next.js and Medplum SDK
interface ImportMetaEnv {
  readonly MEDPLUM_VERSION?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
