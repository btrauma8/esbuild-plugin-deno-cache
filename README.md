# esbuild-plugin-deno-cache
based on dalcib's esbuild-plugin-cache ... to get my importmap stuff working. deno only.

## This is what works for me.

    import * as esbuild from 'https://deno.land/x/esbuild@v0.12.12/mod.js';
    // Note: i have ?v=xxx to ignore old deno cache while i was working on it.
    import { denoCache, ImportMap } from 'https://raw.githubusercontent.com/btrauma8/esbuild-plugin-deno-cache/main/deno-cache.ts?v=3';

    const importMap = JSON.parse(Deno.readTextFileSync('./import-map.json')) as ImportMap;

    esbuild
        .build({
            platform: "neutral",
            entryPoints: ['./src/index.ts'],
            bundle: true,
            format: 'esm',
            plugins: [denoCache({ importMap })],
            outfile: 'my-new-bundle.js',
        })
        .then(() => {
            esbuild.stop();
        })