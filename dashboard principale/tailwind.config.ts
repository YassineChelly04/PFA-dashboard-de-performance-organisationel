import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        tt: {
          navy: "#00157C",
          blue: "#1E2F97",
          accent: "#5F2EE5",
          orange: "#FF6B00",
          sky: "#E8F4FC",
          muted: "#6B7280",
          border: "#E2E8F0",
          bg: "#FAFBFC",
        },
      },
      boxShadow: {
        card: "0 12px 30px rgba(30, 47, 151, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
