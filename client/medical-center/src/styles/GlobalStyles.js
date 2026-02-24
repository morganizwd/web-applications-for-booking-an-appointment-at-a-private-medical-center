import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html {
        font-size: 16px;
        scroll-behavior: smooth;
    }

    body {
        font-family: ${theme.typography.fontFamily.primary};
        font-size: ${theme.typography.fontSize.base};
        font-weight: ${theme.typography.fontWeight.normal};
        line-height: ${theme.typography.lineHeight.normal};
        color: ${theme.colors.text.primary};
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
        background-attachment: fixed;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        min-height: 100vh;
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: ${theme.typography.fontFamily.heading};
        font-weight: ${theme.typography.fontWeight.bold};
        line-height: ${theme.typography.lineHeight.tight};
        color: ${theme.colors.text.primary};
        margin-bottom: ${theme.spacing.md};
    }

    h1 {
        font-size: ${theme.typography.fontSize['4xl']};
    }

    h2 {
        font-size: ${theme.typography.fontSize['3xl']};
    }

    h3 {
        font-size: ${theme.typography.fontSize['2xl']};
    }

    h4 {
        font-size: ${theme.typography.fontSize.xl};
    }

    h5 {
        font-size: ${theme.typography.fontSize.lg};
    }

    h6 {
        font-size: ${theme.typography.fontSize.base};
    }

    p {
        margin-bottom: ${theme.spacing.md};
        color: ${theme.colors.text.secondary};
    }

    a {
        color: ${theme.colors.primary};
        text-decoration: none;
        transition: color ${theme.transitions.fast};

        &:hover {
            color: ${theme.colors.primaryDark};
            text-decoration: none;
        }

        &:focus {
            outline: 2px solid ${theme.colors.primary};
            outline-offset: 2px;
        }
    }

    button {
        font-family: inherit;
        cursor: pointer;
        transition: all ${theme.transitions.fast};

        &:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    input, textarea, select {
        font-family: inherit;
        font-size: inherit;
    }

    ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
    }

    ::-webkit-scrollbar-track {
        background: ${theme.colors.gray[100]};
        border-radius: ${theme.borderRadius.full};
    }

    ::-webkit-scrollbar-thumb {
        background: ${theme.colors.gradients.medical};
        border-radius: ${theme.borderRadius.full};
        border: 2px solid ${theme.colors.gray[100]};

        &:hover {
            background: ${theme.colors.gradients.medical};
            filter: brightness(1.1);
        }
    }

    *:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
    }
`;
