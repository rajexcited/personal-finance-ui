/// <reference types="vitest" />

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig(({ mode }) => {

  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  plugins: [
    react(),
  ],
  base: env.PUBLIC_URL,
  resolve: {
    // Ensure we resolve correct file extensions
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.css']
  },
  css: {
    postcss: {
      plugins: [
        // cssnano configuration for production builds
        mode === 'production' && require('cssnano')({
          preset: [
            'default',
            {
              calc: false,
              colormin: true,
              convertValues: true,
              discardComments: {
                removeAll: true
              },
              discardDuplicates: true,
              discardEmpty: true,
              mergeIdents: false,
              mergeLonghand: true,
              mergeRules: true,
              minifyFontValues: true,
              minifyGradients: true,
              minifyParams: true,
              minifySelectors: true,
              normalizeCharset: true,
              normalizeDisplayValues: true,
              normalizePositions: true,
              normalizeRepeatStyle: true,
              normalizeString: true,
              normalizeTimingFunctions: true,
              normalizeUnicode: true,
              normalizeUrl: true,
              normalizeWhitespace: true,
              orderedValues: true,
              reduceIdents: false,
              reduceInitial: true,
              reduceTransforms: true,
              svgo: true,
              uniqueSelectors: true
            }
          ]
        })
      ].filter(Boolean)
    }
  },
  build: {
    outDir: "build", // Optional: Match CRA's default output directory
    target: "esnext", // should match with tsconfig target
    cssCodeSplit: true,
    sourcemap: env.GENERATE_SOURCEMAP === 'true',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router'],
          ui: ['@fortawesome/react-fontawesome', '@fortawesome/fontawesome-svg-core'],
          utils: ['axios', 'lodash', 'date-and-time', 'uuid'],
          storage: ['idb', 'js-cookie', 'p-memoize', 'expiry-map'],
          // Bulma JavaScript modules only
          'bulma-js': [
            'bulma-calendar',
            'bulma-carousel', 
            '@creativebulma/bulma-tagsinput'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1200,
    // Enable minification for better compression - using esbuild (built-in)
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'axios',
      'lodash'
    ]
  },
  test: {
    globals: true
  }
}});
