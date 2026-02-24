import styled from 'styled-components';
import { Container, Card, Button, Alert, Carousel, Row, Col, Spinner } from 'react-bootstrap';
import { theme } from '../../styles/theme';

export const StyledContainer = styled(Container)`
    max-width: 1400px;
    padding: ${theme.spacing.xl} ${theme.spacing.md};
`;

export const LoadingContainer = styled(Container)`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
`;

export const StyledCarousel = styled(Carousel)`
    margin-bottom: ${theme.spacing['3xl']};
    box-shadow: ${theme.shadows['2xl']};
    border-radius: ${theme.borderRadius.xl};
    overflow: hidden;
    position: relative;
    z-index: 1;

    .carousel-item {
        position: relative;
        height: 500px;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: brightness(0.7);
            transition: filter ${theme.transitions.slow};
        }

        &:hover img {
            filter: brightness(0.8);
        }
    }

    .carousel-caption {
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
        padding: ${theme.spacing['2xl']} ${theme.spacing.xl};
        border-radius: ${theme.borderRadius.xl};
        bottom: 0;
        left: 0;
        right: 0;

        h3 {
            font-size: ${theme.typography.fontSize['3xl']};
            font-weight: ${theme.typography.fontWeight.bold};
            color: ${theme.colors.white};
            margin-bottom: ${theme.spacing.md};
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        p {
            font-size: ${theme.typography.fontSize.xl};
            color: ${theme.colors.white};
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
    }

    .carousel-control-prev,
    .carousel-control-next {
        width: 50px;
        height: 50px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: ${theme.borderRadius.full};
        top: 50%;
        transform: translateY(-50%);
        transition: all ${theme.transitions.fast};

        &:hover {
            background-color: rgba(255, 255, 255, 0.4);
        }
    }
`;

export const HeroSection = styled.section`
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%);
    color: ${theme.colors.white};
    padding: ${theme.spacing['4xl']} 0;
    margin-bottom: ${theme.spacing['3xl']};
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http:
        opacity: 0.3;
    }

    h1 {
        font-size: ${theme.typography.fontSize['5xl']};
        font-weight: ${theme.typography.fontWeight.bold};
        margin-bottom: ${theme.spacing.lg};
        position: relative;
        z-index: 1;
    }

    p {
        font-size: ${theme.typography.fontSize.xl};
        margin-bottom: ${theme.spacing.xl};
        opacity: 0.95;
        position: relative;
        z-index: 1;
    }
`;

export const SectionContainer = styled.div`
    margin-bottom: ${theme.spacing['3xl']};
    padding: ${theme.spacing.xl} 0;
`;

export const SectionTitle = styled.h2`
    font-size: ${theme.typography.fontSize['3xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.text.primary};
    margin-bottom: ${theme.spacing.xl};
    text-align: center;
    position: relative;
    padding-bottom: ${theme.spacing.md};

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 4px;
        background: linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%);
        border-radius: ${theme.borderRadius.full};
    }
`;

export const StyledRow = styled(Row)`
    margin-top: ${theme.spacing.xl};
`;

export const StyledCol = styled(Col)`
    margin-bottom: ${theme.spacing.xl};
`;

export const StyledCard = styled(Card)`
    border: none;
    border-radius: ${theme.borderRadius['2xl']};
    box-shadow: ${theme.shadows.glass};
    transition: all ${theme.transitions.normal};
    height: 100%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${theme.colors.gradients.medical};
        transform: scaleX(0);
        transition: transform ${theme.transitions.normal};
        z-index: 1;
    }

    &:hover {
        transform: translateY(-12px) scale(1.02);
        box-shadow: ${theme.shadows.glow};

        &::before {
            transform: scaleX(1);
        }
    }

    .card-img-top {
        height: 250px;
        object-fit: cover;
        transition: transform ${theme.transitions.slow};
        background: ${theme.colors.gradients.medical};
        position: relative;
        overflow: hidden;

        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            opacity: 0;
            transition: opacity ${theme.transitions.normal};
        }
    }

    &:hover .card-img-top {
        transform: scale(1.15);

        &::after {
            opacity: 1;
        }
    }

    .card-body {
        padding: ${theme.spacing.xl};
        display: flex;
        flex-direction: column;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
    }

    .card-title {
        font-size: ${theme.typography.fontSize.xl};
        font-weight: ${theme.typography.fontWeight.bold};
        color: ${theme.colors.text.primary};
        margin-bottom: ${theme.spacing.md};
        background: ${theme.colors.gradients.medical};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .card-subtitle {
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semibold};
        margin-bottom: ${theme.spacing.sm};
    }

    .card-text {
        color: ${theme.colors.text.secondary};
        line-height: ${theme.typography.lineHeight.relaxed};
        flex-grow: 1;
        margin-bottom: ${theme.spacing.md};
    }
`;

export const DepartmentCard = styled(StyledCard)`
    background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.background.secondary} 100%);
    border-left: 4px solid ${theme.colors.primary};
    overflow: hidden;
    text-decoration: none;
    cursor: pointer;
    display: block;

    .card-img-top {
        height: 200px;
        object-fit: cover;
        width: 100%;
        border-radius: ${theme.borderRadius['2xl']} ${theme.borderRadius['2xl']} 0 0;
        transition: transform ${theme.transitions.slow};
        filter: brightness(0.9);
    }

    &:hover {
        text-decoration: none;
        
        .card-img-top {
            transform: scale(1.1);
            filter: brightness(1);
        }
    }

    .card-body {
        padding: ${theme.spacing.lg};
        text-align: center;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
    }

    .card-title {
        color: ${theme.colors.primary};
        font-size: ${theme.typography.fontSize['2xl']};
        font-weight: ${theme.typography.fontWeight.bold};
        margin: 0;
        background: ${theme.colors.gradients.medical};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        transition: all ${theme.transitions.fast};
    }

    &:hover .card-title {
        transform: scale(1.05);
    }
`;

export const ServiceCard = styled(StyledCard)`
    .card-title {
        color: ${theme.colors.text.primary};
    }
`;

export const DoctorCard = styled(StyledCard)`
    .card-img-top {
        border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
    }
`;

export const StyledButton = styled(Button)`
    background: ${theme.colors.gradients.medical};
    border: none;
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    font-weight: ${theme.typography.fontWeight.bold};
    transition: all ${theme.transitions.fast};
    box-shadow: ${theme.shadows.primary};
    color: ${theme.colors.white};
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: ${theme.typography.fontSize.sm};

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
        transform: translateY(-3px) scale(1.05);
        box-shadow: ${theme.shadows.glow};
        color: ${theme.colors.white};

        &::before {
            width: 400px;
            height: 400px;
        }
    }

    &:active {
        transform: translateY(-1px) scale(1.02);
    }

    &:focus {
        box-shadow: ${theme.shadows.glow};
    }
`;

export const SuccessButton = styled(StyledButton)`
    background: ${theme.colors.gradients.success};

    &:hover {
        background: ${theme.colors.gradients.success};
        box-shadow: ${theme.shadows.secondary};
    }
`;

export const StyledAlert = styled(Alert)`
    border-radius: ${theme.borderRadius.lg};
    border: none;
    padding: ${theme.spacing.lg};
    margin-top: ${theme.spacing.xl};
`;

export const InfoSection = styled.div`
    background: linear-gradient(135deg, ${theme.colors.background.secondary} 0%, ${theme.colors.background.primary} 100%);
    padding: ${theme.spacing['3xl']} 0;
    margin: ${theme.spacing['3xl']} 0;
    border-radius: ${theme.borderRadius.xl};
    box-shadow: ${theme.shadows.lg};
`;

export const InfoContent = styled.div`
    h3 {
        font-size: ${theme.typography.fontSize['2xl']};
        font-weight: ${theme.typography.fontWeight.bold};
        color: ${theme.colors.text.primary};
        margin-bottom: ${theme.spacing.lg};
    }

    p {
        font-size: ${theme.typography.fontSize.base};
        color: ${theme.colors.text.secondary};
        line-height: ${theme.typography.lineHeight.relaxed};
        margin-bottom: ${theme.spacing.lg};
    }

    ul {
        list-style: none;
        padding: 0;
        margin-bottom: ${theme.spacing.xl};

        li {
            padding: ${theme.spacing.sm} 0;
            padding-left: ${theme.spacing.xl};
            position: relative;
            color: ${theme.colors.text.secondary};
            font-size: ${theme.typography.fontSize.base};

            &::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: ${theme.colors.secondary};
                font-weight: ${theme.typography.fontWeight.bold};
                font-size: ${theme.typography.fontSize.lg};
            }
        }
    }
`;

export const InfoImage = styled.img`
    width: 100%;
    height: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: ${theme.borderRadius.xl};
    box-shadow: ${theme.shadows.lg};
    transition: transform ${theme.transitions.slow};

    &:hover {
        transform: scale(1.05);
    }
`;

export const PriceTag = styled.span`
    display: inline-block;
    background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.secondaryDark} 100%);
    color: ${theme.colors.white};
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    font-weight: ${theme.typography.fontWeight.bold};
    font-size: ${theme.typography.fontSize.lg};
    margin-top: ${theme.spacing.sm};
`;

export const ShowMoreButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacing.xl};
    padding-top: ${theme.spacing.lg};
`;

export const ShowMoreButton = styled.button`
    background: ${theme.colors.gradients.medical};
    border: none;
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing.md} ${theme.spacing['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    transition: all ${theme.transitions.fast};
    box-shadow: ${theme.shadows.primary};
    color: ${theme.colors.white};
    cursor: pointer;
    font-size: ${theme.typography.fontSize.base};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;

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
        transform: translateY(-3px) scale(1.05);
        box-shadow: ${theme.shadows.glow};
        color: ${theme.colors.white};

        &::before {
            width: 400px;
            height: 400px;
        }
    }

    &:active {
        transform: translateY(-1px) scale(1.02);
    }

    &:focus {
        outline: none;
        box-shadow: ${theme.shadows.glow};
    }
`;
