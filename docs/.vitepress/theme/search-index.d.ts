// VitePress's local search index, one lazy JSON per locale (`root` here).
declare module '@localSearchIndex' {
  const index: Record<string, () => Promise<{ default: string }>>;
  export default index;
}
