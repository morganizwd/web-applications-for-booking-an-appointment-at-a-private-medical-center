import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuth, selectCurrentDoctor } from '../../redux/slices/doctorSlice';

function ProtectedRouteDoctor({ children }) {
    const isAuth = useSelector(selectIsAuth);
    const doctor = useSelector(selectCurrentDoctor);

    if (!isAuth || !doctor) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}

export default ProtectedRouteDoctor;
