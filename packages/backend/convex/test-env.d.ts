// Provides typing for Vite's import.meta.glob used by convex-test in *.test.ts.
interface ImportMeta {
  glob: (
    pattern: string
  ) => Record<string, () => Promise<Record<string, unknown>>>;
}
