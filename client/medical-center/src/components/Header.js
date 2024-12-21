// src/components/Header.js

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Импортируем селекторы:
import {
    logout as adminLogout,
    selectIsAuth as selectIsAuthAdmin,
} from '../redux/slices/adminSlice';

import {
    logout as doctorLogout,
    selectIsAuth as selectIsAuthDoctor,
} from '../redux/slices/doctorSlice';

import {
    logout as patientLogout,
    selectIsAuth as selectIsAuthPatient, // Переименование селектора
} from '../redux/slices/patientSlice';

function Header() {
    const dispatch = useDispatch();

    // Админ авторизован?
    const isAdminAuth = useSelector(selectIsAuthAdmin);
    // Доктор авторизован?
    const isDoctorAuth = useSelector(selectIsAuthDoctor);
    // Пациент авторизован?
    const isPatientAuth = useSelector(selectIsAuthPatient);

    console.log('Header isAdminAuth:', isAdminAuth);
    console.log('Header isDoctorAuth:', isDoctorAuth);
    console.log('Header isPatientAuth:', isPatientAuth);

    // Если любой из них залогинен — считаем, что есть авторизация
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
        // Опционально, можно перезагрузить страницу
        // window.location.reload();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Медицинское Приложение
                </Typography>

                <Box>
                    <Button color="inherit" component={Link} to="/">
                        Главная
                    </Button>

                    {/* Если не авторизован никто, показываем "Авторизация" */}
                    {!isAuth && (
                        <Button color="inherit" component={Link} to="/auth">
                            Авторизация
                        </Button>
                    )}

                    {/* Если авторизован, показываем... */}
                    {isAuth && (
                        <>
                            {/* Показывать определённые кнопки в зависимости от роли */}
                            {isAdminAuth && (
                                <>
                                    <Button color="inherit" component={Link} to="/departments">
                                        Управление Отделениями
                                    </Button>
                                    <Button color="inherit" component={Link} to="/services">
                                        Управление Услугами
                                    </Button>
                                </>
                            )}

                            {isDoctorAuth && (
                                <>
                                    <Button color="inherit" component={Link} to="/doctor-dashboard">
                                        Панель Доктора
                                    </Button>
                                </>
                            )}

                            {isPatientAuth && (
                                <>
                                    <Button color="inherit" component={Link} to="/patient-dashboard">
                                        Панель Пациента
                                    </Button>
                                </>
                            )}

                            <Button color="inherit" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
