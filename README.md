# `astro-public`

[![npm version](https://img.shields.io/npm/v/astro-public?labelColor=red&color=grey)](https://www.npmjs.com/package/astro-public)
[![readme](https://img.shields.io/badge/README-blue)](https://github.com/BryceRussell/astro-public/tree/main/package)

Add custom "public" directories for static assets in Astro

### Why?

1. Serve static assets from anywhere, including packages
2. Have multiple static asset directories instead of only the default public directory
3. Provide placeholder assets that can be overwritten by assets in Astro's public directory

### [Documentation](https://github.com/BryceRussell/astro-public/tree/main/package)

### Example

#### Use as an Integration

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import publicDir from 'astro-public';

export default defineConfig({
  // Creates a 'public' directory at '/static'
  integrations: [publicDir('static')],
});
```

#### Use Inside an Integration

```ts
// package/index.ts
import type { AstroIntegration } from "astro";
import { addIntegration } from "astro-integration-kit";
import publicDir from "astro-public";

export default function myIntegration(): AstroIntegration {
    return {
        name: "my-integration",
        hooks: {
            "astro:config:setup": ({
                updateConfig,
                config,
                logger,
            }) => {

                // Creates a 'public' directory at '/package/static'
                addIntegration({
                    integration: publicDir({
                      dir: "static",
                      cwd: import.meta.url
                    }),
                    updateConfig,
                    config,
                    logger,
                })

            }
        }
    }
}
```