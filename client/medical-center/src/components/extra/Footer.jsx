import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-light py-4 mt-5">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>Контактная информация</h5>
                        <p>Телефон: +7 (495) 123-45-67</p>
                        <p>Email: info@medclinic.ru</p>
                        <p>WhatsApp: +7 (495) 765-43-21</p>
                    </Col>
                    
                    <Col md={4}>
                        <h5>Адрес Клиники</h5>
                        <p>Москва, ул. Здоровья, д. 15, офис 101</p>
                        <p>Пн-Пт: 8:00 - 20:00</p>
                        <p>Сб-Вс: Выходной</p>
                    </Col>
                    
                    {/* О Нас */}
                    <Col md={4}>
                        <h5>О нас</h5>
                        <p>
                            Медицинская клиника "Здоровье" предоставляет широкий спектр медицинских услуг с использованием современных технологий и высококвалифицированных специалистов. Мы стремимся обеспечить индивидуальный подход к каждому пациенту.
                        </p>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col className="text-center text-muted">
                        © {new Date().getFullYear()} Медицинская Клиника "Здоровье". Все права защищены.
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
