export interface Option {
	dir: string;
	cwd?: string;
	copy?: "before" | "after";
	log?: "verbose" | "minimal" | boolean;
}
