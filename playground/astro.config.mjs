import { defineConfig } from 'astro/config';
import publicDir from 'astro-public';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  integrations: [
    publicDir(
      // "custom",
      {
        dir: "custom",
        log: "verbose"
      }
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
    )
  ]
});