import styled from 'styled-components';
import { Card, Form, Button, ListGroup, Alert, Container } from 'react-bootstrap';
import { theme } from '../../styles/theme';

export const StyledContainer = styled(Container)`
    max-width: 1200px;
    padding: ${theme.spacing.xl} ${theme.spacing.md};
`;

export const StyledCard = styled(Card)`
    border: none;
    border-radius: ${theme.borderRadius['2xl']};
    box-shadow: ${theme.shadows.glass};
    margin-bottom: ${theme.spacing.xl};
    overflow: hidden;
    transition: all ${theme.transitions.normal};
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
        transform: translateY(-8px) scale(1.01);
        box-shadow: ${theme.shadows.glow};
    }

    .card-header {
        background: ${theme.colors.gradients.medical};
        color: ${theme.colors.white};
        border: none;
        padding: ${theme.spacing.xl};
        font-weight: ${theme.typography.fontWeight.bold};
        font-size: ${theme.typography.fontSize.xl};
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: shimmer 3s infinite;
        }

        h3 {
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        p {
            position: relative;
            z-index: 1;
            opacity: 0.95;
        }
    }

    .card-body {
        padding: ${theme.spacing['2xl']};
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
    }

    @keyframes shimmer {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const StyledForm = styled(Form)`
    .form-label {
        font-weight: ${theme.typography.fontWeight.semibold};
        color: ${theme.colors.text.primary};
        margin-bottom: ${theme.spacing.md};
        font-size: ${theme.typography.fontSize.base};
        display: flex;
        align-items: center;
        gap: ${theme.spacing.sm};
    }

    .form-control,
    .form-select {
        border: 2px solid ${theme.colors.gray[200]};
        border-radius: ${theme.borderRadius.lg};
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        font-size: ${theme.typography.fontSize.base};
        transition: all ${theme.transitions.fast};
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);

        &:focus {
            border-color: ${theme.colors.primary};
            box-shadow: ${theme.shadows.primary};
            outline: none;
            background: rgba(255, 255, 255, 1);
            transform: translateY(-2px);
        }

        &:hover {
            border-color: ${theme.colors.primaryLight};
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
        }
    }

    textarea.form-control {
        min-height: 140px;
        resize: vertical;
        line-height: ${theme.typography.lineHeight.relaxed};
    }

    .form-text {
        color: ${theme.colors.text.secondary};
        font-size: ${theme.typography.fontSize.sm};
        margin-top: ${theme.spacing.xs};
    }
`;

export const StyledSubmitButton = styled(Button)`
    background: ${theme.colors.gradients.medical};
    border: none;
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing.md} ${theme.spacing['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    font-size: ${theme.typography.fontSize.base};
    transition: all ${theme.transitions.fast};
    box-shadow: ${theme.shadows.primary};
    color: ${theme.colors.white};
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }

    &:hover {
        background: ${theme.colors.gradients.medical};
        transform: translateY(-3px) scale(1.02);
        box-shadow: ${theme.shadows.glow};

        &::before {
            width: 400px;
            height: 400px;
        }
    }

    &:active {
        transform: translateY(-1px) scale(1);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

export const AnswerCard = styled(Card)`
    border: none;
    border-radius: ${theme.borderRadius['2xl']};
    box-shadow: ${theme.shadows.glass};
    margin-top: ${theme.spacing.xl};
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    transition: all ${theme.transitions.normal};

    &:hover {
        transform: translateY(-4px);
        box-shadow: ${theme.shadows.glow};
    }

    .card-header {
        background: ${theme.colors.gradients.success};
        color: ${theme.colors.white};
        border: none;
        padding: ${theme.spacing.xl};
        font-weight: ${theme.typography.fontWeight.bold};
        font-size: ${theme.typography.fontSize.xl};
        position: relative;
        overflow: hidden;

        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: slide 2s infinite;
        }

        h5 {
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
    }

    .card-body {
        padding: ${theme.spacing['2xl']};
        color: ${theme.colors.text.primary};
        line-height: ${theme.typography.lineHeight.relaxed};
        font-size: ${theme.typography.fontSize.base};
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
    }

    @keyframes slide {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;

export const SourcesList = styled(ListGroup)`
    margin-top: ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.lg};
    overflow: hidden;
    background: transparent;

    .list-group-item {
        border: 1px solid ${theme.colors.gray[200]};
        border-radius: ${theme.borderRadius.lg} !important;
        margin-bottom: ${theme.spacing.md};
        padding: ${theme.spacing.lg};
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        transition: all ${theme.transitions.fast};
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: ${theme.colors.gradients.medical};
            transform: scaleY(0);
            transition: transform ${theme.transitions.fast};
        }

        &:hover {
            background: ${theme.colors.gradients.medical};
            color: ${theme.colors.white};
            transform: translateX(8px) scale(1.02);
            box-shadow: ${theme.shadows.primary};
            border-color: transparent;

            &::before {
                transform: scaleY(1);
            }

            strong {
                color: ${theme.colors.white};
            }
        }

        strong {
            color: ${theme.colors.primary};
            font-weight: ${theme.typography.fontWeight.bold};
            transition: color ${theme.transitions.fast};
        }
    }
`;

export const StyledAlert = styled(Alert)`
    border-radius: ${theme.borderRadius.lg};
    border: none;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    margin-top: ${theme.spacing.md};

    &.alert-danger {
        background-color: ${theme.colors.danger};
        color: ${theme.colors.white};
    }

    &.alert-info {
        background-color: ${theme.colors.info};
        color: ${theme.colors.white};
    }
`;

export const LoadingSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing['2xl']};
`;
