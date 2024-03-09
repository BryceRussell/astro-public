import { cpSync, createReadStream, existsSync } from "node:fs";
import { dirname, extname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { AstroError } from "astro/errors";
import type { Option } from "./types";

type Prettify<T> = { [K in keyof T]: T[K] } & {};

export default function (...options: (string | Prettify<Option>)[]): AstroIntegration {
	let cwd: string;
	let outDir: string;
	let publicDir: string;
	let userOptions: Option[];

	return {
		name: "astro-public",
		hooks: {
			"astro:config:setup": ({ config }) => {
				// Used to resolved relative 'cwd' defined by user
				cwd = fileURLToPath(config.root.toString());
				outDir = fileURLToPath(config.outDir.toString());
				publicDir = fileURLToPath(config.publicDir.toString());

				// Validate/Transform user options
				userOptions = options
					.map((option) => {
						// Transform string options into objects
						if (typeof option === "string") {
							option = {
								dir: option,
							};
						}

						// Skip invalid options
						if (!option || !option?.dir || typeof option?.dir !== "string") {
							return;
						}

						// Defaults
						option.copy ||= "before";
						option.cwd ||= "./";

						// Turn 'cwd' and 'dir' paths into absolute paths, handles relative paths
						if (!isAbsolute(option.cwd)) {
							option.cwd = stringToDir(cwd, option.cwd);
						}

						option.dir = stringToDir(option.cwd, option.dir);

						return option;
					})
					// Filter out invalid options
					.filter((option) => Boolean(option)) as Option[];
			},
			"astro:server:setup": ({ logger, server }) => {
				for (const option of userOptions) {
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

								if (option.log === "verbose") logger.info(`Found static asset:\t${path}\t${asset}`);

								// Serve asset
								try {
									createReadStream(asset).pipe(res);
								} catch {
									logger.warn(`Failed to serve static asset:\t${path}\t${asset}`);
									next();
								}
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
function stringToDir(base: string, path: string): string {
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
	if (!existsSync(path)) {
		throw new AstroError(`Path does not exist!`, `"${path}"`);
	}

	return path;
}
