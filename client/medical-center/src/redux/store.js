import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './slices/patientSlice';
import doctorReducer from './slices/doctorSlice';
import adminReducer from './slices/adminSlice';

const store = configureStore({
    reducer: {
        patient: patientReducer,
        doctor: doctorReducer,
        admin: adminReducer,
    },
});

export default store;