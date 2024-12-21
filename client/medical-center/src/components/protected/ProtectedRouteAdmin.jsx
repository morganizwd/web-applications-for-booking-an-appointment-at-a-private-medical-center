import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuth, selectCurrentAdmin } from '../../redux/slices/adminSlice';

function ProtectedRouteAdmin({ children }) {
    const isAuth = useSelector(selectIsAuth);
    const admin = useSelector(selectCurrentAdmin);

    if (!isAuth || !admin) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}

export default ProtectedRouteAdmin;
