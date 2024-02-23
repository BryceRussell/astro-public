export interface Option {
  log?: "verbose" | "minimal" | boolean | null | undefined;
  cwd?: string;
  dir: string;
  copy?: "before" | "after"
}