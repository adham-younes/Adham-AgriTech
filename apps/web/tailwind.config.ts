import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'agri-base': 'var(--agri-bg)',
        'agri-ink': 'var(--agri-ink)',
        'agri-ink-strong': 'var(--agri-ink-strong)'
      }
    }
  },
  plugins: []
};

export default config;
