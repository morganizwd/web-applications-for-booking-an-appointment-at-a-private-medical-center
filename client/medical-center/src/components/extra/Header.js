import React from 'react';
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';


import {
    logout as adminLogout,
    selectIsAuth as selectIsAuthAdmin,
} from '../../redux/slices/adminSlice';

import {
    logout as doctorLogout,
    selectIsAuth as selectIsAuthDoctor,
} from '../../redux/slices/doctorSlice';

import {
    logout as patientLogout,
    selectIsAuth as selectIsAuthPatient,
} from '../../redux/slices/patientSlice';

function Header() {
    const dispatch = useDispatch();


    const isAdminAuth = useSelector(selectIsAuthAdmin);
    const isDoctorAuth = useSelector(selectIsAuthDoctor);
    const isPatientAuth = useSelector(selectIsAuthPatient);

    console.log('Header isAdminAuth:', isAdminAuth);
    console.log('Header isDoctorAuth:', isDoctorAuth);
    console.log('Header isPatientAuth:', isPatientAuth);


    const isAuth = isAdminAuth || isDoctorAuth || isPatientAuth;

    const handleLogout = () => {
        if (isAdminAuth) {
            dispatch(adminLogout());
        }
        if (isDoctorAuth) {
            dispatch(doctorLogout());
        }
        if (isPatientAuth) {
            dispatch(patientLogout());
        }
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    WebClinic'a
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="header-navbar-nav" />
                <Navbar.Collapse id="header-navbar-nav">
                    <Nav className="ms-auto">
                        {!isAuth && (
                            <Nav.Link as={Link} to="/auth">
                                Авторизация
                            </Nav.Link>
                        )}

                        {isAuth && (
                            <>
                                {/* Admin Dropdown */}
                                {isAdminAuth && (
                                    <NavDropdown title="Админ" id="admin-nav-dropdown">
                                        <NavDropdown.Item as={Link} to="/departments">
                                            Управление Отделениями
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/services">
                                            Управление Услугами
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin-schedule">
                                            Управление расписанием
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin-appointments">
                                            Управление записями
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin-users">
                                            Пользователи
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                )}

                                {/* Doctor Link */}
                                {isDoctorAuth && (
                                    <Nav.Link as={Link} to="/doctor-dashboard">
                                        Панель Доктора
                                    </Nav.Link>
                                )}

                                {/* Patient Links */}
                                {isPatientAuth && (
                                    <>
                                        <Nav.Link as={Link} to="/profile">
                                            Панель Пациента
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/">
                                            Главная
                                        </Nav.Link>
                                    </>
                                )}

                                {/* Logout Button */}
                                <Button variant="outline-danger" onClick={handleLogout} className="ms-2">
                                    Выйти
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
