

import React, { useEffect, useState } from 'react';
import axios from '../../redux/axios'; 

import {
    TextField,
    Button,
    Typography,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Box,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function DepartmentManagement() {
    
    const [departments, setDepartments] = useState([]);
    
    const [newDeptName, setNewDeptName] = useState('');
    
    const [editDeptId, setEditDeptId] = useState(null);
    const [editDeptName, setEditDeptName] = useState('');
    const [editDeptPhoto, setEditDeptPhoto] = useState(null);
    const [editDeptPhotoPreview, setEditDeptPhotoPreview] = useState(null);
    
    const [newDeptPhoto, setNewDeptPhoto] = useState(null);
    
    const [deleteDeptId, setDeleteDeptId] = useState(null);
    
    const [loading, setLoading] = useState(false);
    
    const [error, setError] = useState('');
    
    const [success, setSuccess] = useState('');

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const fetchDepartments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/departments');
            setDepartments(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Не удалось получить список отделений'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!newDeptName.trim()) {
            setError('Название отдела не может быть пустым');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', newDeptName.trim());
            if (newDeptPhoto) {
                formData.append('photo', newDeptPhoto);
            }

            const response = await axios.post('/departments/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Отдел успешно создан');
            setNewDeptName('');
            setNewDeptPhoto(null);
            fetchDepartments();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Не удалось создать отдел'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditDialog = (dept) => {
        setEditDeptId(dept.id);
        setEditDeptName(dept.name);
        setEditDeptPhoto(null);
        setEditDeptPhotoPreview(dept.photo ? `${axios.defaults.baseURL}${dept.photo}` : null);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditDeptId(null);
        setEditDeptName('');
        setEditDeptPhoto(null);
        setEditDeptPhotoPreview(null);
    };

    const handleUpdateDepartment = async () => {
        if (!editDeptName.trim()) {
            setError('Название отдела не может быть пустым');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', editDeptName.trim());
            if (editDeptPhoto) {
                formData.append('photo', editDeptPhoto);
            }

            const response = await axios.put(`/departments/${editDeptId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Отдел успешно обновлён');
            handleCloseEditDialog();
            fetchDepartments();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Не удалось обновить отдел'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeleteDialog = (deptId) => {
        setDeleteDeptId(deptId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteDeptId(null);
    };

    const handleDeleteDepartment = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(`/departments/${deleteDeptId}`);
            setSuccess('Отдел успешно удалён');
            handleCloseDeleteDialog();
            fetchDepartments();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Не удалось удалить отдел'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <Typography variant="h4" gutterBottom>
                Управление Отделениями
            </Typography>

            {}
            {error && <Alert severity="error" className="mb-3">{error}</Alert>}
            {success && <Alert severity="success" className="mb-3">{success}</Alert>}

            {}
            <form onSubmit={handleCreateDepartment} className="mb-5">
                <Typography variant="h6" gutterBottom>
                    Создать Новое Отделение
                </Typography>
                <div className="d-flex flex-column gap-3">
                    <TextField
                        label="Название Отделения"
                        variant="outlined"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        required
                        fullWidth
                    />
                    <div>
                        <input
                            accept="image/*"
                            type="file"
                            onChange={(e) => setNewDeptPhoto(e.target.files[0])}
                        />
                    </div>
                </div>
                <Button type="submit" variant="contained" color="primary" className="mt-3">
                    Создать
                </Button>
            </form>

            <Typography variant="h6" gutterBottom>
                Список Отделений
            </Typography>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <CircularProgress />
                </div>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="departments table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Название Отделения</TableCell>
                                <TableCell>Фото</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {departments.length > 0 ? (
                                departments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell>{dept.id}</TableCell>
                                        <TableCell>{dept.name}</TableCell>
                                        <TableCell>
                                            {dept.photo ? (
                                                <img
                                                    src={`${axios.defaults.baseURL}${dept.photo}`}
                                                    alt={dept.name}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <span>Нет фото</span>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditDialog(dept)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteDialog(dept.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Нет отделений для отображения.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Редактировать Отделение</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Измените название отделения и/или фото ниже и нажмите "Сохранить".
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название Отделения"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editDeptName}
                        onChange={(e) => setEditDeptName(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                    />
                    <div>
                        <input
                            accept="image/*"
                            type="file"
                            onChange={(e) => setEditDeptPhoto(e.target.files[0])}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Отмена</Button>
                    <Button onClick={handleUpdateDepartment} variant="contained" color="primary">
                        Обновить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Удалить Отделение</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите удалить это отделение? Это действие необратимо.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
                    <Button onClick={handleDeleteDepartment} variant="contained" color="error">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DepartmentManagement;
