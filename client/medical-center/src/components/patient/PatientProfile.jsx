// src/components/PatientProfile.jsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    selectCurrentPatient, 
    selectPatientStatus, 
    selectPatientError, 
    updatePatient 
} from '../../redux/slices/patientSlice';
import { Container, Form, Button, Spinner, Alert, Row, Col, Image, Table, Modal } from 'react-bootstrap';
import axios from '../../redux/axios'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const PatientProfile = () => {
    const dispatch = useDispatch();
    const patient = useSelector(selectCurrentPatient);
    const status = useSelector(selectPatientStatus);
    const error = useSelector(selectPatientError);

    const [formData, setFormData] = useState({
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        age: '',
        photo: null,
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // --- Состояния для загрузки и отображения записей пациента ---
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [appointmentsError, setAppointmentsError] = useState(null);

    // --- Состояния для диагнозов ---
    const [diagnoses, setDiagnoses] = useState([]);
    const [loadingDiagnoses, setLoadingDiagnoses] = useState(false);
    const [diagnosesError, setDiagnosesError] = useState(null);

    // --- Состояния для модального окна удаления ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (patient) {
            // Инициализация полей формы
            setFormData({
                login: patient.login || '',
                password: '', // Оставляем пустым, чтобы не отображать текущий пароль
                firstName: patient.firstName || '',
                lastName: patient.lastName || '',
                phoneNumber: patient.phoneNumber || '',
                address: patient.address || '',
                age: patient.age || '',
                photo: null,
            });
            const imageUrl = patient.photo ? `${axios.defaults.baseURL}${patient.photo}` : null;
            setPreviewImage(imageUrl);

            // Загружаем записи пациента
            fetchPatientAppointments(patient.id);

            // Загружаем диагнозы пациента
            fetchPatientDiagnoses(patient.id);
        }
    }, [patient]);

    // Функция для получения списка приёмов (appointments) пациента
    const fetchPatientAppointments = async (patientId) => {
        setLoadingAppointments(true);
        setAppointmentsError(null);
        try {
            const res = await axios.get('/appointments', {
                params: { patientId }
            });
            setAppointments(res.data);
        } catch (err) {
            console.error('Ошибка при получении записей пациента:', err);
            setAppointmentsError('Не удалось загрузить ваши записи (appointments).');
        } finally {
            setLoadingAppointments(false);
        }
    };

    // Функция для получения диагнозов пациента
    const fetchPatientDiagnoses = async (patientId) => {
        setLoadingDiagnoses(true);
        setDiagnosesError(null);
        try {
            const res = await axios.get('/diagnoses', {
                params: { patientId }
            });
            setDiagnoses(res.data);
        } catch (err) {
            console.error('Ошибка при получении диагнозов пациента:', err);
            setDiagnosesError('Не удалось загрузить ваши диагнозы.');
        } finally {
            setLoadingDiagnoses(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prevState => ({
            ...prevState,
            photo: file,
        }));

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            const imageUrl = patient.photo ? `${axios.defaults.baseURL}${patient.photo}` : null;
            setPreviewImage(imageUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        const updatedData = { ...formData };

        // Если пароль пустой — не обновляем его
        if (!updatedData.password) {
            delete updatedData.password;
        }
        // Если фото не выбрано — не обновляем его
        if (!updatedData.photo) {
            delete updatedData.photo;
        }

        dispatch(updatePatient({ id: patient.id, updatedData }))
            .unwrap()
            .then(() => {
                setSuccessMessage('Данные успешно обновлены.');
                // После обновления данных, возможно, стоит обновить изображения
                if (updatedData.photo) {
                    // Предположим, что сервер возвращает обновлённые данные пациента
                    fetchPatientDiagnoses(patient.id); // Обновляем диагнозы
                }
            })
            .catch(() => {
                // Ошибки уже обрабатываются в Redux Slice
            });
    };

    // Функции для экспорта данных в Excel
    const exportTableToExcel = (data, headers, filename) => {
        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, `${filename}.xlsx`);
    };

    // Функции для экспорта данных в Word (HTML-метод)
    const exportTableToWord = (data, headers, filename) => {
        try {
            // Создаём HTML-таблицу
            let tableHTML = `
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            ${headers.map((header) => `<th style="padding: 8px;">${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data
                            .map(
                                (row) => `
                            <tr>
                                ${headers
                                    .map((header) => `<td style="padding: 8px;">${row[header] || ''}</td>`)
                                    .join('')}
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            `;

            // Оборачиваем таблицу в базовый HTML
            const htmlContent = `
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>${filename}</title>
                    </head>
                    <body>
                        <h2>${filename}</h2>
                        ${tableHTML}
                    </body>
                </html>
            `;

            // Создаём Blob с типом "application/msword"
            const blob = new Blob([htmlContent], {
                type: 'application/msword;charset=utf-8',
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.doc`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ошибка при экспорте в Word:', error);
            alert('Не удалось экспортировать в Word.');
        }
    };

    // Обработчики экспорта для записей
    const handleExportAppointmentsExcel = () => {
        const data = appointments.map((a) => ({
            ID: a.id,
            'Дата/Время': new Date(a.date).toLocaleString(),
            Врач: a.Doctor 
                ? `${a.Doctor.firstName} ${a.Doctor.lastName} (${a.Doctor.specialization})`
                : '—',
            Услуга: a.Service 
                ? `${a.Service.name} (${a.Service.price} руб.)`
                : '—',
        }));
        const headers = ['ID', 'Дата/Время', 'Врач', 'Услуга'];
        exportTableToExcel(data, headers, 'Patient_Appointments');
    };

    const handleExportAppointmentsWord = () => {
        const data = appointments.map((a) => ({
            ID: a.id,
            'Дата/Время': new Date(a.date).toLocaleString(),
            Врач: a.Doctor 
                ? `${a.Doctor.firstName} ${a.Doctor.lastName} (${a.Doctor.specialization})`
                : '—',
            Услуга: a.Service 
                ? `${a.Service.name} (${a.Service.price} руб.)`
                : '—',
        }));
        const headers = ['ID', 'Дата/Время', 'Врач', 'Услуга'];
        exportTableToWord(data, headers, 'Patient_Appointments');
    };

    // Обработчики экспорта для диагнозов
    const handleExportDiagnosesExcel = () => {
        const data = diagnoses.map((d) => ({
            ID: d.id,
            Название: d.name,
            Заключение: d.conclusion,
            Врач: d.Doctor
                ? `${d.Doctor.firstName} ${d.Doctor.lastName} (${d.Doctor.specialization})`
                : '—',
            'Дата Создания': new Date(d.createdAt).toLocaleString(),
        }));
        const headers = ['ID', 'Название', 'Заключение', 'Врач', 'Дата Создания'];
        exportTableToExcel(data, headers, 'Patient_Diagnoses');
    };

    const handleExportDiagnosesWord = () => {
        const data = diagnoses.map((d) => ({
            ID: d.id,
            Название: d.name,
            Заключение: d.conclusion,
            Врач: d.Doctor
                ? `${d.Doctor.firstName} ${d.Doctor.lastName} (${d.Doctor.specialization})`
                : '—',
            'Дата Создания': new Date(d.createdAt).toLocaleString(),
        }));
        const headers = ['ID', 'Название', 'Заключение', 'Врач', 'Дата Создания'];
        exportTableToWord(data, headers, 'Patient_Diagnoses');
    };

    // Функции для удаления записи
    const handleDeleteClick = (appointment) => {
        setAppointmentToDelete(appointment);
        setShowDeleteModal(true);
        setDeleteError('');
    };

    const handleConfirmDelete = async () => {
        if (!appointmentToDelete) return;

        setDeleteLoading(true);
        setDeleteError('');

        try {
            await axios.delete(`/appointments/${appointmentToDelete.id}`);
            setSuccessMessage('Запись успешно удалена.');
            // Обновляем список записей
            setAppointments(prevAppointments => prevAppointments.filter(a => a.id !== appointmentToDelete.id));
            setShowDeleteModal(false);
            setAppointmentToDelete(null);
        } catch (err) {
            console.error('Ошибка при удалении записи:', err);
            setDeleteError('Не удалось удалить запись. Попробуйте снова.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setAppointmentToDelete(null);
        setDeleteError('');
    };

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Мой Профиль</h2>
            {status === 'loading' && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </Spinner>
                </div>
            )}
            {error && (
                <Alert variant="danger">
                    {error}
                </Alert>
            )}
            {successMessage && (
                <Alert variant="success">
                    {successMessage}
                </Alert>
            )}
            {patient && (
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={4} className="text-center mb-3">
                            {previewImage ? (
                                <Image
                                    src={previewImage}
                                    roundedCircle
                                    fluid
                                    style={{ maxWidth: '200px', height: '200px', objectFit: 'cover' }}
                                />
                            ) : (
                                <Image
                                    src="https://via.placeholder.com/200"
                                    roundedCircle
                                    fluid
                                    style={{ maxWidth: '200px', height: '200px', objectFit: 'cover' }}
                                />
                            )}
                            <Form.Group controlId="formPhoto" className="mt-3">
                                <Form.Label>Изменить Фото</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="photo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group controlId="formLogin" className="mb-3">
                                <Form.Label>Логин</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="login"
                                    value={formData.login}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formPassword" className="mb-3">
                                <Form.Label>Новый Пароль</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Оставьте пустым, если не хотите менять пароль"
                                />
                            </Form.Group>

                            <Form.Group controlId="formFirstName" className="mb-3">
                                <Form.Label>Имя</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formLastName" className="mb-3">
                                <Form.Label>Фамилия</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formPhoneNumber" className="mb-3">
                                <Form.Label>Номер Телефона</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+7 (999) 999-99-99"
                                />
                            </Form.Group>

                            <Form.Group controlId="formAddress" className="mb-3">
                                <Form.Label>Адрес</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Город, улица, дом, квартира"
                                />
                            </Form.Group>

                            <Form.Group controlId="formAge" className="mb-3">
                                <Form.Label>Возраст</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Сохранение...' : 'Сохранить Изменения'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            )}

            {/* Блок с записями пациента */}
            <h3 className="mt-5">Мои Записи (Appointments)</h3>
            <Row className="align-items-center mb-3">
                <Col></Col>
                <Col className="text-end">
                    <Button
                        variant="success"
                        className="me-2"
                        onClick={handleExportAppointmentsExcel}
                        disabled={appointments.length === 0}
                    >
                        Экспорт в Excel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleExportAppointmentsWord}
                        disabled={appointments.length === 0}
                    >
                        Экспорт в Word
                    </Button>
                </Col>
            </Row>
            {loadingAppointments ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка записей...</span>
                    </Spinner>
                </div>
            ) : appointmentsError ? (
                <Alert variant="danger">{appointmentsError}</Alert>
            ) : appointments.length === 0 ? (
                <Alert variant="info">Вы ещё не записаны ни на один приём.</Alert>
            ) : (
                <Table bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Дата/Время</th>
                            <th>Врач</th>
                            <th>Услуга</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appt) => (
                            <tr key={appt.id}>
                                <td>{appt.id}</td>
                                <td>{new Date(appt.date).toLocaleString()}</td>
                                <td>
                                    {appt.Doctor 
                                        ? `${appt.Doctor.firstName} ${appt.Doctor.lastName} (${appt.Doctor.specialization})`
                                        : '—'}
                                </td>
                                <td>
                                    {appt.Service 
                                        ? `${appt.Service.name} (${appt.Service.price} руб.)`
                                        : '—'}
                                </td>
                                <td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteClick(appt)}
                                    >
                                        Удалить
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Блок с диагнозами пациента */}
            <h3 className="mt-5">Мои Диагнозы</h3>
            <Row className="align-items-center mb-3">
                <Col></Col>
                <Col className="text-end">
                    <Button
                        variant="success"
                        className="me-2"
                        onClick={handleExportDiagnosesExcel}
                        disabled={diagnoses.length === 0}
                    >
                        Экспорт в Excel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleExportDiagnosesWord}
                        disabled={diagnoses.length === 0}
                    >
                        Экспорт в Word
                    </Button>
                </Col>
            </Row>
            {loadingDiagnoses ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка диагнозов...</span>
                    </Spinner>
                </div>
            ) : diagnosesError ? (
                <Alert variant="danger">{diagnosesError}</Alert>
            ) : diagnoses.length === 0 ? (
                <Alert variant="info">У вас пока нет диагнозов.</Alert>
            ) : (
                <Table bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название Диагноза</th>
                            <th>Заключение</th>
                            <th>Врач</th>
                            <th>Дата Создания</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diagnoses.map((diag) => (
                            <tr key={diag.id}>
                                <td>{diag.id}</td>
                                <td>{diag.name}</td>
                                <td>{diag.conclusion}</td>
                                <td>
                                    {diag.Doctor
                                        ? `${diag.Doctor.firstName} ${diag.Doctor.lastName} (${diag.Doctor.specialization})`
                                        : '—'}
                                </td>
                                <td>{new Date(diag.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Модальное окно подтверждения удаления */}
            <Modal show={showDeleteModal} onHide={handleCancelDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteError && <Alert variant="danger">{deleteError}</Alert>}
                    {appointmentToDelete && (
                        <p>
                            Вы уверены, что хотите удалить запись на прием с ID <strong>{appointmentToDelete.id}</strong>?
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelDelete}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete} disabled={deleteLoading}>
                        {deleteLoading ? 'Удаление...' : 'Удалить'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );

};

export default PatientProfile;
