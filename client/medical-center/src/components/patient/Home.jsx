import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Alert, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../../redux/axios';
import {
    StyledContainer,
    LoadingContainer,
    StyledCarousel,
    SectionContainer,
    SectionTitle,
    StyledRow,
    StyledCol,
    DepartmentCard,
    ServiceCard,
    DoctorCard,
    StyledButton,
    SuccessButton,
    StyledAlert,
    InfoSection,
    InfoContent,
    InfoImage,
    PriceTag,
    ShowMoreButtonContainer,
    ShowMoreButton,
} from './Home.styled'; 

// Массив стоковых изображений для отделений (Unsplash)
const departmentImages = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80', // Кардиология
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80', // Неврология
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80', // Терапия
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80', // Хирургия
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', // Педиатрия
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80', // Гинекология
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', // Офтальмология
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80', // Стоматология
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80', // Дерматология
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80', // Ортопедия
];

function Home() {
    const [departments, setDepartments] = useState([]);
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Состояния для управления отображением карточек
    const [showAllDepartments, setShowAllDepartments] = useState(false);
    const [showAllServices, setShowAllServices] = useState(false);
    const [showAllDoctors, setShowAllDoctors] = useState(false);
    
    const ITEMS_TO_SHOW = 6;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, servRes, docRes] = await Promise.all([
                    axios.get('/departments'),
                    axios.get('/services'),
                    axios.get('/doctors')
                ]);

                setDepartments(deptRes.data);
                setServices(servRes.data);
                setDoctors(docRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке данных на главной странице:', err);
                setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <LoadingContainer>
                <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </LoadingContainer>
        );
    }

    if (error) {
        return (
            <StyledContainer>
                <StyledAlert variant="danger">{error}</StyledAlert>
            </StyledContainer>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <StyledCarousel>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src="/images/louis-reed-pwcKF7L4-no-unsplash.jpg"
                        alt="Добро пожаловать в Нашу Медицинскую Клинику"
                    />
                    <Carousel.Caption>
                        <h3>Добро пожаловать в Нашу Медицинскую Клинику</h3>
                        <p>Ваше здоровье — наш приоритет.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src="/images/piron-guillaume-U4FyCp3-KzY-unsplash.jpg"
                        alt="Профессиональные Врачи"
                    />
                    <Carousel.Caption>
                        <h3>Профессиональные Врачи</h3>
                        <p>Наши специалисты всегда готовы помочь вам.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src="/images/lucas-vasques-9vnACvX2748-unsplash.jpg"
                        alt="Современное Оборудование"
                    />
                    <Carousel.Caption>
                        <h3>Современное Оборудование</h3>
                        <p>Мы используем только самое передовое оборудование.</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </StyledCarousel>

            {/* Departments Section */}
            <SectionContainer>
                <StyledContainer>
                    <SectionTitle>Наши Отделения</SectionTitle>
                    <StyledRow>
                        {(showAllDepartments ? departments : departments.slice(0, ITEMS_TO_SHOW)).map((dept, index) => (
                            <StyledCol key={dept.id} md={4}>
                                <DepartmentCard as={Link} to={`/services?departmentId=${dept.id}`}>
                                    {dept.photo ? (
                                        <img
                                            className="card-img-top"
                                            src={`${axios.defaults.baseURL}${dept.photo}?t=${Date.now()}`}
                                            alt={dept.name}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <img
                                            className="card-img-top"
                                            src={departmentImages[index % departmentImages.length]}
                                            alt={dept.name}
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="card-body">
                                        <h3 className="card-title">{dept.name}</h3>
                                    </div>
                                </DepartmentCard>
                            </StyledCol>
                        ))}
                    </StyledRow>
                    {departments.length > ITEMS_TO_SHOW && (
                        <ShowMoreButtonContainer>
                            <ShowMoreButton onClick={() => setShowAllDepartments(!showAllDepartments)}>
                                {showAllDepartments ? 'Скрыть' : 'Смотреть больше'}
                            </ShowMoreButton>
                        </ShowMoreButtonContainer>
                    )}
                </StyledContainer>
            </SectionContainer>

            {/* Services Section */}
            <SectionContainer>
                <StyledContainer>
                    <SectionTitle>Наши Услуги</SectionTitle>
                    <StyledRow>
                        {(showAllServices ? services : services.slice(0, ITEMS_TO_SHOW)).map((service) => (
                            <StyledCol key={service.id} md={4}>
                                <ServiceCard>
                                    {service.photo ? (
                                        <img
                                            className="card-img-top"
                                            src={`${axios.defaults.baseURL}${service.photo}?t=${Date.now()}`}
                                            alt={service.name}
                                        />
                                    ) : (
                                        <img
                                            className="card-img-top"
                                            src="/images/premium_photo-1673953509986-9b2bfe934ae5.png"
                                            alt={service.name}
                                        />
                                    )}
                                    <div className="card-body">
                                        <h4 className="card-title">{service.name}</h4>
                                        <PriceTag>{service.price} руб.</PriceTag>
                                    </div>
                                </ServiceCard>
                            </StyledCol>
                        ))}
                    </StyledRow>
                    {services.length > ITEMS_TO_SHOW && (
                        <ShowMoreButtonContainer>
                            <ShowMoreButton onClick={() => setShowAllServices(!showAllServices)}>
                                {showAllServices ? 'Скрыть' : 'Смотреть больше'}
                            </ShowMoreButton>
                        </ShowMoreButtonContainer>
                    )}
                </StyledContainer>
            </SectionContainer>

            {/* Doctors Section */}
            <SectionContainer>
                <StyledContainer>
                    <SectionTitle>Наши Врачи</SectionTitle>
                    <StyledRow>
                        {(showAllDoctors ? doctors : doctors.slice(0, ITEMS_TO_SHOW)).map((doctor) => (
                            <StyledCol key={doctor.id} md={4}>
                                <DoctorCard>
                                    {doctor.photo ? (
                                        <img
                                            className="card-img-top"
                                            src={`${axios.defaults.baseURL}${doctor.photo}?t=${Date.now()}`}
                                            alt={`${doctor.firstName} ${doctor.lastName}`}
                                        />
                                    ) : (
                                        <img
                                            className="card-img-top"
                                            src="/images/premium_photo-1673953509986-9b2bfe934ae5.png"
                                            alt={`${doctor.firstName} ${doctor.lastName}`}
                                        />
                                    )}
                                    <div className="card-body">
                                        <h4 className="card-title">{doctor.firstName} {doctor.lastName}</h4>
                                        <h6 className="card-subtitle">{doctor.specialization}</h6>
                                        <p className="card-text">
                                            Отделение: {doctor.Department ? doctor.Department.name : 'Не указано'}
                                        </p>
                                        <StyledButton as="a" href={`/doctors/${doctor.id}`} className="mt-auto">
                                            Подробнее
                                        </StyledButton>
                                    </div>
                                </DoctorCard>
                            </StyledCol>
                        ))}
                    </StyledRow>
                    {doctors.length > ITEMS_TO_SHOW && (
                        <ShowMoreButtonContainer>
                            <ShowMoreButton onClick={() => setShowAllDoctors(!showAllDoctors)}>
                                {showAllDoctors ? 'Скрыть' : 'Смотреть больше'}
                            </ShowMoreButton>
                        </ShowMoreButtonContainer>
                    )}
                </StyledContainer>
            </SectionContainer>

            {/* Informative Section */}
            <InfoSection>
                <StyledContainer>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <InfoContent>
                                <h3>Почему выбирают нас?</h3>
                                <p>
                                    Наша клиника предоставляет широкий спектр медицинских услуг на основе современных технологий и инноваций. Мы стремимся обеспечить высокий уровень обслуживания и индивидуальный подход к каждому пациенту.
                                </p>
                                <ul>
                                    <li>Опытные специалисты</li>
                                    <li>Современное оборудование</li>
                                    <li>Комфортные условия</li>
                                    <li>Доступные цены</li>
                                    <li>Дружелюбный персонал</li>
                                </ul>
                                <SuccessButton as="a" href="/consultant">
                                    Задать вопрос консультанту
                                </SuccessButton>
                            </InfoContent>
                        </Col>
                        <Col md={6}>
                            <InfoImage
                                src="/images/premium_photo-1673953509986-9b2bfe934ae5.png"
                                alt="Почему выбирают нас"
                            />
                        </Col>
                    </Row>
                </StyledContainer>
            </InfoSection>
        </div>
    );
};

export default Home;
