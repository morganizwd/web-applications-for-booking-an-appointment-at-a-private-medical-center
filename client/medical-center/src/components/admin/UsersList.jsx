import React, { useEffect, useState } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Table,
    Modal,
    Form,
} from 'react-bootstrap';
import axios from '../../redux/axios'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function AdminDashboard() {
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);

    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingPatients, setLoadingPatients] = useState(true);

    const [doctorsError, setDoctorsError] = useState('');
    const [patientsError, setPatientsError] = useState('');

    const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [editDoctorData, setEditDoctorData] = useState({
        firstName: '',
        lastName: '',
        specialization: '',
        departmentId: '',
    });
    const [editDoctorPhoto, setEditDoctorPhoto] = useState(null);
    const [editDoctorPhotoPreview, setEditDoctorPhotoPreview] = useState(null);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchDoctors();
        fetchPatients();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error('Ошибка при получении списка отделений:', err);
        }
    };

    const handleUpdateDoctor = async () => {
        try {
            const formData = new FormData();
            formData.append('firstName', editDoctorData.firstName);
            formData.append('lastName', editDoctorData.lastName);
            formData.append('specialization', editDoctorData.specialization);
            if (editDoctorData.departmentId) {
                formData.append('departmentId', editDoctorData.departmentId);
            }
            if (editDoctorPhoto) {
                formData.append('photo', editDoctorPhoto);
            }

            await axios.put(`/doctors/${editingDoctor.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setShowEditDoctorModal(false);
            setEditingDoctor(null);
            setEditDoctorPhoto(null);
            setEditDoctorPhotoPreview(null);
            fetchDoctors();
        } catch (err) {
            console.error('Ошибка при обновлении врача:', err);
            alert('Не удалось обновить врача');
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('/doctors');
            setDoctors(res.data);
            setLoadingDoctors(false);
        } catch (err) {
            console.error('Ошибка при получении списка врачей:', err);
            setDoctorsError('Не удалось загрузить список врачей.');
            setLoadingDoctors(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await axios.get('/patients');
            setPatients(res.data);
            setLoadingPatients(false);
        } catch (err) {
            console.error('Ошибка при получении списка пациентов:', err);
            setPatientsError('Не удалось загрузить список пациентов.');
            setLoadingPatients(false);
        }
    };

    const exportToExcel = (data, headers, filename) => {
        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, `${filename}.xlsx`);
    };

    const exportToWord = (data, headers, filename) => {
        try {
            
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

    return (
        <Container className="mt-5">
            <h2>Admin Dashboard</h2>

            {}
            <hr className="my-4" />
            <Row className="align-items-center mb-3">
                <Col>
                    <h4>All Doctors</h4>
                </Col>
                <Col className="text-end">
                    <Button
                        variant="success"
                        className="me-2"
                        onClick={() => {
                            const data = doctors.map((doc) => ({
                                ID: doc.id,
                                Login: doc.login,
                                'First Name': doc.firstName,
                                'Last Name': doc.lastName,
                                Specialization: doc.specialization,
                                Department: doc.Department ? doc.Department.name : 'N/A',
                                'Created At': new Date(doc.createdAt).toLocaleString(),
                            }));
                            const headers = ['ID', 'Login', 'First Name', 'Last Name', 'Specialization', 'Department', 'Created At'];
                            exportToExcel(data, headers, 'All_Doctors');
                        }}
                    >
                        Export to Excel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            const data = doctors.map((doc) => ({
                                ID: doc.id,
                                Login: doc.login,
                                'First Name': doc.firstName,
                                'Last Name': doc.lastName,
                                Specialization: doc.specialization,
                                Department: doc.Department ? doc.Department.name : 'N/A',
                                'Created At': new Date(doc.createdAt).toLocaleString(),
                            }));
                            const headers = ['ID', 'Login', 'First Name', 'Last Name', 'Specialization', 'Department', 'Created At'];
                            exportToWord(data, headers, 'All_Doctors');
                        }}
                    >
                        Export to Word
                    </Button>
                </Col>
            </Row>
            {loadingDoctors ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading doctors...</span>
                </Spinner>
            ) : doctorsError ? (
                <Alert variant="danger">{doctorsError}</Alert>
            ) : (
                <Table bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Login</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Specialization</th>
                            <th>Department</th>
                            <th>Photo</th>
                            <th>Actions</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center">
                                    No doctors to display
                                </td>
                            </tr>
                        ) : (
                            doctors.map((doc) => (
                                <tr key={doc.id}>
                                    <td>{doc.id}</td>
                                    <td>{doc.login}</td>
                                    <td>{doc.firstName}</td>
                                    <td>{doc.lastName}</td>
                                    <td>{doc.specialization}</td>
                                    <td>{doc.Department ? doc.Department.name : 'N/A'}</td>
                                    <td>
                                        {doc.photo ? (
                                            <img
                                                src={`${axios.defaults.baseURL}${doc.photo}`}
                                                alt={`${doc.firstName} ${doc.lastName}`}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        ) : (
                                            <span>Нет фото</span>
                                        )}
                                    </td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                setEditingDoctor(doc);
                                                setEditDoctorData({
                                                    firstName: doc.firstName,
                                                    lastName: doc.lastName,
                                                    specialization: doc.specialization,
                                                    departmentId: doc.departmentId || '',
                                                });
                                                setEditDoctorPhotoPreview(doc.photo ? `${axios.defaults.baseURL}${doc.photo}` : null);
                                                setShowEditDoctorModal(true);
                                            }}
                                        >
                                            Редактировать
                                        </Button>
                                    </td>
                                    <td>{new Date(doc.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {}
            <hr className="my-4" />
            <Row className="align-items-center mb-3">
                <Col>
                    <h4>All Patients</h4>
                </Col>
                <Col className="text-end">
                    <Button
                        variant="success"
                        className="me-2"
                        onClick={() => {
                            const data = patients.map((pat) => ({
                                ID: pat.id,
                                Login: pat.login,
                                'First Name': pat.firstName,
                                'Last Name': pat.lastName,
                                'Phone Number': pat.phoneNumber || 'N/A',
                                Address: pat.address || 'N/A',
                                Age: pat.age,
                                'Created At': new Date(pat.createdAt).toLocaleString(),
                            }));
                            const headers = ['ID', 'Login', 'First Name', 'Last Name', 'Phone Number', 'Address', 'Age', 'Created At'];
                            exportToExcel(data, headers, 'All_Patients');
                        }}
                    >
                        Export to Excel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            const data = patients.map((pat) => ({
                                ID: pat.id,
                                Login: pat.login,
                                'First Name': pat.firstName,
                                'Last Name': pat.lastName,
                                'Phone Number': pat.phoneNumber || 'N/A',
                                Address: pat.address || 'N/A',
                                Age: pat.age,
                                'Created At': new Date(pat.createdAt).toLocaleString(),
                            }));
                            const headers = ['ID', 'Login', 'First Name', 'Last Name', 'Phone Number', 'Address', 'Age', 'Created At'];
                            exportToWord(data, headers, 'All_Patients');
                        }}
                    >
                        Export to Word
                    </Button>
                </Col>
            </Row>
            {loadingPatients ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading patients...</span>
                </Spinner>
            ) : patientsError ? (
                <Alert variant="danger">{patientsError}</Alert>
            ) : (
                <Table bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Login</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Phone Number</th>
                            <th>Address</th>
                            <th>Age</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    No patients to display
                                </td>
                            </tr>
                        ) : (
                            patients.map((pat) => (
                                <tr key={pat.id}>
                                    <td>{pat.id}</td>
                                    <td>{pat.login}</td>
                                    <td>{pat.firstName}</td>
                                    <td>{pat.lastName}</td>
                                    <td>{pat.phoneNumber || 'N/A'}</td>
                                    <td>{pat.address || 'N/A'}</td>
                                    <td>{pat.age}</td>
                                    <td>{new Date(pat.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {}
            <Modal show={showEditDoctorModal} onHide={() => {
                setShowEditDoctorModal(false);
                setEditingDoctor(null);
                setEditDoctorPhoto(null);
                setEditDoctorPhotoPreview(null);
            }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Редактировать врача</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Имя</Form.Label>
                            <Form.Control
                                type="text"
                                value={editDoctorData.firstName}
                                onChange={(e) => setEditDoctorData({ ...editDoctorData, firstName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Фамилия</Form.Label>
                            <Form.Control
                                type="text"
                                value={editDoctorData.lastName}
                                onChange={(e) => setEditDoctorData({ ...editDoctorData, lastName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Специализация</Form.Label>
                            <Form.Control
                                type="text"
                                value={editDoctorData.specialization}
                                onChange={(e) => setEditDoctorData({ ...editDoctorData, specialization: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Отделение</Form.Label>
                            <Form.Select
                                value={editDoctorData.departmentId}
                                onChange={(e) => setEditDoctorData({ ...editDoctorData, departmentId: e.target.value })}
                            >
                                <option value="">Выберите отделение</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Фото</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setEditDoctorPhoto(file);
                                        setEditDoctorPhotoPreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            {editDoctorPhotoPreview && (
                                <div className="mt-2">
                                    <img
                                        src={editDoctorPhotoPreview}
                                        alt="Preview"
                                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowEditDoctorModal(false);
                        setEditingDoctor(null);
                        setEditDoctorPhoto(null);
                        setEditDoctorPhotoPreview(null);
                    }}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleUpdateDoctor}>
                        Сохранить
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default AdminDashboard;
