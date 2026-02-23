// Тема приложения для styled-components
export const theme = {
    colors: {
        // Современная медицинская палитра
        primary: '#6366f1', // Индиго
        primaryDark: '#4f46e5',
        primaryLight: '#818cf8',
        secondary: '#10b981', // Изумрудный
        secondaryDark: '#059669',
        secondaryLight: '#34d399',
        accent: '#f59e0b', // Янтарный
        accentDark: '#d97706',
        accentLight: '#fbbf24',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        light: '#f8fafc',
        dark: '#1e293b',
        white: '#ffffff',
        gray: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569',
            muted: '#94a3b8',
            inverse: '#ffffff',
        },
        background: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9',
        },
        gradients: {
            primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            medical: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            dark: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            light: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        },
    },
    typography: {
        fontFamily: {
            primary: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            heading: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
            mono: "'Fira Code', 'Courier New', monospace",
        },
        fontSize: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem',  // 36px
            '5xl': '3rem',     // 48px
        },
        fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
        lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
        },
    },
    spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
        '4xl': '6rem',   // 96px
    },
    borderRadius: {
        none: '0',
        sm: '0.25rem',   // 4px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        '2xl': '1.5rem', // 24px
        full: '9999px',
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        // Современные цветные тени
        primary: '0 10px 40px -10px rgba(99, 102, 241, 0.4)',
        secondary: '0 10px 40px -10px rgba(16, 185, 129, 0.4)',
        accent: '0 10px 40px -10px rgba(245, 158, 11, 0.4)',
        glow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
    transitions: {
        fast: '150ms ease-in-out',
        normal: '300ms ease-in-out',
        slow: '500ms ease-in-out',
    },
    breakpoints: {
        xs: '0px',
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        xxl: '1400px',
    },
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
    },
};
