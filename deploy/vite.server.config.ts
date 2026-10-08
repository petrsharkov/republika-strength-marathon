import vinext from 'vinext';
import { defineConfig } from 'vite';

// This file replaces vite.config.ts only in the VPS container build.
export default defineConfig({
  plugins: [vinext()],
});
