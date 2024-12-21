// src/App.js

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import AuthForm from './components/AuthForm';
import Home from './components/Home';
import DepartmentManagement from './components/DepartmentManagement';
import ServiceManagement from './components/ServiceManagement';
import ProtectedRouteAdmin from './components/protected/ProtectedRouteAdmin';
import ProtectedRoutePatient from './components/protected/ProtectedRoutePatient';
import ProtectedRouteDoctor from './components/protected/ProtectedRouteDoctor';
import { auth as adminAuth } from './redux/slices/adminSlice';
import { auth as doctorAuth } from './redux/slices/doctorSlice';
import { auth as patientAuth } from './redux/slices/patientSlice'; // Импортируйте auth для patient

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role === 'admin') {
      dispatch(adminAuth()); // Авторизация админа
    } else if (token && role === 'doctor') {
      dispatch(doctorAuth()); // Авторизация доктора
    } else if (token && role === 'patient') {
      dispatch(patientAuth()); // Авторизация пациента
    }
    // Если нужна логика для других ролей, добавьте аналогично
  }, [dispatch]);

  return (
    <Router>
      <Header />
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route
            path="/departments"
            element={
              <ProtectedRouteAdmin>
                <DepartmentManagement />
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRouteAdmin>
                <ServiceManagement />
              </ProtectedRouteAdmin>
            }
          />
          {/* Другие маршруты */}
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
