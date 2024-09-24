import { defineConfig } from 'vite';
import { UserConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig((config: UserConfig): UserConfig => {
  if (config.mode === 'iife') {
    return {
      build: {
        rollupOptions: {
          input: resolve(__dirname, 'src/upc-payment-js.ts'),
          output: {
            dir: resolve(__dirname, "dist", "iife"),
            entryFileNames: 'upc-payment-js.js',
            esModule: false,
            format: 'iife',
          },
        },
      },
      plugins: [
        dts({
          outDir: resolve(__dirname, "dist", "iife"),
        }),
      ],
    }
  }
  if (config.mode === 'es') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/upc-payment-js.ts'),
          name: 'upc-payment-js',
          fileName: 'upc-payment-js',
          formats: ['es'],
        },
        rollupOptions: {
          output: {
            dir: resolve(__dirname, "dist", "es"),
          },
        },
      },
      plugins: [
        dts({
          outDir: resolve(__dirname, "dist", "es"),
        }),
      ],
    }
  }
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/upc-payment-js.ts'),
        name: 'upc-payment-js',
        fileName: 'upc-payment-js',
        formats: ['umd'],
      },
      rollupOptions: {
        output: {
          dir: resolve(__dirname, "dist", "umd"),
        },
      },
    },
    plugins: [
      dts({
        outDir: resolve(__dirname, "dist", "umd"),
        beforeWriteFile(filePath, content) {
          return {
            filePath: filePath.replace('upc-payment-js.d.ts', 'upc-payment-js.umd.cjs.d.ts'),
          }
        },
      }),
    ],
  }
});
