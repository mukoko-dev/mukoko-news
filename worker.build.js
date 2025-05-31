import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['worker.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  outfile: 'dist/worker.js',
  external: [
    '__STATIC_CONTENT_MANIFEST',
    'strnum'
  ],
  metafile: true,
  minify: true,
  sourcemap: true,
  target: 'es2020',
  mainFields: ['browser', 'module', 'main'],
  conditions: ['browser', 'worker'],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});