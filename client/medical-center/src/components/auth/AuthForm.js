import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../redux/axios'; 

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

import {
    registration as adminRegistration,
    login as adminLogin,
    selectAdminStatus,
    selectAdminError,
} from '../../redux/slices/adminSlice';

import {
    registration as doctorRegistration,
    login as doctorLogin,
    selectDoctorStatus,
    selectDoctorError,
} from '../../redux/slices/doctorSlice';

import {
    registration as patientRegistration,
    login as patientLogin,
    selectPatientStatus,
    selectPatientError,
} from '../../redux/slices/patientSlice';

function AuthForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isRegistration, setIsRegistration] = useState(true);
    const [role, setRole] = useState('admin'); 

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [specialization, setSpecialization] = useState(''); 
    const [phoneNumber, setPhoneNumber] = useState('');       
    const [address, setAddress] = useState('');               
    const [age, setAge] = useState('');                       

    const [departments, setDepartments] = useState([]);       
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const adminStatus = useSelector(selectAdminStatus);
    const adminError = useSelector(selectAdminError);

    const doctorStatus = useSelector(selectDoctorStatus);
    const doctorError = useSelector(selectDoctorError);

    const patientStatus = useSelector(selectPatientStatus);
    const patientError = useSelector(selectPatientError);

    const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

    useEffect(() => {
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

    useEffect(() => {
        if (isRegistration && currentStatus === 'succeeded') {
            setRegistrationSuccess(true); 

            const timer = setTimeout(() => {
                setRegistrationSuccess(false);
                setIsRegistration(false);

                setLogin('');
                setPassword('');
                setFirstName('');
                setLastName('');
                setSpecialization('');
                setPhoneNumber('');
                setAddress('');
                setAge('');
                setPhoto(null);
                setPhotoPreview(null);
                setSelectedDepartment('');
            }, 1500); 

            return () => clearTimeout(timer); 
        }
    }, [currentStatus, isRegistration]);

    useEffect(() => {
        if (!isRegistration && currentStatus === 'succeeded' && !currentError) {
            
            const token = localStorage.getItem('token');
            const savedRole = localStorage.getItem('role');
            
            console.log('Login successful, token:', token, 'role:', savedRole);
            
            if (token && savedRole) {
                
                const timer = setTimeout(() => {
                    console.log('Navigating to dashboard for role:', savedRole);
                    switch (savedRole) {
                        case 'admin':
                            navigate('/admin-users', { replace: true });
                            break;
                        case 'doctor':
                            navigate('/doctor-dashboard', { replace: true });
                            break;
                        case 'patient':
                            navigate('/profile', { replace: true });
                            break;
                        default:
                            navigate('/', { replace: true });
                    }
                }, 300);

                return () => clearTimeout(timer);
            } else {
                console.warn('Token or role not found after login');
            }
        }
    }, [currentStatus, isRegistration, currentError, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);

        if (isRegistration) {
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);

            if (role === 'doctor') {
                formData.append('specialization', specialization);
                formData.append('departmentId', selectedDepartment); 
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

        if (isRegistration) {
            if (role === 'admin') {
                dispatch(adminRegistration({ login, password }));
            } else if (role === 'doctor') {
                dispatch(doctorRegistration(formData));
            } else if (role === 'patient') {
                dispatch(patientRegistration(formData));
            }
        } else {
            if (role === 'admin') {
                dispatch(adminLogin({ login, password }));
            } else if (role === 'doctor') {
                dispatch(doctorLogin({ login, password }));
            } else if (role === 'patient') {
                dispatch(patientLogin({ login, password }));
            }
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const renderExtraFields = () => {
        if (!isRegistration) return null;

        return (
            <>
                {}
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

                {}
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
                    </>
                )}

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
                    </>
                )}
            </>

        );
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
            <Typography variant="h4" gutterBottom align="center">
                {isRegistration ? 'Регистрация' : 'Вход'}
            </Typography>

            {registrationSuccess && (
                <Alert severity="success" className="mb-3">
                    Регистрация прошла успешно! Переход на форму входа...
                </Alert>
            )}

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
