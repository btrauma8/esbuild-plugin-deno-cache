# esbuild-plugin-deno-cache

based on dalcib's esbuild-plugin-cache

I couldn't get the importmap stuff working right.
I like to have relative path aliases in my importmap.
Stuff like "xyz": "./src/xyz/mod.ts" for example.

This doesn't use any fancy import map modules, so, maybe it doesn't handle all the things the official import map stuff should handle.
But it works for me.

Once deno bundling stopped working for me, somewhere around version 1.11 or something, I had to find a way to bundle again.
This is what is finally working. I'm just bundling server code (not css, etc). A bunch of ts down to one single js file for deploying.


## Like this...

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
            plugins: [denoCache({
                importMap,
                // cacheDirectory: './some-folder', // or default deno cache dir
                // importMapBaseDirectory: Deno.cwd() // This is the default if you don't specify
            })],
            outfile: 'my-new-bundle.js',
        })
        .then(() => {
            esbuild.stop();
        })

### Save that as whatever.ts and then just run it:
deno run --unstable --allow-net --allow-read --allow-write --allow-env --allow-run whatever.ts
