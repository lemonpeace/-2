/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        diary: {
          bg: '#ffffff',
          input: '#f8f9fa',
          text: '#333333',
          muted: '#8e8e93',
          accent: '#1a1a1a'
        }
      }
    },
  },
  plugins: [],
}