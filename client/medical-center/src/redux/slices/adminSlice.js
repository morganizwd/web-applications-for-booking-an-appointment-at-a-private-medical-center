import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';


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


const initialState = {
    admin: null,        
    admins: [],         
    status: 'idle',     
    error: null,
};


const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        
        logout: (state) => {
            state.admin = null;
            state.status = 'idle';
            localStorage.removeItem('token');
            localStorage.removeItem('role'); 
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    extraReducers: (builder) => {
        builder
            
            .addCase(registration.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registration.fulfilled, (state, action) => {
                console.log('Registration success payload:', action.payload); 
                state.status = 'succeeded';
                state.admin = action.payload;  
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', action.payload.role); 
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(registration.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admin = action.payload.admin; 
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', action.payload.admin.role); 
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            
            .addCase(auth.pending, (state) => {
                state.status = 'loading';
                state.isAuthChecked = false;
                
            })
            .addCase(auth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthChecked = true; 
                state.admin = action.payload.admin;
            })
            .addCase(auth.rejected, (state, action) => {
                state.status = 'failed';
                state.isAuthChecked = true;
                state.error = action.payload || action.error.message;
            })

            
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

            
            .addCase(updateAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admin = action.payload.admin;
                
                const index = state.admins.findIndex(a => a.id === action.payload.admin.id);
                if (index !== -1) {
                    state.admins[index] = action.payload.admin;
                }
            })
            .addCase(updateAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            
            .addCase(deleteAdmin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                
                if (state.admin && state.admin.id === action.payload) {
                    state.admin = null;
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
                
                state.admins = state.admins.filter(a => a.id !== action.payload);
            })
            .addCase(deleteAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});


export const selectIsAuth = (state) => Boolean(state.admin.admin);
export const selectCurrentAdmin = (state) => state.admin.admin;
export const selectAllAdmins = (state) => state.admin.admins;
export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminError = (state) => state.admin.error;


export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
