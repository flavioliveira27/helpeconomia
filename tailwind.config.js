/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx",
        "./constants.ts"
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#3B82F6",
                "background-light": "#F8FAFC",
                "background-dark": "#0F172A",
                pastel: {
                    mint: "#E6FFFA",
                    "mint-dark": "#81E6D9",
                    coral: "#FFF5F5",
                    "coral-dark": "#FEB2B2",
                    sky: "#EBF8FF",
                    "sky-dark": "#90CDF4",
                    purple: "#FAF5FF",
                    "purple-dark": "#D6BCFA",
                    gray: "#F1F5F9"
                },
                secondary: '#334155',
                accent: '#3b82f6',
                success: '#10b981',
                danger: '#ef4444',
            },
            fontFamily: {
                display: ["Outfit", "sans-serif"],
                sans: ["Outfit", "sans-serif", "Inter"],
            },
            borderRadius: {
                DEFAULT: "1rem",
                "xl": "1.5rem",
                "2xl": "2rem",
            },
        },
    },
    plugins: [],
    safelist: [
        {
            pattern: /(bg|text|border)-(emerald|teal|purple|sky|indigo|cyan|red|violet|orange|pink|rose|amber|green|slate|blue|yellow|fuchsia|lime)-(50|100|200|300|400|500|600|700|800|900)/,
            variants: ['hover', 'dark', 'group-hover'],
        },
    ],
}
