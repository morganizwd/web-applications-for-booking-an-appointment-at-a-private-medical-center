// src/components/DoctorDashboard.jsx

import React, { useEffect, useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Spinner,
    Alert,
    Table,
    Image,
    Modal,
} from 'react-bootstrap';
import axios from '../../redux/axios'; // Настроенный экземпляр axios
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function DoctorDashboard() {
    // Определение состояния
    const [doctor, setDoctor] = useState(null);
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [doctorError, setDoctorError] = useState('');

    const [allSchedules, setAllSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [scheduleError, setScheduleError] = useState('');

    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [appointmentsError, setAppointmentsError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        specialization: '',
        photo: null,
    });
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [diagnosisData, setDiagnosisData] = useState({
        name: '',
        conclusion: '',
    });
    const [diagnosisError, setDiagnosisError] = useState('');
    const [diagnosisSuccess, setDiagnosisSuccess] = useState('');

    const [diagnoses, setDiagnoses] = useState([]);
    const [loadingDiagnoses, setLoadingDiagnoses] = useState(true);
    const [diagnosesError, setDiagnosesError] = useState('');

    // --- Состояния для редактирования диагноза ---
    const [showEditDiagnosisModal, setShowEditDiagnosisModal] = useState(false);
    const [diagnosisToEdit, setDiagnosisToEdit] = useState(null);
    const [editDiagnosisData, setEditDiagnosisData] = useState({
        name: '',
        conclusion: '',
    });
    const [editDiagnosisError, setEditDiagnosisError] = useState('');
    const [editDiagnosisSuccess, setEditDiagnosisSuccess] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // --- Состояния для удаления диагноза ---
    const [showDeleteDiagnosisModal, setShowDeleteDiagnosisModal] = useState(false);
    const [diagnosisToDelete, setDiagnosisToDelete] = useState(null);
    const [deleteDiagnosisError, setDeleteDiagnosisError] = useState('');
    const [deleteDiagnosisLoading, setDeleteDiagnosisLoading] = useState(false);

    // Получение данных доктора
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await axios.get('/doctors/auth');
                setDoctor(res.data);
                setFormData((prev) => ({
                    ...prev,
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    specialization: res.data.specialization || '',
                }));
                if (res.data.photo) {
                    setPreviewPhoto(`${axios.defaults.baseURL}${res.data.photo}`);
                }
                setLoadingDoctor(false);
            } catch (err) {
                console.error('Ошибка при получении данных доктора:', err);
                setDoctorError('Не удалось загрузить данные доктора.');
                setLoadingDoctor(false);
            }
        };

        const fetchSchedules = async () => {
            try {
                const res = await axios.get('/doctor-schedules');
                setAllSchedules(res.data);
                setLoadingSchedules(false);
            } catch (err) {
                console.error('Ошибка при получении расписаний:', err);
                setScheduleError('Не удалось загрузить расписания.');
                setLoadingSchedules(false);
            }
        };

        fetchDoctor();
        fetchSchedules();
    }, []);

    // Получение записей и диагнозов после загрузки доктора
    useEffect(() => {
        if (doctor) {
            fetchAppointments(doctor.id);
            fetchDiagnoses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctor]);

    const fetchAppointments = async (doctorId) => {
        try {
            const res = await axios.get('/appointments', {
                params: { doctorId },
            });
            setAppointments(res.data);
            setLoadingAppointments(false);
        } catch (err) {
            console.error('Ошибка при получении записей:', err);
            setAppointmentsError('Не удалось загрузить записи.');
            setLoadingAppointments(false);
        }
    };

    const fetchDiagnoses = async () => {
        try {
            const res = await axios.get('/diagnoses');
            setDiagnoses(res.data);
            setLoadingDiagnoses(false);
        } catch (err) {
            console.error('Ошибка при получении диагнозов:', err);
            setDiagnosesError('Не удалось загрузить диагнозы.');
            setLoadingDiagnoses(false);
        }
    };

    // Фильтрация расписаний для текущего доктора
    const mySchedules = doctor
        ? allSchedules.filter((s) => s.doctorId === doctor.id)
        : [];

    // Обработка изменений формы
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, photo: file }));

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            if (doctor && doctor.photo) {
                setPreviewPhoto(`${axios.defaults.baseURL}${doctor.photo}`);
            } else {
                setPreviewPhoto(null);
            }
        }
    };

    // Обновление профиля
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateError('');
        setUpdateSuccess('');

        if (!doctor) {
            setUpdateError('Данные доктора не загружены.');
            return;
        }

        try {
            const putData = new FormData();
            putData.append('firstName', formData.firstName);
            putData.append('lastName', formData.lastName);
            putData.append('specialization', formData.specialization);

            if (formData.photo) {
                putData.append('photo', formData.photo);
            }

            const res = await axios.put(`/doctors/${doctor.id}`, putData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setDoctor(res.data);
            if (res.data.photo) {
                setPreviewPhoto(`${axios.defaults.baseURL}${res.data.photo}`);
            }
            setUpdateSuccess('Профиль успешно обновлён!');
        } catch (err) {
            console.error('Ошибка при обновлении профиля:', err);
            setUpdateError('Не удалось обновить профиль.');
        }
    };

    // Обработчики модального окна диагноза
    const handleShowDiagnosisModal = (appointment) => {
        setSelectedAppointment(appointment);
        setDiagnosisData({ name: '', conclusion: '' });
        setDiagnosisError('');
        setDiagnosisSuccess('');
        setShowDiagnosisModal(true);
    };

    const handleCloseDiagnosisModal = () => {
        setShowDiagnosisModal(false);
        setSelectedAppointment(null);
    };

    const handleDiagnosisChange = (e) => {
        const { name, value } = e.target;
        setDiagnosisData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitDiagnosis = async (e) => {
        e.preventDefault();
        setDiagnosisError('');
        setDiagnosisSuccess('');

        if (!diagnosisData.name || !diagnosisData.conclusion) {
            setDiagnosisError('Все поля обязательны для заполнения.');
            return;
        }

        if (!selectedAppointment) {
            setDiagnosisError('Запись не выбрана.');
            return;
        }

        try {
            const res = await axios.post('/diagnoses', {
                name: diagnosisData.name,
                conclusion: diagnosisData.conclusion,
                patientId: selectedAppointment.patientId,
            });

            setDiagnosisSuccess('Диагноз успешно добавлен.');
            fetchAppointments(doctor.id);
            fetchDiagnoses();

            setTimeout(() => {
                handleCloseDiagnosisModal();
            }, 1500);
        } catch (err) {
            console.error('Ошибка при добавлении диагноза:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setDiagnosisError(err.response.data.message);
            } else if (err.response && err.response.data && err.response.data.errors) {
                setDiagnosisError(err.response.data.errors.map((e) => e.msg).join(', '));
            } else {
                setDiagnosisError('Не удалось добавить диагноз.');
            }
        }
    };

    // Экспорт в Excel
    const exportTableToExcel = (data, headers, filename) => {
        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, `${filename}.xlsx`);
    };

    // Экспорт в Word (HTML-метод)
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

    // Обработчики экспорта для расписаний
    const handleExportSchedulesExcel = () => {
        const data = mySchedules.map((s) => ({
            ID: s.id,
            'Day of Week': [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ][s.dayOfWeek] || s.dayOfWeek,
            'Start Time': s.startTime,
            'End Time': s.endTime,
        }));
        const headers = ['ID', 'Day of Week', 'Start Time', 'End Time'];
        exportTableToExcel(data, headers, 'Doctor_Schedules');
    };

    const handleExportSchedulesWord = () => {
        const data = mySchedules.map((s) => ({
            ID: s.id,
            'Day of Week': [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ][s.dayOfWeek] || s.dayOfWeek,
            'Start Time': s.startTime,
            'End Time': s.endTime,
        }));
        const headers = ['ID', 'Day of Week', 'Start Time', 'End Time'];
        exportTableToWord(data, headers, 'Doctor_Schedules');
    };

    // Обработчики экспорта для записей
    const handleExportAppointmentsExcel = () => {
        const data = appointments.map((a) => ({
            ID: a.id,
            'Date/Time': format(new Date(a.date), 'dd.MM.yyyy HH:mm'),
            Patient: `${a.Patient.firstName} ${a.Patient.lastName}`,
            Service: a.Service.name,
        }));
        const headers = ['ID', 'Date/Time', 'Patient', 'Service'];
        exportTableToExcel(data, headers, 'Doctor_Appointments');
    };

    const handleExportAppointmentsWord = () => {
        const data = appointments.map((a) => ({
            ID: a.id,
            'Date/Time': format(new Date(a.date), 'dd.MM.yyyy HH:mm'),
            Patient: `${a.Patient.firstName} ${a.Patient.lastName}`,
            Service: a.Service.name,
        }));
        const headers = ['ID', 'Date/Time', 'Patient', 'Service'];
        exportTableToWord(data, headers, 'Doctor_Appointments');
    };

    // Обработчики экспорта для диагнозов
    const handleExportDiagnosesExcel = () => {
        const data = diagnoses.map((d) => ({
            ID: d.id,
            Patient: `${d.Patient.firstName} ${d.Patient.lastName}`,
            'Diagnosis Name': d.name,
            Conclusion: d.conclusion,
            'Created At': format(new Date(d.createdAt), 'dd.MM.yyyy HH:mm'),
        }));
        const headers = ['ID', 'Patient', 'Diagnosis Name', 'Conclusion', 'Created At'];
        exportTableToExcel(data, headers, 'Doctor_Diagnoses');
    };

    const handleExportDiagnosesWord = () => {
        const data = diagnoses.map((d) => ({
            ID: d.id,
            Patient: `${d.Patient.firstName} ${d.Patient.lastName}`,
            'Diagnosis Name': d.name,
            Conclusion: d.conclusion,
            'Created At': format(new Date(d.createdAt), 'dd.MM.yyyy HH:mm'),
        }));
        const headers = ['ID', 'Patient', 'Diagnosis Name', 'Conclusion', 'Created At'];
        exportTableToWord(data, headers, 'Doctor_Diagnoses');
    };

    // Функции для редактирования диагноза
    const handleEditDiagnosisClick = (diagnosis) => {
        setDiagnosisToEdit(diagnosis);
        setEditDiagnosisData({
            name: diagnosis.name,
            conclusion: diagnosis.conclusion,
        });
        setEditDiagnosisError('');
        setEditDiagnosisSuccess('');
        setShowEditDiagnosisModal(true);
    };

    const handleEditDiagnosisChange = (e) => {
        const { name, value } = e.target;
        setEditDiagnosisData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditDiagnosisSubmit = async (e) => {
        e.preventDefault();
        setEditDiagnosisError('');
        setEditDiagnosisSuccess('');
        setEditLoading(true);

        try {
            const res = await axios.put(`/diagnoses/${diagnosisToEdit.id}`, editDiagnosisData);
            setEditDiagnosisSuccess('Диагноз успешно обновлен.');
            // Обновляем диагнозы в состоянии
            setDiagnoses((prevDiagnoses) =>
                prevDiagnoses.map((diag) =>
                    diag.id === diagnosisToEdit.id ? res.data : diag
                )
            );
            setShowEditDiagnosisModal(false);
            setDiagnosisToEdit(null);
        } catch (err) {
            console.error('Ошибка при обновлении диагноза:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setEditDiagnosisError(err.response.data.message);
            } else if (err.response && err.response.data && err.response.data.errors) {
                setEditDiagnosisError(err.response.data.errors.map((e) => e.msg).join(', '));
            } else {
                setEditDiagnosisError('Не удалось обновить диагноз.');
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditDiagnosisCancel = () => {
        setShowEditDiagnosisModal(false);
        setDiagnosisToEdit(null);
        setEditDiagnosisError('');
    };

    // Функции для удаления диагноза
    const handleDeleteDiagnosisClick = (diagnosis) => {
        setDiagnosisToDelete(diagnosis);
        setShowDeleteDiagnosisModal(true);
        setDeleteDiagnosisError('');
    };

    const handleConfirmDeleteDiagnosis = async () => {
        if (!diagnosisToDelete) return;

        setDeleteDiagnosisLoading(true);
        setDeleteDiagnosisError('');

        try {
            await axios.delete(`/diagnoses/${diagnosisToDelete.id}`);
            // Удаляем диагноз из состояния
            setDiagnoses((prevDiagnoses) =>
                prevDiagnoses.filter((diag) => diag.id !== diagnosisToDelete.id)
            );
            setUpdateSuccess('Диагноз успешно удален.');
            setShowDeleteDiagnosisModal(false);
            setDiagnosisToDelete(null);
        } catch (err) {
            console.error('Ошибка при удалении диагноза:', err);
            setDeleteDiagnosisError('Не удалось удалить диагноз. Попробуйте снова.');
        } finally {
            setDeleteDiagnosisLoading(false);
        }
    };

    const handleCancelDeleteDiagnosis = () => {
        setShowDeleteDiagnosisModal(false);
        setDiagnosisToDelete(null);
        setDeleteDiagnosisError('');
    };

    return (
        <Container className="mt-5">
            <h2>Doctor's Dashboard</h2>

            {/* Секция информации о докторе */}
            {loadingDoctor ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading doctor info...</span>
                </Spinner>
            ) : doctorError ? (
                <Alert variant="danger">{doctorError}</Alert>
            ) : doctor ? (
                <Row>
                    <Col md={4}>
                        <Card>
                            <Card.Body className="text-center">
                                {previewPhoto ? (
                                    <Image
                                        src={previewPhoto}
                                        roundedCircle
                                        style={{
                                            width: '200px',
                                            height: '200px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ) : (
                                    <Image
                                        src="https://via.placeholder.com/200"
                                        roundedCircle
                                        style={{
                                            width: '200px',
                                            height: '200px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                )}
                                <Card.Title className="mt-3">
                                    {doctor.firstName} {doctor.lastName}
                                </Card.Title>
                                <Card.Subtitle className="text-muted">
                                    {doctor.specialization}
                                </Card.Subtitle>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={8}>
                        <Card>
                            <Card.Body>
                                <h5>Update Profile</h5>
                                {updateError && <Alert variant="danger">{updateError}</Alert>}
                                {updateSuccess && (
                                    <Alert variant="success">{updateSuccess}</Alert>
                                )}

                                <Form onSubmit={handleUpdateProfile}>
                                    <Form.Group controlId="formFirstName" className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formLastName" className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formSpecialization" className="mb-3">
                                        <Form.Label>Specialization</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formPhoto" className="mb-3">
                                        <Form.Label>Photo</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                    </Form.Group>

                                    <Button variant="primary" type="submit">
                                        Save
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : null}

            {/* Секция расписаний */}
            <hr className="my-4" />
            <Row className="align-items-center mb-3">
                <Col>
                    <h4>My Schedules</h4>
                </Col>
                <Col className="text-end">
                    <Button
                        variant="success"
                        className="me-2"
                        onClick={handleExportSchedulesExcel}
                    >
                        Export to Excel
                    </Button>
                    <Button variant="primary" onClick={handleExportSchedulesWord}>
                        Export to Word
                    </Button>
                </Col>
            </Row>
            {loadingSchedules ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading schedules...</span>
                </Spinner>
            ) : scheduleError ? (
                <Alert variant="danger">{scheduleError}</Alert>
            ) : (
                <Table bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Day of Week</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mySchedules.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    No schedules to display
                                </td>
                            </tr>
                        ) : (
                            mySchedules.map((item) => {
                                const days = [
                                    'Sunday',
                                    'Monday',
                                    'Tuesday',
                                    'Wednesday',
                                    'Thursday',
                                    'Friday',
                                    'Saturday',
                                ];
                                const dayName = days[item.dayOfWeek] || item.dayOfWeek;

                                return (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{dayName}</td>
                                        <td>{item.startTime}</td>
                                        <td>{item.endTime}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            )}

            {/* Секция записей */}
            <hr className="my-4" />
            <Row className="align-items-center mb-3">
                <Col>
                    <h4>My Appointments</h4>
                </Col>
                <Col className="text-end">
                    <Button
                        variant="success"
                        className="me-2"
                        onClick={handleExportAppointmentsExcel}
                    >
                        Export to Excel
                    </Button>
                    <Button variant="primary" onClick={handleExportAppointmentsWord}>
                        Export to Word
                    </Button>
                </Col>
            </Row>
            {loadingAppointments ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading appointments...</span>
                </Spinner>
            ) : appointmentsError ? (
                <Alert variant="danger">{appointmentsError}</Alert>
            ) : (
                <Table bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date/Time</th>
                            <th>Patient</th>
                            <th>Service</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No appointments to display
                                </td>
                            </tr>
                        ) : (
                            appointments.map((appt) => (
                                <tr key={appt.id}>
                                    <td>{appt.id}</td>
                                    <td>
                                        {format(new Date(appt.date), 'dd.MM.yyyy HH:mm')}
                                    </td>
                                    <td>{`${appt.Patient.firstName} ${appt.Patient.lastName}`}</td>
                                    <td>{appt.Service.name}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowDiagnosisModal(appt)}
                                        >
                                            Add Diagnosis
                                        </Button>
                                        {/* Дополнительные действия можно добавить здесь */}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {/* Секция диагнозов */}
            <hr className="my-4" />
            <Row className="align-items-center mb-3">
                <Col>
                    <h4>My Diagnoses</h4>
                </Col>
                <Col className="text-end">
                    <Button
                        variant="success"
                        className="me-2"
                        onClick={handleExportDiagnosesExcel}
                    >
                        Export to Excel
                    </Button>
                    <Button variant="primary" onClick={handleExportDiagnosesWord}>
                        Export to Word
                    </Button>
                </Col>
            </Row>
            {loadingDiagnoses ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading diagnoses...</span>
                </Spinner>
            ) : diagnosesError ? (
                <Alert variant="danger">{diagnosesError}</Alert>
            ) : (
                <Table bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Diagnosis Name</th>
                            <th>Conclusion</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diagnoses.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No diagnoses to display
                                </td>
                            </tr>
                        ) : (
                            diagnoses.map((diag) => (
                                <tr key={diag.id}>
                                    <td>{diag.id}</td>
                                    <td>{`${diag.Patient.firstName} ${diag.Patient.lastName}`}</td>
                                    <td>{diag.name}</td>
                                    <td>{diag.conclusion}</td>
                                    <td>
                                        {format(new Date(diag.createdAt), 'dd.MM.yyyy HH:mm')}
                                    </td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleEditDiagnosisClick(diag)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDeleteDiagnosisClick(diag)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {/* Модальное окно диагноза */}
            <Modal show={showDiagnosisModal} onHide={handleCloseDiagnosisModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Diagnosis</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {diagnosisError && <Alert variant="danger">{diagnosisError}</Alert>}
                    {diagnosisSuccess && (
                        <Alert variant="success">{diagnosisSuccess}</Alert>
                    )}

                    <Form onSubmit={handleSubmitDiagnosis}>
                        <Form.Group controlId="diagnosisName" className="mb-3">
                            <Form.Label>Diagnosis Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={diagnosisData.name}
                                onChange={handleDiagnosisChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="diagnosisConclusion" className="mb-3">
                            <Form.Label>Conclusion</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="conclusion"
                                value={diagnosisData.conclusion}
                                onChange={handleDiagnosisChange}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Add
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Модальное окно редактирования диагноза */}
            <Modal show={showEditDiagnosisModal} onHide={handleEditDiagnosisCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Diagnosis</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editDiagnosisError && <Alert variant="danger">{editDiagnosisError}</Alert>}
                    {editDiagnosisSuccess && (
                        <Alert variant="success">{editDiagnosisSuccess}</Alert>
                    )}

                    <Form onSubmit={handleEditDiagnosisSubmit}>
                        <Form.Group controlId="editDiagnosisName" className="mb-3">
                            <Form.Label>Diagnosis Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={editDiagnosisData.name}
                                onChange={handleEditDiagnosisChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="editDiagnosisConclusion" className="mb-3">
                            <Form.Label>Conclusion</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="conclusion"
                                value={editDiagnosisData.conclusion}
                                onChange={handleEditDiagnosisChange}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={editLoading}>
                            {editLoading ? 'Updating...' : 'Update'}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleEditDiagnosisCancel}
                            className="ms-2"
                            disabled={editLoading}
                        >
                            Cancel
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Модальное окно подтверждения удаления диагноза */}
            <Modal show={showDeleteDiagnosisModal} onHide={handleCancelDeleteDiagnosis}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete Diagnosis</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteDiagnosisError && <Alert variant="danger">{deleteDiagnosisError}</Alert>}
                    {diagnosisToDelete && (
                        <p>
                            Are you sure you want to delete the diagnosis with ID{' '}
                            <strong>{diagnosisToDelete.id}</strong>?
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelDeleteDiagnosis}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmDeleteDiagnosis}
                        disabled={deleteDiagnosisLoading}
                    >
                        {deleteDiagnosisLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default DoctorDashboard;
