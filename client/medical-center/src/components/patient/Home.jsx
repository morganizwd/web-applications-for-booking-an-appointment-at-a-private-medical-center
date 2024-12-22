// src/components/Home.jsx

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Carousel, Button } from 'react-bootstrap';
import axios from '../../redux/axios'; // Убедитесь, что axios настроен правильно

function Home() {
    const [departments, setDepartments] = useState([]);
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <Carousel>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src="/images/louis-reed-pwcKF7L4-no-unsplash.jpg"
                        alt="Первый слайд"
                        style={{ objectFit: 'fill', height: '400px', width: '400px' }}
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
                        alt="Второй слайд"
                        style={{ objectFit: 'cover', height: '400px' }}
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
                        alt="Третий слайд"
                        style={{ objectFit: 'cover', height: '400px' }}
                    />

                    <Carousel.Caption>
                        <h3>Современное Оборудование</h3>
                        <p>Мы используем только самое передовое оборудование.</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>

            {/* Departments Section */}
            <Container className="mt-5">
                <h2 className="mb-4 text-center">Наши Отделения</h2>
                <Row>
                    {departments.map((dept) => (
                        <Col key={dept.id} md={4} className="mb-4">
                            <Card className="h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{dept.name}</Card.Title>

                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Services Section */}
            <Container className="mt-5">
                <h2 className="mb-4 text-center">Наши Услуги</h2>
                <Row>
                    {services.map((service) => (
                        <Col key={service.id} md={4} className="mb-4">
                            <Card className="h-100">
                                {service.photo ? (
                                    <Card.Img
                                        variant="top"
                                        src={`${axios.defaults.baseURL}${service.photo}`}
                                        alt={service.name}
                                        style={{ objectFit: 'cover', height: '200px' }}
                                    />
                                ) : (
                                    <Card.Img
                                        variant="top"
                                        src="/images/premium_photo-1673953509986-9b2bfe934ae5.png"
                                        alt={service.name}
                                        style={{ objectFit: 'cover', height: '200px' }}
                                    />
                                )}
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{service.name}</Card.Title>
                                    <Card.Text>
                                        Цена: {service.price} руб. <br />
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Doctors Section */}
            <Container className="mt-5 mb-5">
                <h2 className="mb-4 text-center">Наши Врачи</h2>
                <Row>
                    {doctors.map((doctor) => (
                        <Col key={doctor.id} md={4} className="mb-4">
                            <Card className="h-100">
                                {doctor.photo ? (
                                    <Card.Img
                                        variant="top"
                                        src={`${axios.defaults.baseURL}${doctor.photo}`}
                                        alt={`${doctor.firstName} ${doctor.lastName}`}
                                        style={{ objectFit: 'cover', height: '200px' }}
                                    />
                                ) : (
                                    <Card.Img
                                        variant="top"
                                        src="/images/premium_photo-1673953509986-9b2bfe934ae5.png"
                                        alt={`${doctor.firstName} ${doctor.lastName}`}
                                        style={{ objectFit: 'cover', height: '200px' }}
                                    />
                                )}
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{doctor.firstName} {doctor.lastName}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{doctor.specialization}</Card.Subtitle>
                                    <Card.Text>
                                        Отделение: {doctor.Department ? doctor.Department.name : 'Не указано'}
                                        <br />
    
                                    </Card.Text>
                                    <Button variant="primary" href={`/doctors/${doctor.id}`} className="mt-auto">
                                        Подробнее
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Informative Section */}
            <Container className="mb-5">
                <Row className="align-items-center">
                    <Col md={6}>
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
                        <Button variant="success" href="/about">Узнать больше</Button>
                    </Col>
                    <Col md={6}>
                        <img
                            src="/images/premium_photo-1673953509986-9b2bfe934ae5.png"
                            alt="Почему выбирают нас"
                            className="img-fluid rounded"
                            style={{ maxHeight: '400px', objectFit: 'cover' }}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Home;
