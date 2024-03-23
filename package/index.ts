import { cpSync, createReadStream, existsSync } from "node:fs";
import { dirname, extname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { AstroError } from "astro/errors";
import { z } from "astro/zod";

export type Option = z.input<typeof OptionSchema>;

const OptionSchema = z.object({
	dir: z.string(),
	cwd: z.string().default("./"),
	copy: z.union([z.literal("before"), z.literal("after")]).default("before"),
	log: z.union([z.literal("verbose"), z.literal("minimal"), z.boolean()]).default(false),
});

const OptionUnion = z.union([z.string().transform((option) => OptionSchema.parse({ dir: option })), OptionSchema]);

export default function (...options: z.input<typeof OptionUnion>[]): AstroIntegration {
	let rootDir: string;
	let outDir: string;
	let publicDir: string;
	let userOptions: z.infer<typeof OptionSchema>[];

	return {
		name: "astro-public",
		hooks: {
			"astro:config:setup": ({ config, logger }) => {
				rootDir = fileURLToPath(config.root.toString());
				outDir = fileURLToPath(config.outDir.toString());
				publicDir = fileURLToPath(config.publicDir.toString());

				const OptionArrayResolved = z
					.array(
						z.nullable(OptionUnion).transform((option) => {
							if (!option) return option;
							const dir = resolveDirectory(option.cwd, option.dir);
							const cwd = resolveDirectory(rootDir, option.cwd);
							if (!dir || !cwd) {
								if (option.log === "verbose")
									logger.warn(
										`Skipping option, directory does not exist!\n\n\t${JSON.stringify(option, null, 4).replace(
											/\n/g,
											"\n\t",
										)}\n`,
									);
								return null;
							}
							return Object.assign(option, { dir, cwd });
						}),
					)
					.transform((options) => options.filter(Boolean));

				userOptions = OptionArrayResolved.parse(options) as z.infer<typeof OptionSchema>[];
			},
			"astro:server:setup": ({ logger, server }) => {
				for (const option of userOptions) {
					if (option.log === "verbose") logger.info(`Watching "public" directory:\t${option.dir}`);
					// Handle static assets during dev
					server.middlewares.use("/", (req, res, next) => {
						// Trim query params from path
						const path = req.url?.replace(/\?[^?]*$/, "");
						// Check if url is a file/asset path
						if (path && extname(path) && !path.startsWith("/@")) {
							// Create path relative to custom public dir
							const asset = resolve(option.dir, `.${path!}`);
							if (existsSync(asset)) {
								// Skip asset if it will be overwrriten by asset in real public dir
								if (option.copy === "before" && existsSync(resolve(publicDir, `.${path!}`))) next();

								try {
									createReadStream(asset).pipe(res);
								} catch {
									logger.warn(`Failed to serve static asset:\t${path}\t${asset}`);
									next();
								}

								if (option.log === "verbose") logger.info(`Found static asset:\t${path}\t${asset}`);
							} else next();
						} else next();
					});
				}
			},
			"astro:build:setup": ({ logger }) => {
				for (const option of userOptions) {
					if (option.copy !== "before") continue;
					try {
						// Copy custom public dir into build output
						if (option.log) logger.info("Copying 'public' directory into build output: " + option.dir);
						cpSync(option.dir, outDir, { recursive: true });
					} catch {
						logger.warn("Failed to copy public dir into output: " + option.dir);
					}
				}
			},
			"astro:build:done": ({ logger }) => {
				for (const option of userOptions) {
					if (option.copy !== "after") continue;
					try {
						// Copy custom public dir into build output
						if (option.log) logger.info("Copying 'public' directory into build output: " + option.dir);
						cpSync(option.dir, outDir, { recursive: true });
					} catch {
						logger.warn("Failed to copy public dir into output: " + option.dir);
					}
				}
			},
		},
	};
}

// Validates/transforms strings into absolute directory path
function resolveDirectory(base: string, path: string): string | null {
	// Check if path is string
	if (!path) {
		throw new AstroError(`Invalid path!`, `"${path}"`);
	}

	// Check if path is a file URL
	if (path.startsWith("file:/")) {
		path = fileURLToPath(path);
	}

	// Check if path is relative
	if (!isAbsolute(path)) {
		path = resolve(base, path);
	}

	// Check if path is a file
	if (extname(path)) {
		path = dirname(path);
	}

	// Check if path exists
	if (!existsSync(path)) return null;

	return path;
}
