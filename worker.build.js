import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['worker.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  outfile: 'dist/worker.js',
  external: ['__STATIC_CONTENT_MANIFEST'],
});