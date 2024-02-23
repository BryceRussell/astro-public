# `astro-public`

Add custom 'public' directories in Astro

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import publicDir from 'astro-public';

export default defineConfig({
  // Creates a 'public' directory at '/static'
  integrations: [publicDir('static')],
});
```

### [Package README](package/README.md)