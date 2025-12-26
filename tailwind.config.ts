import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        event: {
          vacation: "hsl(var(--event-vacation))",
          "vacation-bg": "hsl(var(--event-vacation-bg))",
          "vacation-border": "hsl(var(--event-vacation-border))",
          sick: "hsl(var(--event-sick))",
          "sick-bg": "hsl(var(--event-sick-bg))",
          "sick-border": "hsl(var(--event-sick-border))",
          training: "hsl(var(--event-training))",
          "training-bg": "hsl(var(--event-training-bg))",
          "training-border": "hsl(var(--event-training-border))",
          team: "hsl(var(--event-team))",
          "team-bg": "hsl(var(--event-team-bg))",
          "team-border": "hsl(var(--event-team-border))",
          company: "hsl(var(--event-company))",
          "company-bg": "hsl(var(--event-company-bg))",
          "company-border": "hsl(var(--event-company-border))",
        },
        timeline: {
          header: "hsl(var(--timeline-header))",
          weekend: "hsl(var(--timeline-weekend))",
          today: "hsl(var(--timeline-today))",
          grid: "hsl(var(--timeline-grid))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent))",
        },
        header: {
          DEFAULT: "hsl(var(--header-background))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
      spacing: {
        "row-height": "56px",
        "col-width": "80px",
        "sidebar-width": "280px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
