import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure Vite et React pour livrer une application rapide et mobile-first.
export default defineConfig({
  plugins: [react()],
});
