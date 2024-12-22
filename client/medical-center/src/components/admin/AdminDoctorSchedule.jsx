import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import axios from '../../redux/axios'; 
import * as XLSX from 'xlsx';       

const AdminDoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [filterDoctorId, setFilterDoctorId] = useState('');
  
  const [filterDayOfWeek, setFilterDayOfWeek] = useState('');

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  
  const [formData, setFormData] = useState({
    doctorId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });

  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    fetchDoctors();    
    fetchSchedules();  
  }, []);

  
  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      console.error('Ошибка при получении списка врачей:', err);
      setError('Не удалось загрузить список врачей. Пожалуйста, попробуйте позже.');
    }
  };

  
  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/doctor-schedules');
      setSchedules(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при получении расписаний:', err);
      setError('Не удалось загрузить расписания. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  
  const handleShowAddModal = () => {
    setFormData({
      doctorId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
    });
    setFormErrors([]);
    setShowAddModal(true);
  };

  const handleShowEditModal = (schedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      doctorId: schedule.doctorId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setFormErrors([]);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentSchedule(null);
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    try {
      const response = await axios.post('/doctor-schedules/create', formData);
      setSchedules((prev) => [...prev, response.data]);
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка при добавлении расписания:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        setFormErrors(err.response.data.errors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setFormErrors([{ msg: err.response.data.message }]);
      } else {
        setFormErrors([{ msg: 'Неизвестная ошибка' }]);
      }
    }
  };

  const handleEditSchedule = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    try {
      const response = await axios.put(`/doctor-schedules/${currentSchedule.id}`, formData);
      setSchedules((prev) =>
        prev.map((schedule) => (schedule.id === currentSchedule.id ? response.data : schedule))
      );
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка при редактировании расписания:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        setFormErrors(err.response.data.errors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setFormErrors([{ msg: err.response.data.message }]);
      } else {
        setFormErrors([{ msg: 'Неизвестная ошибка' }]);
      }
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это расписание?')) return;

    try {
      await axios.delete(`/doctor-schedules/${id}`);
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении расписания:', err);
      setError('Не удалось удалить расписание. Пожалуйста, попробуйте позже.');
    }
  };

  
  const handleFilterDoctor = (e) => {
    setFilterDoctorId(e.target.value);
  };

  const handleFilterDayOfWeek = (e) => {
    setFilterDayOfWeek(e.target.value);
  };

  
  const filteredSchedules = schedules
    .filter((sch) => (filterDoctorId ? sch.doctorId === Number(filterDoctorId) : true))
    .filter((sch) => (filterDayOfWeek ? sch.dayOfWeek === Number(filterDayOfWeek) : true));

  
  const handleExportExcel = () => {
    try {
      const dataForExcel = filteredSchedules.map((sch) => ({
        ID: sch.id,
        Врач: sch.Doctor
          ? `${sch.Doctor.firstName} ${sch.Doctor.lastName} (${sch.Doctor.specialization})`
          : 'Неизвестно',
        ДеньНедели:
          ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][
            sch.dayOfWeek
          ] || sch.dayOfWeek,
        Начало: sch.startTime,
        Конец: sch.endTime,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Расписание');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'DoctorSchedule.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте в Excel:', error);
      alert('Не удалось экспортировать в Excel');
    }
  };

  
  const handleExportWord = () => {
    try {
      
      let tableHTML = `
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="padding: 8px;">ID</th>
              <th style="padding: 8px;">Врач</th>
              <th style="padding: 8px;">День Недели</th>
              <th style="padding: 8px;">Начало</th>
              <th style="padding: 8px;">Конец</th>
            </tr>
          </thead>
          <tbody>
      `;

      filteredSchedules.forEach((sch) => {
        const docName = sch.Doctor
          ? `${sch.Doctor.firstName} ${sch.Doctor.lastName} (${sch.Doctor.specialization})`
          : 'Неизвестно';
        const dayName = [
          'Воскресенье',
          'Понедельник',
          'Вторник',
          'Среда',
          'Четверг',
          'Пятница',
          'Суббота',
        ][sch.dayOfWeek] || sch.dayOfWeek;

        tableHTML += `
          <tr>
            <td style="padding: 8px;">${sch.id}</td>
            <td style="padding: 8px;">${docName}</td>
            <td style="padding: 8px;">${dayName}</td>
            <td style="padding: 8px;">${sch.startTime}</td>
            <td style="padding: 8px;">${sch.endTime}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;

      
      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Расписание врачей</title>
          </head>
          <body>
            <h2>Расписание</h2>
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
      link.setAttribute('download', 'DoctorSchedule.doc');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте в Word:', error);
      alert('Не удалось экспортировать в Word');
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Управление Расписанием Врачей</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {/* Фильтр по врачу */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="doctorFilter">
                <Form.Label>Фильтр по врачу</Form.Label>
                <Form.Select value={filterDoctorId} onChange={handleFilterDoctor}>
                  <option value="">Все врачи</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.firstName} {doc.lastName} ({doc.specialization})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Фильтр по дню недели */}
            <Col md={4}>
              <Form.Group controlId="dayOfWeekFilter">
                <Form.Label>Фильтр по дню недели</Form.Label>
                <Form.Select value={filterDayOfWeek} onChange={handleFilterDayOfWeek}>
                  <option value="">Все дни</option>
                  <option value="1">Понедельник</option>
                  <option value="2">Вторник</option>
                  <option value="3">Среда</option>
                  <option value="4">Четверг</option>
                  <option value="5">Пятница</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="mb-3">
            <Button variant="primary" onClick={handleShowAddModal} className="me-2">
              Добавить Расписание
            </Button>
            <Button variant="outline-success" onClick={handleExportExcel} className="me-2">
              Экспорт в Excel
            </Button>
            {/* Кнопка экспорта в Word */}
            <Button variant="outline-info" onClick={handleExportWord}>
              Экспорт в Word
            </Button>
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Врач</th>
                <th>День Недели</th>
                <th>Начало</th>
                <th>Окончание</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.id}</td>
                  <td>
                    {schedule.Doctor
                      ? `${schedule.Doctor.firstName} ${schedule.Doctor.lastName} (${schedule.Doctor.specialization})`
                      : 'Неизвестно'}
                  </td>
                  <td>
                    {
                      [
                        'Воскресенье',
                        'Понедельник',
                        'Вторник',
                        'Среда',
                        'Четверг',
                        'Пятница',
                        'Суббота',
                      ][schedule.dayOfWeek]
                    }
                  </td>
                  <td>{schedule.startTime}</td>
                  <td>{schedule.endTime}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEditModal(schedule)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* Модальное окно для добавления расписания */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Добавить Расписание</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formErrors.length > 0 && (
            <Alert variant="danger">
              {formErrors.map((error, idx) => (
                <div key={idx}>{error.msg}</div>
              ))}
            </Alert>
          )}
          <Form onSubmit={handleAddSchedule}>
            <Form.Group controlId="formDoctorId" className="mb-3">
              <Form.Label>Врач</Form.Label>
              <Form.Select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">Выберите врача</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">Выберите врача из списка.</Form.Text>
            </Form.Group>

            <Form.Group controlId="formDayOfWeek" className="mb-3">
              <Form.Label>День Недели</Form.Label>
              <Form.Select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                required
              >
                <option value="">Выберите день недели</option>
                <option value="1">Понедельник</option>
                <option value="2">Вторник</option>
                <option value="3">Среда</option>
                <option value="4">Четверг</option>
                <option value="5">Пятница</option>
                <option value="6">Суббота</option>
                <option value="0">Воскресенье</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId="formStartTime" className="mb-3">
                  <Form.Label>Время Начала</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEndTime" className="mb-3">
                  <Form.Label>Время Окончания</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit">
              Сохранить
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Модальное окно для редактирования расписания */}
      <Modal show={showEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать Расписание</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formErrors.length > 0 && (
            <Alert variant="danger">
              {formErrors.map((error, idx) => (
                <div key={idx}>{error.msg}</div>
              ))}
            </Alert>
          )}
          <Form onSubmit={handleEditSchedule}>
            <Form.Group controlId="formDoctorId" className="mb-3">
              <Form.Label>Врач</Form.Label>
              <Form.Select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">Выберите врача</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">Выберите врача из списка.</Form.Text>
            </Form.Group>

            <Form.Group controlId="formDayOfWeek" className="mb-3">
              <Form.Label>День Недели</Form.Label>
              <Form.Select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                required
              >
                <option value="">Выберите день недели</option>
                <option value="1">Понедельник</option>
                <option value="2">Вторник</option>
                <option value="3">Среда</option>
                <option value="4">Четверг</option>
                <option value="5">Пятница</option>
                <option value="6">Суббота</option>
                <option value="0">Воскресенье</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId="formStartTime" className="mb-3">
                  <Form.Label>Время Начала</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEndTime" className="mb-3">
                  <Form.Label>Время Окончания</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit">
              Обновить
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDoctorSchedule;
