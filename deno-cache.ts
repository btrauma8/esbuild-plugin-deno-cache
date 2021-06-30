import { Plugin, Loader } from 'https://deno.land/x/esbuild@v0.12.12/mod.js';
import * as Cache from 'https://deno.land/x/cache@0.2.13/mod.ts'
import { join } from 'https://deno.land/std@0.100.0/path/mod.ts'

// Cloned from: https://raw.githubusercontent.com/dalcib/esbuild-plugin-cache/master/deno/mod.ts
// This allows my import-maps with aliases for relative things to work.
// like:  "abc": "./src/abc/mod.ts"

export interface ImportMap {
    readonly imports:{ [key:string]:string };
}

export interface Config {
    readonly importMap:ImportMap;
    readonly cacheDirectory?:string;
    readonly importMapBaseDirectory?:string;
}

export function denoCache({
    importMap = { imports: {} },
    cacheDirectory,
    importMapBaseDirectory = Deno.cwd()
}: Config): Plugin {

    Cache.configure({ directory: cacheDirectory });

    return {
        name: 'deno-cache',
        setup(build) {
            build.onResolve({ filter: /.*/ }, async (args) => {

                // Was having trouble with official importmap stuff. This works for me.
                const mapTo = importMap.imports[args.path];
                if (mapTo) {
                    if (mapTo.startsWith('http')) {
                        return {
                            path: mapTo,
                            namespace: 'deno-cache',
                        }
                    }
                    // This handles relative aliases in the import map
                    return { path: join(importMapBaseDirectory, mapTo )}
                }

                // NOT USING IMPORT MAP IF YOU GET HERE.
                // Use the Cache thing to download all the stuff.
                if (args.path.startsWith('http')) {
                    return {
                        path: args.path,
                        namespace: 'deno-cache',
                    }
                }
                if (args.namespace === 'deno-cache') {
                    return {
                        // import paths inside downloaded files
                        path: new URL(args.path, args.importer).toString(),
                        namespace: 'deno-cache',
                    }
                }
                // Normal file import stuff.
                return { path: join(args.resolveDir, args.path) }
            })
            build.onLoad({ filter: /.*/, namespace: 'deno-cache' }, async (args) => {
                const file = await Cache.cache(args.path, undefined, 'deps')
                const contents = await Deno.readTextFile(file.path)
                const ext = file.meta.url.split('.').pop() as Loader
                const loader = ext.match(/"j|tsx?$/) ? ext : 'js'
                return { contents, loader }
            })
        }
    }
}