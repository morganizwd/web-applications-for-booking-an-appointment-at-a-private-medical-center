import React from 'react';
import {
    StyledFooter,
    StyledContainer,
    StyledRow,
    StyledCol,
    CopyrightText,
} from './Footer.styled';

const Footer = () => {
    return (
        <StyledFooter>
            <StyledContainer>
                <StyledRow>
                    <StyledCol md={4}>
                        <h5>Контактная информация</h5>
                        <p>Телефон: +375 (222) 123-45-67</p>
                        <p>Email: <a href="mailto:info@medclinic.by">info@medclinic.by</a></p>
                        <p>WhatsApp: +375 (222) 765-43-21</p>
                    </StyledCol>
                    
                    <StyledCol md={4}>
                        <h5>Адрес Клиники</h5>
                        <p>Могилев, ул. Здоровья, д. 15, офис 101</p>
                        <p>Пн-Пт: 8:00 - 20:00</p>
                        <p>Сб-Вс: Выходной</p>
                    </StyledCol>
                    
                    <StyledCol md={4}>
                        <h5>О нас</h5>
                        <p>
                            Медицинская клиника "Здоровье" предоставляет широкий спектр медицинских услуг с использованием современных технологий и высококвалифицированных специалистов. Мы стремимся обеспечить индивидуальный подход к каждому пациенту.
                        </p>
                    </StyledCol>
                </StyledRow>
                <StyledRow>
                    <StyledCol>
                        <CopyrightText>
                            © {new Date().getFullYear()} Медицинская Клиника "Здоровье". Все права защищены.
                        </CopyrightText>
                    </StyledCol>
                </StyledRow>
            </StyledContainer>
        </StyledFooter>
    );
};

export default Footer;
