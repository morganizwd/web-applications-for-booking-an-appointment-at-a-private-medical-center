// src/components/AdminAppointments.jsx

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
import axios from '../../redux/axios'; // Ваш настроенный axios
import { nextDay, formatISO } from 'date-fns'; // Убедитесь, что установили date-fns: npm install date-fns

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Справочные данные (для выпадающих списков) ---
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]); // Расписания всех врачей

  // Модальные окна: добавление и редактирование
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Данные текущего appointment (для редактирования)
  const [currentAppointment, setCurrentAppointment] = useState(null);

  // Форма для добавления / редактирования
  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    serviceId: '',
    dayOfWeek: '',
    time: '',
  });

  // Ошибки валидации формы
  const [formErrors, setFormErrors] = useState([]);

  // Расписание выбранного врача
  const [selectedDoctorSchedules, setSelectedDoctorSchedules] = useState([]);

  // Сообщения об успехе и ошибках при добавлении/редактировании
  const [createSuccess, setCreateSuccess] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // ------ useEffect: Загрузка начальных данных ------
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    fetchServices();
    fetchSchedules();
  }, []);

  // Получаем список всех приёмов
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

  // Получаем врачей
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке врачей:', err);
    }
  };

  // Получаем пациентов
  const fetchPatients = async () => {
    try {
      const res = await axios.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке пациентов:', err);
    }
  };

  // Получаем услуги
  const fetchServices = async () => {
    try {
      const res = await axios.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке услуг:', err);
    }
  };

  // Получаем все расписания
  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/doctor-schedules');
      setSchedules(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке расписаний:', err);
    }
  };

  // ------ Функции открытия/закрытия модалок ------
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

    // Получаем расписание выбранного врача
    const doctorSchedules = schedules.filter(s => s.doctorId === appointment.doctorId);
    setSelectedDoctorSchedules(doctorSchedules);

    // Parse the appointment's date to get dayOfWeek and time
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

  // ------ Обработчики изменения формы ------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Если изменяется врач, обновляем расписание
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

    // Если изменяется dayOfWeek, сбрасываем время
    if (name === 'dayOfWeek') {
      setFormData(prev => ({
        ...prev,
        time: '',
      }));
    }
  };

  // ------ Добавление приёма ------
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setCreateSuccess('');

    const { doctorId, patientId, serviceId, dayOfWeek, time } = formData;

    // Валидация на клиенте
    if (!doctorId || !patientId || !serviceId || !dayOfWeek || !time) {
      setFormErrors([{ msg: 'Все поля обязательны для заполнения.' }]);
      return;
    }

    // Проверка, что выбранный день и время соответствуют расписанию врача
    const doctorSchedules = schedules.filter(s => s.doctorId === parseInt(doctorId, 10));
    const matchingSchedule = doctorSchedules.find(s => s.dayOfWeek === parseInt(dayOfWeek, 10)
      && s.startTime <= time
      && time < s.endTime
    );

    if (!matchingSchedule) {
      setFormErrors([{ msg: 'Выбранное время не соответствует расписанию врача.' }]);
      return;
    }

    // Формирование даты записи
    const appointmentDate = getNextDateByDayOfWeek(parseInt(dayOfWeek, 10), time);
    const fullDateISO = formatISO(appointmentDate); // "YYYY-MM-DDTHH:mm:ss±HH:MM"

    console.log('Формируемая дата для записи:', fullDateISO); // Для отладки

    try {
      // Проверяем конфликт
      const conflict = await axios.get('/appointments', {
        params: {
          doctorId,
          date: fullDateISO,
        }
      });

      console.log('Ответ на проверку конфликта:', conflict.data); // Для отладки

      if (conflict.data.length > 0) {
        setFormErrors([{ msg: 'Врач уже занят в выбранное время.' }]);
        return;
      }

      // Создаём приём
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

  // ------ Редактирование приёма ------
  const handleEditAppointment = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setEditSuccess('');

    const { doctorId, patientId, serviceId, dayOfWeek, time } = formData;

    // Валидация на клиенте
    if (!doctorId || !patientId || !serviceId || !dayOfWeek || !time) {
      setFormErrors([{ msg: 'Все поля обязательны для заполнения.' }]);
      return;
    }

    // Проверка, что выбранный день и время соответствуют расписанию врача
    const doctorSchedules = schedules.filter(s => s.doctorId === parseInt(doctorId, 10));
    const matchingSchedule = doctorSchedules.find(s => s.dayOfWeek === parseInt(dayOfWeek, 10)
      && s.startTime <= time
      && time < s.endTime
    );

    if (!matchingSchedule) {
      setFormErrors([{ msg: 'Выбранное время не соответствует расписанию врача.' }]);
      return;
    }

    // Формирование даты записи
    const appointmentDate = getNextDateByDayOfWeek(parseInt(dayOfWeek, 10), time);
    const fullDateISO = formatISO(appointmentDate); // "YYYY-MM-DDTHH:mm:ss±HH:MM"

    console.log('Формируемая дата для редактирования:', fullDateISO); // Для отладки

    try {
      // Проверяем конфликт, исключая текущий приём
      const conflict = await axios.get('/appointments', {
        params: {
          doctorId,
          date: fullDateISO,
          excludeId: currentAppointment.id,
        }
      });

      console.log('Ответ на проверку конфликта при редактировании:', conflict.data); // Для отладки

      if (conflict.data.length > 0) {
        setFormErrors([{ msg: 'Врач уже занят в выбранное время.' }]);
        return;
      }

      // Обновляем приём
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

  // ------ Удаление приёма ------
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

  // ------ Получение расписаний для выбранного врача ------
  const getSchedulesForDoctor = (doctorId) => {
    return schedules.filter(s => s.doctorId === parseInt(doctorId, 10));
  };

  // Функция: получаем ближайшую дату (в пределах 7 дней) для dayOfWeek
  function getNextDateByDayOfWeek(targetDayOfWeek, time) {
    const now = new Date();
    const nextDate = nextDay(now, targetDayOfWeek);
    const [hours, minutes] = time.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  }

  // Преобразование дня недели числа в строку
  const dayNames = [
    'Воскресенье', // 0
    'Понедельник', // 1
    'Вторник',     // 2
    'Среда',       // 3
    'Четверг',     // 4
    'Пятница',     // 5
    'Суббота',     // 6
  ];

  // Функция для генерации временных слотов
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

  // Функция для форматирования времени
  function formatTime(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hours + 11) % 12 + 1);
    return `${formattedHour}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  // --- Рендер ---
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
          <div className="mb-3">
            <Button variant="primary" onClick={handleShowAddModal}>
              Добавить Приём
            </Button>
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
                  // Получаем все доступные интервалы для выбранного дня
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
                  // Получаем все доступные интервалы для выбранного дня
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

// Функция для генерации временных слотов
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

// Функция для форматирования времени
function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = ((hours + 11) % 12 + 1);
  return `${formattedHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export default AdminAppointments;
