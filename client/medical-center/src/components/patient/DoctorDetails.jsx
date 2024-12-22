import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  Spinner,
  Alert,
  Row,
  Col,
  Button,
  Table,
  Form,
} from 'react-bootstrap';
import axios from '../../redux/axios'; 

function DoctorDetails() {
  const { id } = useParams(); 

  
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [doctorError, setDoctorError] = useState(null);

  
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [schedulesError, setSchedulesError] = useState(null);

  
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  
  
  const [patientId] = useState(() => localStorage.getItem('patientId') || '');

  
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');

  
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке врача:', err);
        setDoctorError('Не удалось загрузить информацию о враче.');
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [id]);

  
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get('/doctor-schedules');
        setSchedules(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке расписаний:', err);
        setSchedulesError('Не удалось загрузить расписания.');
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, []);

  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('/services');
        setServices(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке услуг:', err);
        setServicesError('Не удалось загрузить услуги.');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  
  const doctorSchedules = schedules.filter((sch) => sch.doctorId === Number(id));

  
  const uniqueDays = Array.from(new Set(doctorSchedules.map((s) => s.dayOfWeek)));

  const dayNames = [
    'Воскресенье', 
    'Понедельник', 
    'Вторник',     
    'Среда',       
    'Четверг',     
    'Пятница',     
    'Суббота',     
  ];

  
  const timesInDay = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      timesInDay.push(`${hh}:${mm}:00`);
    }
  }

  
  const filteredTimes = timesInDay.filter((t) => {
    return doctorSchedules.some((sch) => {
      return (
        sch.dayOfWeek === Number(selectedDayOfWeek) &&
        sch.startTime <= t &&
        t < sch.endTime
      );
    });
  });

  
  function getNextDateByDayOfWeek(targetDayOfWeek) {
    const now = new Date();
    let day = now.getDate();
    const currentDayOfWeek = now.getDay(); 
    let offset = targetDayOfWeek - currentDayOfWeek;
    if (offset < 0) {
      offset += 7;
    }
    if (offset === 0) {
      offset = 7;
    }
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      day + offset,
      0,
      0,
      0,
      0
    );
  }

  
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!patientId) {
      setCreateError('Не найден ID пациента. Авторизуйтесь как пациент!');
      return;
    }
    if (!selectedDayOfWeek) {
      setCreateError('Выберите день недели.');
      return;
    }
    if (!selectedTime) {
      setCreateError('Выберите время.');
      return;
    }
    if (!selectedServiceId) {
      setCreateError('Выберите услугу.');
      return;
    }

    try {
      const dateObject = getNextDateByDayOfWeek(Number(selectedDayOfWeek));
      const [hours, minutes, seconds] = selectedTime.split(':');
      dateObject.setHours(Number(hours), Number(minutes), Number(seconds || 0), 0);
      const fullDateISO = dateObject.toISOString();

      
      const payload = {
        date: fullDateISO, 
        doctorId: Number(id),
        patientId: Number(patientId),
        serviceId: Number(selectedServiceId),
      };

      await axios.post('/appointments/create', payload);
      setCreateSuccess('Запись успешно создана!');

      
      setSelectedDayOfWeek('');
      setSelectedTime('');
      setSelectedServiceId('');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setCreateError(err.response.data.message);
      } else {
        setCreateError('Ошибка при создании записи на приём.');
      }
    }
  };

  

  
  if (loadingDoctor) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка врача...</span>
        </Spinner>
      </Container>
    );
  }
  if (doctorError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{doctorError}</Alert>
      </Container>
    );
  }
  if (!doctor) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Врач не найден.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Карточка врача */}
      <Card className="mb-4">
        <Row className="g-0">
          <Col md={4}>
            <Card.Img
              src={
                doctor.photo
                  ? `${axios.defaults.baseURL}${doctor.photo}`
                  : '/images/premium_photo-1658506671316-0b293df7c72b.png'
              }
              alt={`${doctor.firstName} ${doctor.lastName}`}
              style={{ objectFit: 'cover', height: '100%' }}
            />
          </Col>
          <Col md={8}>
            <Card.Body>
              <Card.Title>{doctor.firstName} {doctor.lastName}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                {doctor.specialization}
              </Card.Subtitle>
              <Card.Text>
                <strong>Отделение:</strong>{' '}
                {doctor.Department ? doctor.Department.name : 'Не указано'}
              </Card.Text>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      {/* Расписание */}
      <h4>Расписание</h4>
      {loadingSchedules ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка расписания...</span>
        </Spinner>
      ) : schedulesError ? (
        <Alert variant="danger">{schedulesError}</Alert>
      ) : doctorSchedules.length === 0 ? (
        <Alert variant="warning">У данного врача нет доступного расписания.</Alert>
      ) : (
        <Table bordered hover>
          <thead>
            <tr>
              <th>День Недели</th>
              <th>Начало</th>
              <th>Конец</th>
            </tr>
          </thead>
          <tbody>
            {doctorSchedules.map((sch) => {
              const dayName = dayNames[sch.dayOfWeek] || sch.dayOfWeek;
              return (
                <tr key={sch.id}>
                  <td>{dayName}</td>
                  <td>{sch.startTime}</td>
                  <td>{sch.endTime}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Услуги */}
      <h4 className="mt-4">Услуги</h4>
      {loadingServices ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка услуг...</span>
        </Spinner>
      ) : servicesError ? (
        <Alert variant="danger">{servicesError}</Alert>
      ) : services.length === 0 ? (
        <Alert variant="warning">Нет услуг.</Alert>
      ) : (
        <ul>
          {services.map((srv) => (
            <li key={srv.id}>
              {srv.name} (Цена: {srv.price} руб.)
            </li>
          ))}
        </ul>
      )}

      {/* Форма записи */}
      <h4 className="mt-4">Записаться на приём</h4>
      {createError && <Alert variant="danger">{createError}</Alert>}
      {createSuccess && <Alert variant="success">{createSuccess}</Alert>}

      <Form onSubmit={handleSubmitAppointment}>
        {/* Выбор дня недели */}
        <Form.Group className="mb-3">
          <Form.Label>День Недели</Form.Label>
          <Form.Select
            value={selectedDayOfWeek}
            onChange={(e) => {
              setSelectedDayOfWeek(e.target.value);
              setSelectedTime('');
            }}
          >
            <option value="">-- Выберите --</option>
            {uniqueDays.map((day) => (
              <option key={day} value={day}>
                {dayNames[day]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Выбор времени */}
        <Form.Group className="mb-3">
          <Form.Label>Время</Form.Label>
          <Form.Select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={!selectedDayOfWeek}
          >
            <option value="">-- Выберите --</option>
            {filteredTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Выбор услуги */}
        <Form.Group className="mb-3">
          <Form.Label>Выберите услугу</Form.Label>
          <Form.Select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">-- Выберите услугу --</option>
            {services.map((srv) => (
              <option key={srv.id} value={srv.id}>
                {srv.name} — {srv.price} руб.
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit">
          Подтвердить запись
        </Button>
      </Form>
    </Container>
  );
}

export default DoctorDetails;
