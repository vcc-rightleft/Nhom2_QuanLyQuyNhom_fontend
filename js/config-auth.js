const APP_CONFIG = {
    API_BASE_URL: "http://127.0.0.1:8000",
    TOKEN_KEY: "squad_cash_token",
    USER_KEY: "squad_cash_user"
};

if (typeof tailwind !== "undefined") {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    canvas: '#F6F5F0',
                    surface: '#FFFFFF',
                    ink: '#121212',
                    muted: '#52525B',
                    line: '#E4E4E7',
                    indigo: { DEFAULT: '#7C3AED', 50: '#F5F3FF', 100: '#EDE9FE', 600: '#7C3AED', 700: '#6D28D9' },
                    lime: { DEFAULT: '#D4FF00', soft: '#F4FFC2' },
                    coral: '#FF5E36',
                    cyan: '#38BDF8',
                    amber: '#FACC15',
                    mint: '#10B981'
                },
                fontFamily: {
                    display: ['"Space Grotesk"', 'sans-serif'],
                    sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                    mono: ['"JetBrains Mono"', 'monospace'],
                },
                boxShadow: {
                    'clean': '3px 3px 0px #121212',
                    'bold': '4px 4px 0px #121212',
                    'bold-sm': '2px 2px 0px #121212',
                }
            }
        }
    };
}