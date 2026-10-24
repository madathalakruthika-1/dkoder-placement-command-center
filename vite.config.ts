import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three-core', test: /node_modules[\\/]three[\\/]build[\\/]three\.module\.js/ },
            { name: 'three-extras', test: /node_modules[\\/]three[\\/]build[\\/]three\.webgpu\.js/ },
          ],
        },
      },
    },
  },
});
