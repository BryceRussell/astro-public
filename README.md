# `astro-public`

Add custom file based routing directories in Astro

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import pages from 'astro-public';

export default defineConfig({
  // Create 'page' directory at 'src/custom'
  integrations: [pages('custom')],
});
```

### [Package README](package/README.md)
