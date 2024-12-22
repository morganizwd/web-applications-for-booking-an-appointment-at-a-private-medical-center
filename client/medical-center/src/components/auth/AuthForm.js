import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
