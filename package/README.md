# `astro-public`

Add custom 'public' directories in Astro

```sh
npm i astro-pages
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import publicDir from 'astro-public';

export default defineConfig({
  // Creates a 'public' directory at '/static'
  integrations: [publicDir('static')],
});
```

### Adding multiple directories

```js
// Creates a 'public' folder at '/static', and '/assets'
publicDir(
  'static',
  'assets'
)
```

### Using custom `cwd`

```js
// Creates a 'public' folder at 'src/static'
publicDir(
  {
    cwd: 'src'
    dir: 'static'
  }
)
```

### Change when assets get copied

```js
// Assets will be copied before the build is generated
publicDir(
  {
    dir: 'static'
    copy: 'before'
  }
)
```

### Debug logging

```js
// Log all debug messages
publicDir(
  {
    dir: 'static'
    log: 'verbose'
  }
)
```

## `Option` Reference

### `dir`

**Type**: `string`

Path to custom 'public' directory, relative paths are resolved relative to `cwd`

### `cwd`

**Type**: `string`

**Default**: `root`

Path to base directory, used to resolve relative `dir` paths. For this property, relative paths are resolved relative to the project root

### `copy`

**Type**: `"before" | "after"`

**Default**: `"before"`

When to copy directory into build output

- `before`: Assets are copied to build output before the build starts, assets can be overwrriten by assets located in `/public` 
- `after`: Assets are copied to build output after the build finished, assets will overwrrite assets located in `/public`

### `log`

**Type**: `boolean | "verbose"`

**Default**: `false`

If truthy, logs a message when copying custom 'public' directory to build output

If `verbose`, logs a message if dev middleware finds a static asset inside the custom 'public' directory

