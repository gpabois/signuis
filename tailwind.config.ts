import type { Config } from 'tailwindcss'
import  colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      ...colors,
      primary:  {
        '50': '#edfff8',
        '100': '#d6ffef',
        '200': '#afffe0',
        '300': '#71ffca',
        '400': '#2dfbac',
        '500': '#06fd9f',
        '600': '#00bf73',
        '700': '#00955d',
        '800': '#06754c',
        '900': '#085f40',
        '950': '#003623',
      },
      secondary: {
        '50': '#fbf6f1',
        '100': '#f5e9df',
        '200': '#ebd1bd',
        '300': '#deb093',
        '400': '#cf8a68',
        '500': '#c56e4a',
        '600': '#b75a3f',
        '700': '#a74e3b',
        '800': '#7b3b31',
        '900': '#64322a',
        '950': '#351815',
      }
    }
  },
  plugins: [],
}
export default config
