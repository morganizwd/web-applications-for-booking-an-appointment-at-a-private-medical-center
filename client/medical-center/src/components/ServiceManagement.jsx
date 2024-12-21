// src/components/ServiceManagement.jsx

import React, { useEffect, useState } from 'react';
import axios from '../redux/axios'; // Убедитесь, что путь правильный

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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Box,
} from '@mui/material';

// Иконки MUI
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function ServiceManagement() {
    // Состояние для списка услуг
    const [services, setServices] = useState([]);
    // Состояния для создания новой услуги
    const [newServiceName, setNewServiceName] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');
    const [newServiceDepartment, setNewServiceDepartment] = useState('');
    const [newServicePhoto, setNewServicePhoto] = useState(null);
    const [newServicePhotoPreview, setNewServicePhotoPreview] = useState(null);
    // Состояния для редактирования услуги
    const [editServiceId, setEditServiceId] = useState(null);
    const [editServiceName, setEditServiceName] = useState('');
    const [editServicePrice, setEditServicePrice] = useState('');
    const [editServiceDepartment, setEditServiceDepartment] = useState('');
    const [editServicePhoto, setEditServicePhoto] = useState(null);
    const [editServicePhotoPreview, setEditServicePhotoPreview] = useState(null);
    // Состояние для удаления услуги
    const [deleteServiceId, setDeleteServiceId] = useState(null);
    // Состояние загрузки
    const [loading, setLoading] = useState(false);
    // Состояние ошибок и успехов
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Состояния для диалогов
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Список отделений для выпадающего списка
    const [departments, setDepartmentsList] = useState([]);

    // Функция для получения списка отделений
    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/departments');
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении отделений:', error);
            return [];
        }
    };

    // Функция для получения всех услуг
    const fetchServices = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/services');
            setServices(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Не удалось получить список услуг'
            );
        } finally {
            setLoading(false);
        }
    };

    // Получение отделений и услуг при монтировании компонента
    useEffect(() => {
        const initialize = async () => {
            const departmentsData = await fetchDepartments();
            setDepartmentsList(departmentsData);
            await fetchServices();
        };
        initialize();
    }, []);

    // Обработчик создания новой услуги
    const handleCreateService = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Валидация
        if (!newServiceName.trim() || !newServicePrice || !newServiceDepartment) {
            setError('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        // Создание FormData
        const formData = new FormData();
        formData.append('name', newServiceName.trim());
        formData.append('price', parseFloat(newServicePrice));
        formData.append('departmentId', newServiceDepartment); // Корректно устанавливаем departmentId
        if (newServicePhoto) {
            formData.append('photo', newServicePhoto);
        }

        // Логирование отправляемых данных
        console.log('Отправляемые данные для создания услуги:', {
            name: newServiceName.trim(),
            price: parseFloat(newServicePrice),
            departmentId: newServiceDepartment,
            photo: newServicePhoto,
        });

        setLoading(true);
        try {
            const response = await axios.post('/services/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Услуга успешно создана.');
            // Сброс полей формы
            setNewServiceName('');
            setNewServicePrice('');
            setNewServiceDepartment('');
            setNewServicePhoto(null);
            setNewServicePhotoPreview(null);
            // Обновление списка услуг
            fetchServices();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Не удалось создать услугу.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Обработчик изменения фото для создания
    const handleNewServicePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewServicePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewServicePhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Обработчик открытия диалога редактирования
    const handleOpenEditDialog = (service) => {
        setEditServiceId(service.id);
        setEditServiceName(service.name);
        setEditServicePrice(service.price);
        setEditServiceDepartment(service.Department.id);
        setEditServicePhoto(null);
        setEditServicePhotoPreview(service.photo ? `${axios.defaults.baseURL}${service.photo}` : null);
        setOpenEditDialog(true);
    };

    // Обработчик закрытия диалога редактирования
    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditServiceId(null);
        setEditServiceName('');
        setEditServicePrice('');
        setEditServiceDepartment('');
        setEditServicePhoto(null);
        setEditServicePhotoPreview(null);
    };

    // Обработчик обновления услуги
    const handleUpdateService = async () => {
        setError('');
        setSuccess('');

        // Валидация
        if (!editServiceName.trim() || !editServicePrice || !editServiceDepartment) {
            setError('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        // Создание FormData
        const formData = new FormData();
        formData.append('name', editServiceName.trim());
        formData.append('price', parseFloat(editServicePrice));
        formData.append('departmentId', editServiceDepartment);
        if (editServicePhoto) {
            formData.append('photo', editServicePhoto);
        }

        setLoading(true);
        try {
            const response = await axios.put(`/services/${editServiceId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Услуга успешно обновлена.');
            handleCloseEditDialog();
            // Обновление списка услуг
            fetchServices();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Не удалось обновить услугу.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Обработчик изменения фото для редактирования
    const handleEditServicePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditServicePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditServicePhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Обработчик открытия диалога удаления
    const handleOpenDeleteDialog = (serviceId) => {
        setDeleteServiceId(serviceId);
        setOpenDeleteDialog(true);
    };

    // Обработчик закрытия диалога удаления
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteServiceId(null);
    };

    // Обработчик удаления услуги
    const handleDeleteService = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await axios.delete(`/services/${deleteServiceId}`);
            setSuccess('Услуга успешно удалена.');
            handleCloseDeleteDialog();
            // Обновление списка услуг
            fetchServices();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Не удалось удалить услугу.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <Typography variant="h4" gutterBottom>
                Управление Услугами
            </Typography>

            {/* Отображение ошибок и успехов */}
            {error && <Alert severity="error" className="mb-3">{error}</Alert>}
            {success && <Alert severity="success" className="mb-3">{success}</Alert>}

            {/* Форма создания новой услуги */}
            <form onSubmit={handleCreateService} className="mb-5">
                <Typography variant="h6" gutterBottom>
                    Создать Новую Услугу
                </Typography>
                <div className="d-flex flex-column">
                    <TextField
                        label="Название Услуги"
                        variant="outlined"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        required
                        fullWidth
                        className="mb-3"
                    />
                    <TextField
                        label="Цена"
                        type="number"
                        variant="outlined"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        required
                        fullWidth
                        className="mb-3"
                        inputProps={{ step: '0.01' }}
                    />
                    <FormControl variant="outlined" fullWidth className="mb-3">
                        <InputLabel id="department-select-label">Отделение</InputLabel>
                        <Select
                            labelId="department-select-label"
                            value={newServiceDepartment}
                            onChange={(e) => setNewServiceDepartment(e.target.value)}
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
                            onChange={handleNewServicePhotoChange}
                        />
                    </Button>
                    {newServicePhotoPreview && (
                        <Box
                            component="img"
                            src={newServicePhotoPreview}
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
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        className="mt-2"
                    >
                        {loading ? <CircularProgress size={24} /> : 'Создать Услугу'}
                    </Button>
                </div>
            </form>

            {/* Таблица со списком услуг */}
            <Typography variant="h6" gutterBottom>
                Список Услуг
            </Typography>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <CircularProgress />
                </div>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="services table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Название Услуги</TableCell>
                                <TableCell>Цена</TableCell>
                                <TableCell>Отделение</TableCell>
                                <TableCell>Фото</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell>{service.id}</TableCell>
                                        <TableCell>{service.name}</TableCell>
                                        <TableCell>{service.price.toFixed(2)} ₽</TableCell>
                                        <TableCell>{service.Department.name}</TableCell>
                                        <TableCell>
                                            {service.photo ? (
                                                <Box
                                                    component="img"
                                                    src={`${axios.defaults.baseURL}${service.photo}`}
                                                    alt={service.name}
                                                    sx={{
                                                        width: 100,
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                            ) : (
                                                'Нет Фото'
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditDialog(service)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteDialog(service.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Нет услуг для отображения.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Диалог редактирования услуги */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>Редактировать Услугу</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Измените данные услуги ниже и нажмите "Сохранить".
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название Услуги"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editServiceName}
                        onChange={(e) => setEditServiceName(e.target.value)}
                        required
                        className="mb-3"
                    />
                    <TextField
                        margin="dense"
                        label="Цена"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editServicePrice}
                        onChange={(e) => setEditServicePrice(e.target.value)}
                        required
                        className="mb-3"
                        inputProps={{ step: '0.01' }}
                    />
                    <FormControl variant="outlined" fullWidth className="mb-3">
                        <InputLabel id="edit-department-select-label">Отделение</InputLabel>
                        <Select
                            labelId="edit-department-select-label"
                            value={editServiceDepartment}
                            onChange={(e) => setEditServiceDepartment(e.target.value)}
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
                        Загрузить Новое Фото
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleEditServicePhotoChange}
                        />
                    </Button>
                    {editServicePhotoPreview && (
                        <Box
                            component="img"
                            src={editServicePhotoPreview}
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Отмена</Button>
                    <Button onClick={handleUpdateService} variant="contained" color="primary">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог подтверждения удаления услуги */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Удалить Услугу</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите удалить эту услугу? Это действие необратимо.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
                    <Button onClick={handleDeleteService} variant="contained" color="error">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );

}

export default ServiceManagement;
