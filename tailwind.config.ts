import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // US Foreclosure Recovery Brand Colors
        usfr: {
          primary: '#003366',      // Dark blue - trust/authority
          secondary: '#0066cc',    // Medium blue - links/interactive
          accent: '#ff6600',       // Orange - CTAs/highlights
          light: '#f5f8fa',        // Light blue-gray background
          dark: '#333333',         // Body text
          muted: '#6b7280',        // Secondary text
          success: '#10b981',      // Green for success states
          warning: '#f59e0b',      // Amber for warnings
          error: '#ef4444',        // Red for errors
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'usfr-gradient': 'linear-gradient(135deg, #003366 0%, #0066cc 100%)',
      },
    },
  },
  plugins: [],
}
export default config
