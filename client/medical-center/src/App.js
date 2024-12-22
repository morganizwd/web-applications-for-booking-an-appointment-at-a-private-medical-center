// src/App.js

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import Header from './components/extra/Header';
import AuthForm from './components/auth/AuthForm';
import Home from './components/patient/Home';
import DepartmentManagement from './components/admin/DepartmentManagement';
import ServiceManagement from './components/admin/ServiceManagement';
import ProtectedRouteAdmin from './components/protected/ProtectedRouteAdmin';
import ProtectedRoutePatient from './components/protected/ProtectedRoutePatient';
import ProtectedRouteDoctor from './components/protected/ProtectedRouteDoctor';
import Footer from './components/extra/Footer';
import PatientProfile from './components/patient/PatientProfile';
import DoctorDetails from './components/patient/DoctorDetails';
import AdminDoctorSchedule from './components/admin/AdminDoctorSchedule';
import DoctorDashboard from './components/doc/DoctorDashboard';
import AdminAppointments from './components/admin/AdminAppointments';
import AdminDashboard from './components/admin/UsersList'; 
import { auth as adminAuth } from './redux/slices/adminSlice';
import { auth as doctorAuth } from './redux/slices/doctorSlice';
import { auth as patientAuth } from './redux/slices/patientSlice';

function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (token && role === 'admin') {
        try {
          await dispatch(adminAuth()).unwrap();
        } catch (error) {
          console.error('Admin auth failed:', error);
        }
      } else if (token && role === 'doctor') {
        try {
          await dispatch(doctorAuth()).unwrap();
        } catch (error) {
          console.error('Doctor auth failed:', error);
        }
      } else if (token && role === 'patient') {
        try {
          await dispatch(patientAuth()).unwrap();
        } catch (error) {
          console.error('Patient auth failed:', error);
        }
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, [dispatch]);

  if (!authChecked) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route
          path='/doctors/:id'
          element={<DoctorDetails />}
        />
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
        <Route
          path="/admin-schedule"
          element={
            <ProtectedRouteAdmin>
              <AdminDoctorSchedule />
            </ProtectedRouteAdmin>
          }
        />
        <Route 
          path='/admin-users' 
          element={
            <ProtectedRouteAdmin>
              <AdminDashboard />
            </ProtectedRouteAdmin>
          } 
        />
        <Route 
          path='/admin-appointments' 
          element={
            <ProtectedRouteAdmin>
              <AdminAppointments />
            </ProtectedRouteAdmin>
          } 
        />
        <Route 
          path='/doctor-dashboard' 
          element={
            <ProtectedRouteDoctor>
              <DoctorDashboard />
            </ProtectedRouteDoctor>
          } 
        />
        <Route 
          path='/profile' 
          element={
            <ProtectedRoutePatient>
              <PatientProfile />
            </ProtectedRoutePatient>
          } 
        />
        {/* Другие маршруты */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
