import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'supabase'
            }

            if (id.includes('react')) {
              return 'react-vendor'
            }

            return 'vendor'
          }

          if (id.includes('/pages/admin/') || id.includes('/hooks/useAdminQueues')) {
            return 'admin'
          }

          if (id.includes('/pages/super-admin/') || id.includes('/hooks/useSuperAdminDashboard')) {
            return 'super-admin'
          }

          if (id.includes('/pages/auth/')) {
            return 'auth'
          }

          if (id.includes('/pages/info/')) {
            return 'info'
          }
        },
      },
    },
  },
  server: {
    allowedHosts: ['fuzzy-parrots-strive.loca.lt'],
  },
})
