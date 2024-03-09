import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import publicDir from "astro-public";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		publicDir(
			// "custom",
			// {
			//   dir: "custom",
			//   log: "verbose"
			// },
			// {
			//   cwd: "src",
			//   dir: "custom",
			//   log: "verbose"
			// },
			// {
			//   cwd: resolve(dirname(fileURLToPath(import.meta.url)), "src"),
			//   dir: "custom",
			//   log: "verbose"
			// },
			{
				cwd: "src",
				dir: "custom",
				copy: "after",
				log: "verbose",
			},
		),
	],
});
