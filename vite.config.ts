import { defineConfig } from 'vite';
import { UserConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command, mode }): UserConfig => {
  if (command === 'serve') {
    return {
      server: {
        open: '/example/index.html',
      },
    };
  }

  if (mode === 'iife') {
    return {
      build: {
        rollupOptions: {
          input: resolve(__dirname, 'src/upc-payment-js.ts'),
          output: {
            dir: resolve(__dirname, 'dist', 'iife'),
            entryFileNames: 'upc-payment-js.js',
            esModule: false,
            format: 'iife',
          },
        },
      },
    };
  }
  if (mode === 'es') {
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
            dir: resolve(__dirname, 'dist', 'es'),
          },
        },
      },
    };
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
          dir: resolve(__dirname, 'dist', 'umd'),
        },
      },
    },
  };
});
