import React, { useEffect, useState } from 'react';
import axios from '../../redux/axios';
import {
    Container,
    Card,
    Table,
    Button,
    Modal,
    Form,
    Alert,
    Spinner,
    Badge,
} from 'react-bootstrap';

function KnowledgeDocumentsManagement() {
    const [documents, setDocuments] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        documentType: 'general',
        serviceId: '',
    });

    useEffect(() => {
        fetchDocuments();
        fetchServices();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/rag/documents');
            setDocuments(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Не удалось загрузить документы');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get('/services');
            setServices(response.data);
        } catch (err) {
            console.error('Ошибка загрузки услуг:', err);
        }
    };

    const handleOpenModal = (doc = null) => {
        if (doc) {
            setEditingDoc(doc);
            setFormData({
                title: doc.title,
                content: doc.content,
                documentType: doc.documentType || 'general',
                serviceId: doc.serviceId || '',
            });
        } else {
            setEditingDoc(null);
            setFormData({
                title: '',
                content: '',
                documentType: 'general',
                serviceId: '',
            });
        }
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDoc(null);
        setFormData({
            title: '',
            content: '',
            documentType: 'general',
            serviceId: '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingDoc) {
                
                await axios.put(`/rag/documents/${editingDoc.id}`, formData);
                setSuccess('Документ успешно обновлён');
            } else {
                
                await axios.post('/rag/documents', formData);
                setSuccess('Документ успешно создан');
            }
            handleCloseModal();
            fetchDocuments();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при сохранении документа');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот документ?')) {
            return;
        }

        try {
            await axios.delete(`/rag/documents/${id}`);
            setSuccess('Документ успешно удалён');
            fetchDocuments();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при удалении документа');
        }
    };

    const getDocumentTypeLabel = (type) => {
        const labels = {
            'general': 'Общий',
            'preparation_guide': 'Подготовка к услуге',
            'regulation': 'Регламент',
        };
        return labels[type] || type;
    };

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Управление базой знаний</h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    + Добавить документ
                </Button>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Card>
                    <Card.Body>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Тип</th>
                                    <th>Услуга</th>
                                    <th>Версия</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            Документы не найдены
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map((doc) => (
                                        <tr key={doc.id}>
                                            <td>{doc.id}</td>
                                            <td>{doc.title}</td>
                                            <td>
                                                <Badge bg="info">
                                                    {getDocumentTypeLabel(doc.documentType)}
                                                </Badge>
                                            </td>
                                            <td>
                                                {doc.serviceId 
                                                    ? services.find(s => s.id === doc.serviceId)?.name || `ID: ${doc.serviceId}`
                                                    : '—'
                                                }
                                            </td>
                                            <td>{doc.version}</td>
                                            <td>
                                                <Badge bg={doc.isActive ? 'success' : 'secondary'}>
                                                    {doc.isActive ? 'Активен' : 'Неактивен'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleOpenModal(doc)}
                                                >
                                                    Редактировать
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    Удалить
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingDoc ? 'Редактировать документ' : 'Создать документ'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Название документа</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Тип документа</Form.Label>
                            <Form.Select
                                value={formData.documentType}
                                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                            >
                                <option value="general">Общий</option>
                                <option value="preparation_guide">Подготовка к услуге</option>
                                <option value="regulation">Регламент</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Услуга (опционально)</Form.Label>
                            <Form.Select
                                value={formData.serviceId}
                                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                            >
                                <option value="">Не привязано к услуге</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Содержание документа</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={10}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                placeholder="Введите текст документа..."
                            />
                            <Form.Text className="text-muted">
                                Документ будет автоматически разбит на фрагменты для поиска
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingDoc ? 'Сохранить' : 'Создать'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default KnowledgeDocumentsManagement;
