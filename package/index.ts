
import type { AstroIntegration } from 'astro';
import type { Option } from './types';
import { createReadStream, existsSync, cpSync } from 'node:fs';
import { resolve, extname, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AstroError } from 'astro/errors';

type Prettify<T> = { [K in keyof T]: T[K]; } & {};

// TODO
//  - SSR?

export default function(...options: (string | Prettify<Option>)[]): AstroIntegration {
  let cwd: string
  let userOptions: Option[]

  return {
    name: 'astro-public',
    hooks: {
      'astro:config:setup': ({ config }) => {
        // Used to resolved relative 'cwd' defined by user
        cwd = fileURLToPath(config.root.toString())
       // Validate/Transform user options
        userOptions = options
        .map(option => {
          // Transform string options into objects
          if (typeof option === 'string') {
            option = {
              dir: option
            }
          }

          // Skip invalid options
          if (!option || !option?.dir || typeof option?.dir !== "string") {
            return
          }

          // Turn 'cwd' and 'dir' paths into absolute paths, handles relative paths

          option.cwd = option.cwd || "./"

          option.cwd = stringToDir(
            isAbsolute(option.cwd) ? "./" : cwd,
            option.cwd
          )
        
          option.dir = stringToDir(option.cwd, option.dir)

          return option
        })
        // Filter out invalid options
        .filter(option => Boolean(option)) as Option[]
      },
      'astro:server:setup': ({ logger, server }) => {
        for (const option of userOptions) {
          // Handle static assets during dev
          server.middlewares.use('/', (req, res, next) => {
            // Check if url is a file/asset path
            if (
              req.url
              && extname(req.url)
              && !req.url.startsWith('/@')
            ) {
              // Create path relative to custom public dir
              const asset = resolve(option.dir, `.${req.url!}`)
              if (existsSync(asset)) {
                // If asset path exists, return asset stream
                if (option.log === "verbose") logger.info(`Found public asset:\t${req.url}\t${asset}`)
                createReadStream(asset).pipe(res)
              } else {
                next()
              }
            } else {
              next()
            }
          });
        }
      },
      'astro:build:done': ({ logger, dir: output }) => {
        for (const option of userOptions) {
          try {
            // Copy custom public dir into build output
            if (option.log) logger.info("Copying directory into output: " + option.dir)
            cpSync(option.dir, fileURLToPath(output.toString()), { recursive: true })
          } catch {
            logger.warn("Failed to copy public dir into output: " + option.dir)
          } 
        }
      }
    }
  }
}

// Validates/transforms strings into absolute directory path
function stringToDir(base: string, path: string): string {
  // Check if path is string
  if (!path) {
    throw new AstroError(`[astro-public]: Invalid path!`, `"${path}"`)
  }

  // Check if path is a file URL
  if (path.startsWith('file:/')) {
    path = fileURLToPath(path)
  }

  // Check if path is relative
  if (!isAbsolute(path)) {
    path = resolve(base, path)
  }

  // Check if path is a file
  if (extname(path)) {
    path = dirname(path)
  }

  // Check if path exists
  if (!existsSync(path)) {
    throw new AstroError(`[astro-public]: Path does not exist!`, `"${path}"`)
  }

  return path
}

