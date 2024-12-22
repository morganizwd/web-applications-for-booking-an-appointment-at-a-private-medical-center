

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
            const response = await axios.post('/departments/create', {
                name: newDeptName.trim(),
            });
            setSuccess('Отдел успешно создан');
            setNewDeptName('');
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
        setOpenEditDialog(true);
    };

    
    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditDeptId(null);
        setEditDeptName('');
    };

    
    const handleUpdateDepartment = async () => {
        if (!editDeptName.trim()) {
            setError('Название отдела не может быть пустым');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`/departments/${editDeptId}`, {
                name: editDeptName.trim(),
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

            {/* Отображение ошибок и успехов */}
            {error && <Alert severity="error" className="mb-3">{error}</Alert>}
            {success && <Alert severity="success" className="mb-3">{success}</Alert>}

            {/* Форма создания нового отделения */}
            <form onSubmit={handleCreateDepartment} className="mb-5">
                <Typography variant="h6" gutterBottom>
                    Создать Новое Отделение
                </Typography>
                <div className="d-flex align-items-center">
                    <TextField
                        label="Название Отделения"
                        variant="outlined"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        required
                        fullWidth
                        className="me-3"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Создать'}
                    </Button>
                </div>
            </form>

            {/* Таблица со списком отделений */}
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
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {departments.length > 0 ? (
                                departments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell>{dept.id}</TableCell>
                                        <TableCell>{dept.name}</TableCell>
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

            {/* Диалог редактирования отделения */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>Редактировать Отделение</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Измените название отделения ниже и нажмите "Сохранить".
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Отмена</Button>
                    <Button onClick={handleUpdateDepartment} variant="contained" color="primary">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог подтверждения удаления отделения */}
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
