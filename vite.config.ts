import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const isProd = process.env.BUILD_MODE === 'prod'
export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore TypeScript-related warnings
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.message.includes('Use of eval')) return
        warn(warning)
      }
    }
  },
  esbuild: {
    // Disable TypeScript type checking entirely
    tsconfigRaw: {
      compilerOptions: {
        skipLibCheck: true,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  cacheDir: 'C:/Temp/vite-cache',
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    fs: {
      strict: false,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
})

