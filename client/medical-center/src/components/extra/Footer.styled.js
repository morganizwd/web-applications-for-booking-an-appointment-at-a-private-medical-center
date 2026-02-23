import styled from 'styled-components';
import { Container, Row, Col } from 'react-bootstrap';
import { theme } from '../../styles/theme';

export const StyledFooter = styled.footer`
    background: ${theme.colors.gradients.dark};
    color: ${theme.colors.white};
    padding: ${theme.spacing['2xl']} 0 ${theme.spacing.xl};
    margin-top: ${theme.spacing['3xl']};
    box-shadow: ${theme.shadows.glass};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
        pointer-events: none;
    }

    h5 {
        color: ${theme.colors.white};
        font-weight: ${theme.typography.fontWeight.bold};
        margin-bottom: ${theme.spacing.lg};
        font-size: ${theme.typography.fontSize.lg};
        position: relative;
        padding-bottom: ${theme.spacing.sm};

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 50px;
            height: 3px;
            background: linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%);
            border-radius: ${theme.borderRadius.full};
        }
    }

    p {
        color: ${theme.colors.gray[300]};
        margin-bottom: ${theme.spacing.md};
        line-height: ${theme.typography.lineHeight.relaxed};
        transition: color ${theme.transitions.fast};

        &:hover {
            color: ${theme.colors.white};
        }
    }

    a {
        color: ${theme.colors.gray[300]};
        text-decoration: none;
        transition: all ${theme.transitions.fast};

        &:hover {
            color: ${theme.colors.primaryLight};
            transform: translateX(4px);
        }
    }
`;

export const StyledContainer = styled(Container)`
    max-width: 1400px;
`;

export const StyledRow = styled(Row)`
    margin-bottom: ${theme.spacing.xl};
`;

export const StyledCol = styled(Col)`
    margin-bottom: ${theme.spacing.lg};

    @media (max-width: ${theme.breakpoints.md}) {
        margin-bottom: ${theme.spacing.xl};
        text-align: center;
    }
`;

export const CopyrightText = styled.div`
    text-align: center;
    color: ${theme.colors.gray[500]};
    padding-top: ${theme.spacing.xl};
    border-top: 1px solid ${theme.colors.gray[700]};
    font-size: ${theme.typography.fontSize.sm};
`;
