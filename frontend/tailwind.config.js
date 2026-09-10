/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          bg: "#F7F8F6",        // Warm off-white background
          surface: "#FFFFFF",   // Pure white surfaces
          subtle: "#F2F4F7",    // Soft neutral hover / background
          border: "#E4E7EC",    // Light clean border
          text: "#1F2933",      // Deep slate primary text
          muted: "#667085",     // Soft gray secondary text
          navy: "#183B56",      // Primary brand navy
          blue: "#2F6F8F",      // Muted blue accent
          teal: "#4F8A83",      // Soft teal secondary accent
        },
        risk: {
          low: "#5F8D73",       // Soft sage green
          medium: "#C49A4A",    // Muted amber
          high: "#C8754D",      // Muted terracotta / orange
          critical: "#B85C5C",  // Muted crimson / red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
