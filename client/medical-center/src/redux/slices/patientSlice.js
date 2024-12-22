import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

export const registration = createAsyncThunk(
    'patient/registration',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/patients/registration', formData, {
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
    'patient/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post('/patients/login', credentials);
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
    'patient/auth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/patients/auth');
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


export const fetchAllPatients = createAsyncThunk(
    'patient/fetchAllPatients',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/patients');
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


export const fetchPatientById = createAsyncThunk(
    'patient/fetchPatientById',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/patients/${patientId}`);
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


export const updatePatient = createAsyncThunk(
    'patient/updatePatient',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            
            Object.keys(updatedData).forEach(key => {
                formData.append(key, updatedData[key]);
            });

            const response = await axios.put(`/patients/${id}`, formData, {
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


export const deletePatient = createAsyncThunk(
    'patient/deletePatient',
    async (patientId, { rejectWithValue }) => {
        try {
            await axios.delete(`/patients/${patientId}`);
            return patientId; 
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
    patient: null,       
    patients: [],        
    status: 'idle',      
    error: null,
};


const patientSlice = createSlice({
    name: 'patient',
    initialState,
    reducers: {
        
        logout: (state) => {
            state.patient = null;
            state.status = 'idle';
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('patientId'); 
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
                
                const { patient, token } = action.payload;
                state.patient = patient;
                localStorage.setItem('token', token);
                localStorage.setItem('role', 'patient');
                localStorage.setItem('patientId', patient.id); 
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
                
                const { patient, token } = action.payload;
                state.patient = patient;
                localStorage.setItem('token', token);
                localStorage.setItem('role', 'patient');
                localStorage.setItem('patientId', patient.id); 
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
                state.patient = action.payload.patient;
            })
            .addCase(auth.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
                state.patient = null;
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('patientId'); 
                delete axios.defaults.headers.common['Authorization'];
            })

            
            .addCase(fetchAllPatients.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllPatients.fulfilled, (state, action) => {
                
                state.status = 'succeeded';
                state.patients = action.payload.patients;
            })
            .addCase(fetchAllPatients.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            
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

            
            .addCase(updatePatient.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updatePatient.fulfilled, (state, action) => {
                
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

            
            .addCase(deletePatient.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deletePatient.fulfilled, (state, action) => {
                state.status = 'succeeded';
                
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


export const selectIsAuth = (state) => Boolean(state.patient.patient);
export const selectCurrentPatient = (state) => state.patient.patient;
export const selectAllPatients = (state) => state.patient.patients;
export const selectPatientStatus = (state) => state.patient.status;
export const selectPatientError = (state) => state.patient.error;


export const { logout } = patientSlice.actions;
export default patientSlice.reducer;
