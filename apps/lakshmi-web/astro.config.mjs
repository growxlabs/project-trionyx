import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    ssr: {
      external: ['@libsql/client', '@node-rs/argon2', 'pg'],
    },
  },
});
