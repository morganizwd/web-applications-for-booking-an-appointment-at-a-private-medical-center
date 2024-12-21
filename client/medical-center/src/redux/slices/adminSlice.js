// src/redux/slices/adminSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

// Асинхронные действия

// Регистрация нового администратора
export const registration = createAsyncThunk(
    'admin/registration',
    async (adminData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/admins/registration', adminData);
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

// Вход администратора
export const login = createAsyncThunk(
    'admin/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post('/admins/login', credentials);
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

// Аутентификация текущего администратора
export const auth = createAsyncThunk(
    'admin/auth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/admins/auth');
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

// Получение всех администраторов
export const fetchAllAdmins = createAsyncThunk(
    'admin/fetchAllAdmins',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/admins');
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

// Получение администратора по ID
export const fetchAdminById = createAsyncThunk(
    'admin/fetchAdminById',
    async (adminId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/admins/${adminId}`);
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

// Обновление данных администратора
export const updateAdmin = createAsyncThunk(
    'admin/updateAdmin',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/admins/${id}`, updatedData);
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

// Удаление администратора
export const deleteAdmin = createAsyncThunk(
    'admin/deleteAdmin',
    async (adminId, { rejectWithValue }) => {
        try {
            await axios.delete(`/admins/${adminId}`);
            return adminId;
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
    admin: null,        // Текущий администратор (для аутентифицированного пользователя)
    admins: [],         // Список всех администраторов
    status: 'idle',     // Статус запроса: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Создание слайса
const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // Действие для выхода из системы
        logout: (state) => {
            state.admin = null;
            state.status = 'idle';
            localStorage.removeItem('token');
            localStorage.removeItem('role'); // Удаляем роль
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    extraReducers: (builder) => {
        builder
            // Регистрация администратора
            .addCase(registration.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registration.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admin = action.payload.admin;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', action.payload.admin.role); // Сохраняем роль
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(registration.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Вход администратора
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admin = action.payload.admin; // admin: {id, login, role: 'admin'}
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', action.payload.admin.role); // Сохраняем роль
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Аутентификация администратора
            .addCase(auth.pending, (state) => {
                state.status = 'loading';
                state.isAuthChecked = false;
                // ...
            })
            .addCase(auth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthChecked = true; // запрос точно завершился
                state.admin = action.payload.admin;
            })
            .addCase(auth.rejected, (state, action) => {
                state.status = 'failed';
                state.isAuthChecked = true;
                state.error = action.payload || action.error.message;
            })

            // Получение всех администраторов
            .addCase(fetchAllAdmins.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllAdmins.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admins = action.payload.admins;
            })
            .addCase(fetchAllAdmins.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Получение администратора по ID
            .addCase(fetchAdminById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAdminById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const admin = action.payload.admin;
                const existingAdmin = state.admins.find((a) => a.id === admin.id);
                if (existingAdmin) {
                    Object.assign(existingAdmin, admin);
                } else {
                    state.admins.push(admin);
                }
            })
            .addCase(fetchAdminById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Обновление данных администратора
            .addCase(updateAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admin = action.payload.admin;
                // Обновляем администратора в списке, если он там есть
                const index = state.admins.findIndex(a => a.id === action.payload.admin.id);
                if (index !== -1) {
                    state.admins[index] = action.payload.admin;
                }
            })
            .addCase(updateAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Удаление администратора
            .addCase(deleteAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Если удаляем текущего администратора
                if (state.admin && state.admin.id === action.payload) {
                    state.admin = null;
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
                // Удаляем администратора из списка
                state.admins = state.admins.filter(a => a.id !== action.payload);
            })
            .addCase(deleteAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

// Селекторы
export const selectIsAuth = (state) => Boolean(state.admin.admin);
export const selectCurrentAdmin = (state) => state.admin.admin;
export const selectAllAdmins = (state) => state.admin.admins;
export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminError = (state) => state.admin.error;

// Экспорт действий и редьюсера
export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
