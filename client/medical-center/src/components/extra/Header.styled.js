import styled from 'styled-components';
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';

export const StyledNavbar = styled(Navbar)`
    background: ${theme.colors.gradients.medical} !important;
    backdrop-filter: blur(10px);
    box-shadow: ${theme.shadows.glass};
    padding: ${theme.spacing.md} 0;
    transition: all ${theme.transitions.normal};
    position: sticky !important;
    top: 0;
    overflow: visible !important;
    z-index: ${theme.zIndex.fixed} !important;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        pointer-events: none;
    }

    .navbar-brand {
        font-size: ${theme.typography.fontSize['2xl']};
        font-weight: ${theme.typography.fontWeight.bold};
        color: ${theme.colors.white} !important;
        text-decoration: none;
        transition: all ${theme.transitions.fast};
        position: relative;
        z-index: 1;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

        &:hover {
            transform: scale(1.05) translateY(-2px);
            color: ${theme.colors.accentLight} !important;
            text-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
        }
    }

    .navbar-toggler {
        border-color: ${theme.colors.white};
        
        .navbar-toggler-icon {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 1)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
        }
    }
`;

export const StyledNav = styled(Nav)`
    gap: ${theme.spacing.sm};
    align-items: center;
    position: relative;
    z-index: 1;

    .nav-link {
        color: ${theme.colors.white} !important;
        font-weight: ${theme.typography.fontWeight.medium};
        padding: ${theme.spacing.sm} ${theme.spacing.md} !important;
        border-radius: ${theme.borderRadius.lg};
        transition: all ${theme.transitions.fast};
        position: relative;
        text-decoration: none;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
            border-radius: ${theme.borderRadius.lg};
            opacity: 0;
            transition: opacity ${theme.transitions.fast};
        }

        &:hover {
            background: rgba(255, 255, 255, 0.15);
            color: ${theme.colors.accentLight} !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-color: rgba(255, 255, 255, 0.3);

            &::before {
                opacity: 1;
            }
        }

        &.active {
            background: rgba(255, 255, 255, 0.25);
            font-weight: ${theme.typography.fontWeight.semibold};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
    }
`;

export const StyledNavLink = styled(Link)`
    color: ${theme.colors.white} !important;
    font-weight: ${theme.typography.fontWeight.medium};
    padding: ${theme.spacing.sm} ${theme.spacing.md} !important;
    border-radius: ${theme.borderRadius.md};
    transition: all ${theme.transitions.fast};
    text-decoration: none;
    display: inline-block;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: ${theme.colors.accentLight} !important;
        transform: translateY(-2px);
    }
`;

export const StyledNavDropdown = styled(NavDropdown)`
    position: relative;
    z-index: ${theme.zIndex.modal} !important;

    .dropdown-toggle {
        color: ${theme.colors.white} !important;
        font-weight: ${theme.typography.fontWeight.medium};
        padding: ${theme.spacing.sm} ${theme.spacing.md} !important;
        border-radius: ${theme.borderRadius.md};
        transition: all ${theme.transitions.fast};
        position: relative;
        z-index: 1;

        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: ${theme.colors.accentLight} !important;
        }

        &::after {
            border-color: ${theme.colors.white} transparent transparent;
        }
    }

    .dropdown-menu {
        background-color: ${theme.colors.white} !important;
        border: none !important;
        box-shadow: ${theme.shadows.glass} !important;
        border-radius: ${theme.borderRadius.lg} !important;
        padding: ${theme.spacing.sm} !important;
        margin-top: ${theme.spacing.sm} !important;
        z-index: ${theme.zIndex.modal} !important;
        position: absolute !important;
        min-width: 250px;
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.98) !important;

        .dropdown-item {
            padding: ${theme.spacing.sm} ${theme.spacing.md};
            border-radius: ${theme.borderRadius.md};
            color: ${theme.colors.text.primary};
            transition: all ${theme.transitions.fast};

            &:hover {
                background-color: ${theme.colors.primaryLight};
                color: ${theme.colors.white};
                transform: translateX(4px);
            }

            &:active {
                background-color: ${theme.colors.primary};
            }
        }
    }
`;

export const StyledLogoutButton = styled(Button)`
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    color: ${theme.colors.white} !important;
    font-weight: ${theme.typography.fontWeight.semibold};
    padding: ${theme.spacing.sm} ${theme.spacing.lg} !important;
    border-radius: ${theme.borderRadius.lg};
    transition: all ${theme.transitions.fast};
    position: relative;
    overflow: hidden;
    z-index: 1;

    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
        z-index: -1;
    }

    &:hover {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        border-color: #ef4444 !important;
        color: ${theme.colors.white} !important;
        transform: translateY(-2px) scale(1.05);
        box-shadow: ${theme.shadows.accent};

        &::before {
            width: 300px;
            height: 300px;
        }
    }

    &:active {
        transform: translateY(0) scale(1);
    }
`;

export const StyledContainer = styled(Container)`
    max-width: 1400px;
`;
