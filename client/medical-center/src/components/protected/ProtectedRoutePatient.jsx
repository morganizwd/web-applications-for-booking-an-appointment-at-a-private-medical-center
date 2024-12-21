import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuth, selectCurrentPatient } from '../../redux/slices/patientSlice';

function ProtectedRoutePatient({ children }) {
    const isAuth = useSelector(selectIsAuth);
    const patient = useSelector(selectCurrentPatient);

    if (!isAuth || !patient) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}

export default ProtectedRoutePatient;
