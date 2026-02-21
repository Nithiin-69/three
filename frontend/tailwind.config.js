/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                borderRadius: {
                        'xl': '1rem',
                        '2xl': '1.25rem',
                        '3xl': '1.75rem',
                        '4xl': '2rem',
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        surface: 'hsl(var(--surface))',
                        elevated: 'hsl(var(--elevated))',
                        overlay: 'hsl(var(--overlay))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        success: {
                                DEFAULT: 'hsl(var(--success))',
                                bg: 'hsl(var(--success-bg))',
                                subtle: 'hsl(var(--success-subtle))'
                        },
                        warning: {
                                DEFAULT: 'hsl(var(--warning))',
                                bg: 'hsl(var(--warning-bg))',
                                subtle: 'hsl(var(--warning-subtle))'
                        },
                        danger: {
                                DEFAULT: 'hsl(var(--danger))',
                                bg: 'hsl(var(--danger-bg))',
                        },
                        info: {
                                DEFAULT: 'hsl(var(--info))',
                                bg: 'hsl(var(--info-bg))',
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))',
                                subtle: 'hsl(var(--destructive-subtle))'
                        },
                        border: {
                                DEFAULT: 'hsl(var(--border))',
                                strong: 'hsl(var(--border-strong))'
                        },
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))'
                },
                backdropBlur: {
                        xs: '2px',
                        '3xl': '64px',
                        '4xl': '80px',
                },
                boxShadow: {
                        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
                        'ios': '0 4px 16px rgba(0, 0, 0, 0.1)',
                        'ios-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
                        'ios-xl': '0 16px 48px rgba(0, 0, 0, 0.15)',
                        'depth-1': '0 1px 3px rgba(0, 0, 0, 0.08)',
                        'depth-2': '0 4px 16px rgba(0, 0, 0, 0.1)',
                        'depth-3': '0 8px 32px rgba(0, 0, 0, 0.12)',
                        'depth-4': '0 16px 48px rgba(0, 0, 0, 0.15)',
                },
                spacing: {
                        '18': '4.5rem',
                        '88': '22rem',
                        '100': '25rem',
                        '112': '28rem',
                        '128': '32rem',
                },
                fontSize: {
                        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
                },
                letterSpacing: {
                        tightest: '-0.022em',
                        'apple': '-0.011em',
                },
                keyframes: {
                        'accordion-down': {
                                from: { height: '0' },
                                to: { height: 'var(--radix-accordion-content-height)' }
                        },
                        'accordion-up': {
                                from: { height: 'var(--radix-accordion-content-height)' },
                                to: { height: '0' }
                        },
                        'fade-in': {
                                from: { opacity: '0' },
                                to: { opacity: '1' }
                        },
                        'slide-up': {
                                from: { opacity: '0', transform: 'translateY(40px)' },
                                to: { opacity: '1', transform: 'translateY(0)' }
                        },
                        'scale-in': {
                                from: { opacity: '0', transform: 'scale(0.92)' },
                                to: { opacity: '1', transform: 'scale(1)' }
                        },
                        'spring-in': {
                                '0%': { opacity: '0', transform: 'scale(0.9)' },
                                '50%': { transform: 'scale(1.05)' },
                                '100%': { opacity: '1', transform: 'scale(1)' }
                        },
                        'modal-slide-up': {
                                from: { opacity: '0', transform: 'translateY(100px) scale(0.95)' },
                                to: { opacity: '1', transform: 'translateY(0) scale(1)' }
                        },
                        'pulse': {
                                '0%, 100%': { opacity: '1' },
                                '50%': { opacity: '0.6' }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'fade-in': 'fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        'slide-up': 'slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        'scale-in': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        'spring-in': 'spring-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        'modal-slide-up': 'modal-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                },
                transitionTimingFunction: {
                        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
                        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};
