// src/redux/slices/patientSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

// Асинхронные действия

// Регистрация нового пациента
export const registration = createAsyncThunk(
    'patient/registration',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/patients/registration', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data; // Ожидаем, что бэкенд вернёт { patient: {...}, token: '...' }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Вход пациента
export const login = createAsyncThunk(
    'patient/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post('/patients/login', credentials);
            return response.data; // Ожидаем, что бэкенд вернёт { patient: {...}, token: '...' }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Аутентификация пациента
export const auth = createAsyncThunk(
    'patient/auth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/patients/auth');
            return response.data; // Ожидаем, что бэкенд вернёт { patient: {...} }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Получение всех пациентов
export const fetchAllPatients = createAsyncThunk(
    'patient/fetchAllPatients',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/patients');
            return response.data; 
            // Предположим, что бэкенд возвращает { patients: [...] }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Получение пациента по ID
export const fetchPatientById = createAsyncThunk(
    'patient/fetchPatientById',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/patients/${patientId}`);
            return response.data; 
            // Предположим, что бэкенд возвращает { patient: {...} }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Обновление данных пациента
export const updatePatient = createAsyncThunk(
    'patient/updatePatient',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            // Добавляем все поля из updatedData в formData
            Object.keys(updatedData).forEach(key => {
                formData.append(key, updatedData[key]);
            });

            const response = await axios.put(`/patients/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data; // Ожидаем { patient: {...} }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Удаление пациента
export const deletePatient = createAsyncThunk(
    'patient/deletePatient',
    async (patientId, { rejectWithValue }) => {
        try {
            await axios.delete(`/patients/${patientId}`);
            return patientId; // Возвращаем сам ID, чтобы удалить из стейта
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Начальное состояние
const initialState = {
    patient: null,       // Текущий пациент (для аутентифицированного пользователя)
    patients: [],        // Список всех пациентов
    status: 'idle',      // Статус запроса: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Создание слайса
const patientSlice = createSlice({
    name: 'patient',
    initialState,
    reducers: {
        // Действие для выхода из системы
        logout: (state) => {
            state.patient = null;
            state.status = 'idle';
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('patientId'); // <-- Удаляем patientId тоже
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    extraReducers: (builder) => {
        builder
            // Регистрация пациента
            .addCase(registration.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registration.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // action.payload = { patient: {...}, token: '...' }
                const { patient, token } = action.payload;
                state.patient = patient;
                localStorage.setItem('token', token);
                localStorage.setItem('role', 'patient');
                localStorage.setItem('patientId', patient.id); // <<--- ВАЖНО!
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            })
            .addCase(registration.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Вход (логин) пациента
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // action.payload = { patient: {...}, token: '...' }
                const { patient, token } = action.payload;
                state.patient = patient;
                localStorage.setItem('token', token);
                localStorage.setItem('role', 'patient');
                localStorage.setItem('patientId', patient.id); // <<--- ВАЖНО!
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Аутентификация пациента
            .addCase(auth.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(auth.fulfilled, (state, action) => {
                // action.payload = { patient: {...} }
                state.status = 'succeeded';
                state.patient = action.payload.patient;
            })
            .addCase(auth.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
                state.patient = null;
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('patientId'); // Удаляем
                delete axios.defaults.headers.common['Authorization'];
            })

            // Получение всех пациентов
            .addCase(fetchAllPatients.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllPatients.fulfilled, (state, action) => {
                // Предположим, что бэкенд вернет: { patients: [...] }
                state.status = 'succeeded';
                state.patients = action.payload.patients;
            })
            .addCase(fetchAllPatients.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Получение пациента по ID
            .addCase(fetchPatientById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPatientById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const patient = action.payload.patient;
                const existingPatient = state.patients.find((p) => p.id === patient.id);
                if (existingPatient) {
                    Object.assign(existingPatient, patient);
                } else {
                    state.patients.push(patient);
                }
            })
            .addCase(fetchPatientById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Обновление данных пациента
            .addCase(updatePatient.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updatePatient.fulfilled, (state, action) => {
                // action.payload = { patient: {...} }
                state.status = 'succeeded';
                state.patient = action.payload.patient;
                const index = state.patients.findIndex(p => p.id === action.payload.patient.id);
                if (index !== -1) {
                    state.patients[index] = action.payload.patient;
                }
            })
            .addCase(updatePatient.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Удаление пациента
            .addCase(deletePatient.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deletePatient.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // action.payload = patientId (число)
                if (state.patient && state.patient.id === action.payload) {
                    state.patient = null;
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('patientId');
                    delete axios.defaults.headers.common['Authorization'];
                }
                state.patients = state.patients.filter(p => p.id !== action.payload);
            })
            .addCase(deletePatient.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

// Селекторы
export const selectIsAuth = (state) => Boolean(state.patient.patient);
export const selectCurrentPatient = (state) => state.patient.patient;
export const selectAllPatients = (state) => state.patient.patients;
export const selectPatientStatus = (state) => state.patient.status;
export const selectPatientError = (state) => state.patient.error;

// Экспорт действий и редьюсера
export const { logout } = patientSlice.actions;
export default patientSlice.reducer;
