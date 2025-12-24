import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FF",
          100: "#DCE8FF",
          500: "#0B5ED7",
          700: "#083B8A"
        },
        ink: "#0F1B2D",
        mist: "#F5F7FA",
        cloud: "#E9EEF5"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(8, 59, 138, 0.12)",
        card: "0 8px 24px rgba(15, 27, 45, 0.08)"
      },
      borderRadius: {
        xl: "18px",
        '2xl': "24px"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        shimmer: "shimmer 1.6s linear infinite"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
