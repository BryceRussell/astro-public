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

### Using `Option` object

```js
// Creates a 'public' folder at '/static'
publicDir(
  {
    dir: 'static'
    log: 'verbose'
  }
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

## `Option` Reference

### `dir`

**Type**: `string`

Path to custom 'public' directory, relative paths are resolved relative to `cwd`

### `cwd`

**Type**: `string`

**Default**: `root`

Path to base directory, used to resolve relative `dir` paths. For this property, relative paths are resolved relative to the project root

### `log`

**Type**: `boolean | "verbose"`

**Default**: `false`

If truthy, logs a message when copying custom 'public' directory to build output

If `verbose`, logs a message if dev middleware finds a static asset inside the custom 'public' directory

