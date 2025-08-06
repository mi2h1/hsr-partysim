import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hsr-gold': '#FFD700',
        'hsr-purple': '#8B5CF6',
        'hsr-blue': '#3B82F6',
        'hsr-dark': '#1F2937',
      }
    },
  },
  plugins: [],
}
export default config