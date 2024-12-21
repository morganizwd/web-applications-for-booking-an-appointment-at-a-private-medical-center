// src/redux/slices/doctorSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

// Асинхронные действия

// Регистрация нового доктора
export const registration = createAsyncThunk(
    'doctor/registration',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/doctors/registration', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Вход доктора
export const login = createAsyncThunk(
    'doctor/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post('/doctors/login', credentials);
            return response.data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Аутентификация текущего доктора
export const auth = createAsyncThunk(
    'doctor/auth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/doctors/auth');
            return response.data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Получение всех докторов
export const fetchAllDoctors = createAsyncThunk(
    'doctor/fetchAllDoctors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/doctors');
            return response.data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Получение доктора по ID
export const fetchDoctorById = createAsyncThunk(
    'doctor/fetchDoctorById',
    async (doctorId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/doctors/${doctorId}`);
            return response.data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Обновление данных доктора
export const updateDoctor = createAsyncThunk(
    'doctor/updateDoctor',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            // Добавляем все поля из updatedData в formData
            Object.keys(updatedData).forEach(key => {
                formData.append(key, updatedData[key]);
            });

            const response = await axios.put(`/doctors/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

// Удаление доктора
export const deleteDoctor = createAsyncThunk(
    'doctor/deleteDoctor',
    async (doctorId, { rejectWithValue }) => {
        try {
            await axios.delete(`/doctors/${doctorId}`);
            return doctorId;
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
    doctor: null,       // Текущий доктор (для аутентифицированного пользователя)
    doctors: [],        // Список всех докторов
    status: 'idle',     // Статус запроса: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Создание слайса
const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        // Действие для выхода из системы
        logout: (state) => {
            state.doctor = null;
            state.status = 'idle';
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    extraReducers: (builder) => {
        builder
            // Регистрация доктора
            .addCase(registration.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registration.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.doctor = action.payload.doctor;
                localStorage.setItem('token', action.payload.token);
                // Сохраняем 'doctor'
                localStorage.setItem('role', 'doctor');
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(registration.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Вход доктора
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.doctor = action.payload; // Вместо action.payload.doctor
                console.log('Login fulfilled, doctor:', action.payload); // Добавьте эту строку
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', 'doctor');
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })           
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Аутентификация доктора
            .addCase(auth.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(auth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.doctor = action.payload; // Вместо action.payload.doctor
                console.log('Auth fulfilled, doctor:', action.payload); // Добавьте эту строку
            })
            .addCase(auth.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Получение всех докторов
            .addCase(fetchAllDoctors.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllDoctors.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.doctors = action.payload.doctors;
            })
            .addCase(fetchAllDoctors.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Получение доктора по ID
            .addCase(fetchDoctorById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDoctorById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const doctor = action.payload.doctor;
                const existingDoctor = state.doctors.find((d) => d.id === doctor.id);
                if (existingDoctor) {
                    Object.assign(existingDoctor, doctor);
                } else {
                    state.doctors.push(doctor);
                }
            })
            .addCase(fetchDoctorById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Обновление данных доктора
            .addCase(updateDoctor.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateDoctor.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.doctor = action.payload.doctor;
                // Обновляем доктора в списке, если он там есть
                const index = state.doctors.findIndex(d => d.id === action.payload.doctor.id);
                if (index !== -1) {
                    state.doctors[index] = action.payload.doctor;
                }
            })
            .addCase(updateDoctor.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Удаление доктора
            .addCase(deleteDoctor.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteDoctor.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Если удаляем текущего доктора
                if (state.doctor && state.doctor.id === action.payload) {
                    state.doctor = null;
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
                // Удаляем доктора из списка
                state.doctors = state.doctors.filter(d => d.id !== action.payload);
            })
            .addCase(deleteDoctor.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

// Селекторы
export const selectIsAuth = (state) => Boolean(state.doctor.doctor);
export const selectCurrentDoctor = (state) => state.doctor.doctor;
export const selectAllDoctors = (state) => state.doctor.doctors;
export const selectDoctorStatus = (state) => state.doctor.status;
export const selectDoctorError = (state) => state.doctor.error;

// Экспорт действий и редьюсера
export const { logout } = doctorSlice.actions;
export default doctorSlice.reducer;
