// src/components/AuthForm.js

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../redux/axios'; // Для запроса /departments

// Импортируем необходимые компоненты из MUI
import {
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Button,
    Typography,
    Alert,
    Box,
} from '@mui/material';

// Импортируем экшены и селекторы из слайсов
import {
    registration as adminRegistration,
    login as adminLogin,
    selectAdminStatus,
    selectAdminError,
} from '../redux/slices/adminSlice';

import {
    registration as doctorRegistration,
    login as doctorLogin,
    selectDoctorStatus,
    selectDoctorError,
} from '../redux/slices/doctorSlice';

import {
    registration as patientRegistration,
    login as patientLogin,
    selectPatientStatus,
    selectPatientError,
} from '../redux/slices/patientSlice';

function AuthForm() {
    const dispatch = useDispatch();

    // Локальное состояние для переключения "Вход / Регистрация"
    const [isRegistration, setIsRegistration] = useState(true);
    // Роль, которую выбрал пользователь
    const [role, setRole] = useState('admin'); // admin | doctor | patient

    // Общие поля для всех
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    // Дополнительные поля для регистрации
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [specialization, setSpecialization] = useState(''); // для Doctor
    const [phoneNumber, setPhoneNumber] = useState('');       // для Patient
    const [address, setAddress] = useState('');               // для Patient
    const [age, setAge] = useState('');                       // для Patient

    // Поле выбора отделения (только для Doctor)
    const [departments, setDepartments] = useState([]);       
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // Фотография для Doctor и Patient
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Селекторы для статуса и ошибок из каждого слайса
    const adminStatus = useSelector(selectAdminStatus);
    const adminError = useSelector(selectAdminError);

    const doctorStatus = useSelector(selectDoctorStatus);
    const doctorError = useSelector(selectDoctorError);

    const patientStatus = useSelector(selectPatientStatus);
    const patientError = useSelector(selectPatientError);

    // Унифицированное отображение статуса и ошибок для текущей роли
    let currentStatus, currentError;
    switch (role) {
        case 'admin':
            currentStatus = adminStatus;
            currentError = adminError;
            break;
        case 'doctor':
            currentStatus = doctorStatus;
            currentError = doctorError;
            break;
        case 'patient':
            currentStatus = patientStatus;
            currentError = patientError;
            break;
        default:
            currentStatus = 'idle';
            currentError = null;
    }

    // При монтировании (или при переключении на роль "doctor") можно загрузить список отделений
    useEffect(() => {
        // Если вы хотите загружать отделения только при выборе "doctor", 
        // можно сделать условие if (role === 'doctor'), но иногда проще грузить один раз всегда.
        const fetchDepartments = async () => {
            try {
                const { data } = await axios.get('/departments'); 
                setDepartments(data);
            } catch (err) {
                console.error('Ошибка при получении списка отделений:', err);
            }
        };

        fetchDepartments();
    }, []);

    // Обработчик отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();

        // Создаем FormData
        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);

        if (isRegistration) {
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);

            if (role === 'doctor') {
                formData.append('specialization', specialization);
                formData.append('departmentId', selectedDepartment); // <-- указываем отделение
            }
            if (role === 'patient') {
                formData.append('age', age);
                formData.append('phoneNumber', phoneNumber);
                formData.append('address', address);
            }
            if (photo) {
                formData.append('photo', photo);
            }
        }

        // В зависимости от выбранной роли и режима (регистрация / авторизация),
        // отправляем данные в соответствующий слайс
        if (isRegistration) {
            if (role === 'admin') {
                // Админ без FormData (пример)
                dispatch(adminRegistration({ login, password }));
            } else if (role === 'doctor') {
                dispatch(doctorRegistration(formData));
            } else if (role === 'patient') {
                dispatch(patientRegistration(formData));
            }
        } else {
            // Авторизация
            if (role === 'admin') {
                dispatch(adminLogin({ login, password }));
            } else if (role === 'doctor') {
                dispatch(doctorLogin({ login, password }));
            } else if (role === 'patient') {
                dispatch(patientLogin({ login, password }));
            }
        }
    };

    // Обработчик изменения файла
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            // Создаём превью для выбранного изображения
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Условная отрисовка дополнительных полей
    const renderExtraFields = () => {
        // Если не регистрация — никаких дополнительных полей не показываем
        if (!isRegistration) return null;

        return (
            <>
                {/* Поля имя/фамилия — общие для doctor/patient, 
                    но можно также для admin, если нужно */}
                <TextField
                    label="Имя"
                    variant="outlined"
                    fullWidth
                    className="mb-3"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <TextField
                    label="Фамилия"
                    variant="outlined"
                    fullWidth
                    className="mb-3"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />

                {/* Блок дополнительных полей для Doctor */}
                {role === 'doctor' && (
                    <>
                        <TextField
                            label="Специализация"
                            variant="outlined"
                            fullWidth
                            className="mb-3"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            required
                        />

                        {/* Выбор отделения */}
                        <FormControl variant="outlined" fullWidth className="mb-3">
                            <InputLabel id="department-select-label">Отделение</InputLabel>
                            <Select
                                labelId="department-select-label"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                label="Отделение"
                                required
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            component="label"
                            className="mb-3"
                        >
                            Загрузить Фото
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </Button>
                        {photoPreview && (
                            <Box
                                component="img"
                                src={photoPreview}
                                alt="Preview"
                                sx={{
                                    width: 200,
                                    height: 200,
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    mb: 3,
                                }}
                            />
                        )}
                    </>
                )}

                {/* Блок дополнительных полей для Patient */}
                {role === 'patient' && (
                    <>
                        <TextField
                            label="Возраст"
                            type="number"
                            variant="outlined"
                            fullWidth
                            className="mb-3"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                        <TextField
                            label="Номер телефона"
                            variant="outlined"
                            fullWidth
                            className="mb-3"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <TextField
                            label="Адрес"
                            variant="outlined"
                            fullWidth
                            className="mb-3"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            component="label"
                            className="mb-3"
                        >
                            Загрузить Фото
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </Button>
                        {photoPreview && (
                            <Box
                                component="img"
                                src={photoPreview}
                                alt="Preview"
                                sx={{
                                    width: 200,
                                    height: 200,
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    mb: 3,
                                }}
                            />
                        )}
                    </>
                )}
            </>
        );
    };

    return (
        <Box className="container mt-5">
            <Typography variant="h4" component="h1" gutterBottom>
                {isRegistration ? 'Регистрация' : 'Вход'}
            </Typography>

            <Box className="d-flex mb-3">
                <Button
                    variant={isRegistration ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setIsRegistration(true)}
                    className="me-2"
                >
                    Регистрация
                </Button>
                <Button
                    variant={!isRegistration ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setIsRegistration(false)}
                >
                    Вход
                </Button>
            </Box>

            <FormControl fullWidth className="mb-3">
                <InputLabel id="role-select-label">Роль</InputLabel>
                <Select
                    labelId="role-select-label"
                    value={role}
                    label="Роль"
                    onChange={(e) => setRole(e.target.value)}
                >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="patient">Patient</MenuItem>
                </Select>
            </FormControl>

            <form onSubmit={handleSubmit}>
                <TextField
                    label="Логин"
                    variant="outlined"
                    fullWidth
                    className="mb-3"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                />
                <TextField
                    label="Пароль"
                    type="password"
                    variant="outlined"
                    fullWidth
                    className="mb-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {renderExtraFields()}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={currentStatus === 'loading'}
                    className="mt-3"
                >
                    {currentStatus === 'loading'
                        ? 'Загрузка...'
                        : isRegistration
                            ? 'Зарегистрироваться'
                            : 'Войти'}
                </Button>

                {currentError && (
                    <Alert severity="error" className="mt-3">
                        {currentError}
                    </Alert>
                )}
            </form>
        </Box>
    );
}

export default AuthForm;
