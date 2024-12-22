import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';




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


export const updateDoctor = createAsyncThunk(
    'doctor/updateDoctor',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            
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


const initialState = {
    doctor: null,       
    doctors: [],        
    status: 'idle',     
    error: null,
};


const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        
        logout: (state) => {
            state.doctor = null;
            state.status = 'idle';
            localStorage.removeItem('token');
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
                state.status = 'succeeded';
                state.doctor = action.payload.doctor;
                localStorage.setItem('token', action.payload.token);
                
                localStorage.setItem('role', 'doctor');
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
                state.doctor = action.payload; 
                console.log('Login fulfilled, doctor:', action.payload); 
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', 'doctor');
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })           
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            
            .addCase(auth.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(auth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.doctor = action.payload; 
                console.log('Auth fulfilled, doctor:', action.payload); 
            })
            .addCase(auth.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            
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

            
            .addCase(updateDoctor.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateDoctor.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.doctor = action.payload.doctor;
                
                const index = state.doctors.findIndex(d => d.id === action.payload.doctor.id);
                if (index !== -1) {
                    state.doctors[index] = action.payload.doctor;
                }
            })
            .addCase(updateDoctor.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            
            .addCase(deleteDoctor.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteDoctor.fulfilled, (state, action) => {
                state.status = 'succeeded';
                
                if (state.doctor && state.doctor.id === action.payload) {
                    state.doctor = null;
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
                
                state.doctors = state.doctors.filter(d => d.id !== action.payload);
            })
            .addCase(deleteDoctor.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});


export const selectIsAuth = (state) => Boolean(state.doctor.doctor);
export const selectCurrentDoctor = (state) => state.doctor.doctor;
export const selectAllDoctors = (state) => state.doctor.doctors;
export const selectDoctorStatus = (state) => state.doctor.status;
export const selectDoctorError = (state) => state.doctor.error;


export const { logout } = doctorSlice.actions;
export default doctorSlice.reducer;
