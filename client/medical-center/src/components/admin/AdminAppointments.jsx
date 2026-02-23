import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
} from 'react-bootstrap';
import axios from '../../redux/axios'; 
import { nextDay, formatISO } from 'date-fns'; 

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]); 

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  
  const [currentAppointment, setCurrentAppointment] = useState(null);

  
  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    serviceId: '',
    dayOfWeek: '',
    time: '',
  });

  
  const [formErrors, setFormErrors] = useState([]);

  
  const [selectedDoctorSchedules, setSelectedDoctorSchedules] = useState([]);

  
  const [createSuccess, setCreateSuccess] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    fetchServices();
    fetchSchedules();
  }, []);

  
  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/appointments');
      setAppointments(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке приёмов:', err);
      setError('Не удалось загрузить список приёмов.');
      setLoading(false);
    }
  };

  
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке врачей:', err);
    }
  };

  
  const fetchPatients = async () => {
    try {
      const res = await axios.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке пациентов:', err);
    }
  };

  
  const fetchServices = async () => {
    try {
      const res = await axios.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке услуг:', err);
    }
  };

  
  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/doctor-schedules');
      setSchedules(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке расписаний:', err);
    }
  };

  
  const handleShowAddModal = () => {
    setFormData({
      doctorId: '',
      patientId: '',
      serviceId: '',
      dayOfWeek: '',
      time: '',
    });
    setFormErrors([]);
    setSelectedDoctorSchedules([]);
    setCreateSuccess('');
    setShowAddModal(true);
  };

  const handleShowEditModal = (appointment) => {
    setCurrentAppointment(appointment);
    setFormErrors([]);
    setEditSuccess('');

    
    const doctorSchedules = schedules.filter(s => s.doctorId === appointment.doctorId);
    setSelectedDoctorSchedules(doctorSchedules);

    
    const date = new Date(appointment.date);
    const dayOfWeek = date.getDay();
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;

    setFormData({
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      serviceId: appointment.serviceId,
      dayOfWeek: dayOfWeek.toString(),
      time: time,
    });

    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentAppointment(null);
    setSelectedDoctorSchedules([]);
    setFormErrors([]);
    setCreateSuccess('');
    setEditSuccess('');
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    
    if (name === 'doctorId') {
      const doctorId = parseInt(value, 10);
      if (doctorId) {
        const doctorSchedules = schedules.filter(s => s.doctorId === doctorId);
        setSelectedDoctorSchedules(doctorSchedules);
        setFormData(prev => ({
          ...prev,
          dayOfWeek: '',
          time: '',
        }));
      } else {
        setSelectedDoctorSchedules([]);
        setFormData(prev => ({
          ...prev,
          dayOfWeek: '',
          time: '',
        }));
      }
    }

    
    if (name === 'dayOfWeek') {
      setFormData(prev => ({
        ...prev,
        time: '',
      }));
    }
  };

  
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setCreateSuccess('');

    const { doctorId, patientId, serviceId, dayOfWeek, time } = formData;

    
    if (!doctorId || !patientId || !serviceId || !dayOfWeek || !time) {
      setFormErrors([{ msg: 'Все поля обязательны для заполнения.' }]);
      return;
    }

    
    const doctorSchedules = schedules.filter(s => s.doctorId === parseInt(doctorId, 10));
    const matchingSchedule = doctorSchedules.find(s => s.dayOfWeek === parseInt(dayOfWeek, 10)
      && s.startTime <= time
      && time < s.endTime
    );

    if (!matchingSchedule) {
      setFormErrors([{ msg: 'Выбранное время не соответствует расписанию врача.' }]);
      return;
    }

    
    const appointmentDate = getNextDateByDayOfWeek(parseInt(dayOfWeek, 10), time);
    const fullDateISO = formatISO(appointmentDate); 

    console.log('Формируемая дата для записи:', fullDateISO); 

    try {
      
      const conflict = await axios.get('/appointments', {
        params: {
          doctorId,
          date: fullDateISO,
        }
      });

      console.log('Ответ на проверку конфликта:', conflict.data); 

      if (conflict.data.length > 0) {
        setFormErrors([{ msg: 'Врач уже занят в выбранное время.' }]);
        return;
      }

      
      const res = await axios.post('/appointments/create', {
        date: fullDateISO, 
        doctorId: parseInt(doctorId, 10),
        patientId: parseInt(patientId, 10),
        serviceId: parseInt(serviceId, 10),
      });

      setAppointments(prev => [...prev, res.data]);
      setCreateSuccess('Запись успешно создана!');
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка при добавлении приёма:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          setFormErrors(err.response.data.errors);
        } else if (err.response.data.message) {
          setFormErrors([{ msg: err.response.data.message }]);
        } else {
          setFormErrors([{ msg: 'Неизвестная ошибка' }]);
        }
      } else {
        setFormErrors([{ msg: 'Ошибка при запросе' }]);
      }
    }
  };

  
  const handleEditAppointment = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setEditSuccess('');

    const { doctorId, patientId, serviceId, dayOfWeek, time } = formData;

    
    if (!doctorId || !patientId || !serviceId || !dayOfWeek || !time) {
      setFormErrors([{ msg: 'Все поля обязательны для заполнения.' }]);
      return;
    }

    
    const doctorSchedules = schedules.filter(s => s.doctorId === parseInt(doctorId, 10));
    const matchingSchedule = doctorSchedules.find(s => s.dayOfWeek === parseInt(dayOfWeek, 10)
      && s.startTime <= time
      && time < s.endTime
    );

    if (!matchingSchedule) {
      setFormErrors([{ msg: 'Выбранное время не соответствует расписанию врача.' }]);
      return;
    }

    
    const appointmentDate = getNextDateByDayOfWeek(parseInt(dayOfWeek, 10), time);
    const fullDateISO = formatISO(appointmentDate); 

    console.log('Формируемая дата для редактирования:', fullDateISO); 

    try {
      
      const conflict = await axios.get('/appointments', {
        params: {
          doctorId,
          date: fullDateISO,
          excludeId: currentAppointment.id,
        }
      });

      console.log('Ответ на проверку конфликта при редактировании:', conflict.data); 

      if (conflict.data.length > 0) {
        setFormErrors([{ msg: 'Врач уже занят в выбранное время.' }]);
        return;
      }

      
      const res = await axios.put(`/appointments/${currentAppointment.id}`, {
        date: fullDateISO,
        doctorId: parseInt(doctorId, 10),
        patientId: parseInt(patientId, 10),
        serviceId: parseInt(serviceId, 10),
      });

      setAppointments(prev =>
        prev.map(a => (a.id === currentAppointment.id ? res.data : a))
      );
      setEditSuccess('Запись успешно обновлена!');
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка при редактировании приёма:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          setFormErrors(err.response.data.errors);
        } else if (err.response.data.message) {
          setFormErrors([{ msg: err.response.data.message }]);
        } else {
          setFormErrors([{ msg: 'Неизвестная ошибка' }]);
        }
      } else {
        setFormErrors([{ msg: 'Ошибка при запросе' }]);
      }
    }
  };

  
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить приём?')) return;

    try {
      await axios.delete(`/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении приёма:', err);
      setError('Не удалось удалить приём.');
    }
  };

  // Экспорт в Excel
  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const response = await axios.get('/reports/export-appointments', {
        params: { format: 'excel' },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка экспорта в Excel:', err);
      setError('Не удалось экспортировать данные в Excel.');
    } finally {
      setExportLoading(false);
    }
  };

  // Экспорт в Word
  const handleExportWord = async () => {
    setExportLoading(true);
    try {
      const response = await axios.get('/reports/export-appointments', {
        params: { format: 'word' },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка экспорта в Word:', err);
      setError('Не удалось экспортировать данные в Word.');
    } finally {
      setExportLoading(false);
    }
  };

  
  const getSchedulesForDoctor = (doctorId) => {
    return schedules.filter(s => s.doctorId === parseInt(doctorId, 10));
  };

  
  function getNextDateByDayOfWeek(targetDayOfWeek, time) {
    const now = new Date();
    const nextDate = nextDay(now, targetDayOfWeek);
    const [hours, minutes] = time.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  }

  
  const dayNames = [
    'Воскресенье', 
    'Понедельник', 
    'Вторник',     
    'Среда',       
    'Четверг',     
    'Пятница',     
    'Суббота',     
  ];

  
  function generateTimeSlots(startTime, endTime, interval) {
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    let current = new Date();
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    while (current < end) {
      const hours = String(current.getHours()).padStart(2, '0');
      const minutes = String(current.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${minutes}:00`);
      current.setMinutes(current.getMinutes() + interval);
    }

    return slots;
  }

  
  function formatTime(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hours + 11) % 12 + 1);
    return `${formattedHour}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  
  return (
    <Container className="mt-5">
      <h2>Управление Приёмами</h2>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <Button variant="primary" onClick={handleShowAddModal}>
              Добавить Приём
            </Button>
            <div>
              <Button 
                variant="success" 
                className="me-2"
                onClick={handleExportExcel}
                disabled={appointments.length === 0 || exportLoading}
              >
                {exportLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Экспорт...
                  </>
                ) : (
                  '📊 Экспорт в Excel'
                )}
              </Button>
              <Button 
                variant="info" 
                onClick={handleExportWord}
                disabled={appointments.length === 0 || exportLoading}
              >
                {exportLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Экспорт...
                  </>
                ) : (
                  '📄 Экспорт в Word'
                )}
              </Button>
            </div>
          </div>

          <Table bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата/Время</th>
                <th>Врач</th>
                <th>Пациент</th>
                <th>Услуга</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td>{appt.id}</td>
                  <td>{new Date(appt.date).toLocaleString()}</td>
                  <td>
                    {appt.Doctor
                      ? `${appt.Doctor.firstName} ${appt.Doctor.lastName} (${appt.Doctor.specialization})`
                      : '—'}
                  </td>
                  <td>
                    {appt.Patient
                      ? `${appt.Patient.firstName} ${appt.Patient.lastName} (тел: ${appt.Patient.phoneNumber})`
                      : '—'}
                  </td>
                  <td>
                    {appt.Service
                      ? `${appt.Service.name} (${appt.Service.price} руб.)`
                      : '—'}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEditModal(appt)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appt.id)}
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

      {/* ---- Модальное окно для добавления ---- */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Добавить Приём</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formErrors.length > 0 && (
            <Alert variant="danger">
              {formErrors.map((err, i) => (
                <div key={i}>{err.msg}</div>
              ))}
            </Alert>
          )}
          {createSuccess && (
            <Alert variant="success">
              {createSuccess}
            </Alert>
          )}

          <Form onSubmit={handleAddAppointment}>
            {/* Выбираем врача из списка */}
            <Form.Group className="mb-3">
              <Form.Label>Врач</Form.Label>
              <Form.Select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите врача --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.firstName} {doc.lastName} ({doc.specialization})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Отображение расписания выбранного врача */}
            {formData.doctorId && selectedDoctorSchedules.length > 0 && (
              <Alert variant="info">
                <strong>Расписание врача:</strong>
                <ul className="mb-0">
                  {selectedDoctorSchedules.map(sch => (
                    <li key={sch.id}>
                      {dayNames[sch.dayOfWeek]}: {sch.startTime.slice(0,5)} - {sch.endTime.slice(0,5)}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Выбираем день недели после выбора врача */}
            <Form.Group className="mb-3">
              <Form.Label>День Недели</Form.Label>
              <Form.Select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                disabled={!formData.doctorId}
                required
              >
                <option value="">-- Выберите день недели --</option>
                {selectedDoctorSchedules.length > 0 && (
                  Array.from(new Set(selectedDoctorSchedules.map(s => s.dayOfWeek)))
                    .sort((a, b) => a - b)
                    .map(day => (
                      <option key={day} value={day}>
                        {dayNames[day]}
                      </option>
                    ))
                )}
              </Form.Select>
            </Form.Group>

            {/* Выбираем время после выбора дня недели */}
            <Form.Group className="mb-3">
              <Form.Label>Время</Form.Label>
              <Form.Select
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={!formData.dayOfWeek}
                required
              >
                <option value="">-- Выберите время --</option>
                {formData.dayOfWeek && selectedDoctorSchedules.length > 0 && (
                  
                  selectedDoctorSchedules
                    .filter(s => s.dayOfWeek === parseInt(formData.dayOfWeek, 10))
                    .map(sch => {
                      const times = generateTimeSlots(sch.startTime, sch.endTime, 30);
                      return times.map(time => (
                        <option key={time} value={time}>
                          {formatTime(time)}
                        </option>
                      ));
                    })
                    .flat()
                )}
              </Form.Select>
            </Form.Group>

            {/* Список пациентов */}
            <Form.Group className="mb-3">
              <Form.Label>Пациент</Form.Label>
              <Form.Select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите пациента --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} (ID: {p.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Список услуг */}
            <Form.Group className="mb-3">
              <Form.Label>Услуга</Form.Label>
              <Form.Select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите услугу --</option>
                {services.map(srv => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} (Цена: {srv.price} руб.)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
              Сохранить
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ---- Модальное окно для редактирования ---- */}
      <Modal show={showEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать Приём</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formErrors.length > 0 && (
            <Alert variant="danger">
              {formErrors.map((err, i) => (
                <div key={i}>{err.msg}</div>
              ))}
            </Alert>
          )}
          {editSuccess && (
            <Alert variant="success">
              {editSuccess}
            </Alert>
          )}

          <Form onSubmit={handleEditAppointment}>
            {/* Выбираем врача из списка */}
            <Form.Group className="mb-3">
              <Form.Label>Врач</Form.Label>
              <Form.Select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите врача --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.firstName} {doc.lastName} ({doc.specialization})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Отображение расписания выбранного врача */}
            {formData.doctorId && selectedDoctorSchedules.length > 0 && (
              <Alert variant="info">
                <strong>Расписание врача:</strong>
                <ul className="mb-0">
                  {selectedDoctorSchedules.map(sch => (
                    <li key={sch.id}>
                      {dayNames[sch.dayOfWeek]}: {sch.startTime.slice(0,5)} - {sch.endTime.slice(0,5)}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Выбираем день недели после выбора врача */}
            <Form.Group className="mb-3">
              <Form.Label>День Недели</Form.Label>
              <Form.Select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                disabled={!formData.doctorId}
                required
              >
                <option value="">-- Выберите день недели --</option>
                {selectedDoctorSchedules.length > 0 && (
                  Array.from(new Set(selectedDoctorSchedules.map(s => s.dayOfWeek)))
                    .sort((a, b) => a - b)
                    .map(day => (
                      <option key={day} value={day}>
                        {dayNames[day]}
                      </option>
                    ))
                )}
              </Form.Select>
            </Form.Group>

            {/* Выбираем время после выбора дня недели */}
            <Form.Group className="mb-3">
              <Form.Label>Время</Form.Label>
              <Form.Select
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={!formData.dayOfWeek}
                required
              >
                <option value="">-- Выберите время --</option>
                {formData.dayOfWeek && selectedDoctorSchedules.length > 0 && (
                  
                  selectedDoctorSchedules
                    .filter(s => s.dayOfWeek === parseInt(formData.dayOfWeek, 10))
                    .map(sch => {
                      const times = generateTimeSlots(sch.startTime, sch.endTime, 30);
                      return times.map(time => (
                        <option key={time} value={time}>
                          {formatTime(time)}
                        </option>
                      ));
                    })
                    .flat()
                )}
              </Form.Select>
            </Form.Group>

            {/* Список пациентов */}
            <Form.Group className="mb-3">
              <Form.Label>Пациент</Form.Label>
              <Form.Select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите пациента --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} (ID: {p.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Список услуг */}
            <Form.Group className="mb-3">
              <Form.Label>Услуга</Form.Label>
              <Form.Select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите услугу --</option>
                {services.map(srv => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} (Цена: {srv.price} руб.)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
              Обновить
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}


function generateTimeSlots(startTime, endTime, interval) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  let current = new Date();
  current.setHours(startHour, startMinute, 0, 0);

  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  while (current < end) {
    const hours = String(current.getHours()).padStart(2, '0');
    const minutes = String(current.getMinutes()).padStart(2, '0');
    slots.push(`${hours}:${minutes}:00`);
    current.setMinutes(current.getMinutes() + interval);
  }

  return slots;
}


function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = ((hours + 11) % 12 + 1);
  return `${formattedHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export default AdminAppointments;
