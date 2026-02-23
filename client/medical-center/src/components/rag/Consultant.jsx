import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import axios from '../../redux/axios';
import {
    StyledContainer,
    StyledCard,
    StyledForm,
    StyledSubmitButton,
    AnswerCard,
    SourcesList,
    StyledAlert,
    LoadingSpinner,
} from './Consultant.styled';

const Consultant = () => {
    const [question, setQuestion] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [services, setServices] = useState([]);
    const [answer, setAnswer] = useState(null);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Загрузка списка услуг, для которых есть документы в базе знаний
        const fetchServices = async () => {
            try {
                const response = await axios.get('/rag/services');
                setServices(response.data);
            } catch (err) {
                console.error('Ошибка загрузки услуг:', err);
            }
        };

        fetchServices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            setError('Введите вопрос');
            return;
        }

        setLoading(true);
        setError(null);
        setAnswer(null);
        setSources([]);

        try {
            const response = await axios.post('/rag/ask', {
                question: question.trim(),
                serviceId: serviceId || null,
            });

            setAnswer(response.data.answer);
            setSources(response.data.sources || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при получении ответа');
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledContainer>
            <StyledCard>
                <div className="card-header">
                    <h3>Интеллектуальный консультант</h3>
                    <p style={{ marginBottom: 0, opacity: 0.9 }}>
                        Задайте вопрос о регламентах клиники, подготовке к услугам или общих условиях
                    </p>
                </div>
                <div className="card-body">
                    <StyledForm onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Услуга (опционально)</label>
                            <select
                                className="form-select"
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                            >
                                <option value="">Все услуги</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                            <div className="form-text">
                                {services.length > 0 
                                    ? `Выберите услугу для более точного ответа (показаны только услуги с документами в базе знаний)`
                                    : 'В базе знаний пока нет документов, привязанных к услугам'}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Ваш вопрос</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Например: Что нужно взять с собой на процедуру? Можно ли есть перед исследованием?"
                            />
                        </div>

                        <StyledSubmitButton
                            type="submit"
                            disabled={loading || !question.trim()}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    Обработка...
                                </>
                            ) : (
                                'Задать вопрос'
                            )}
                        </StyledSubmitButton>
                    </StyledForm>

                    {error && (
                        <StyledAlert variant="danger">
                            {error}
                        </StyledAlert>
                    )}

                    {loading && (
                        <LoadingSpinner>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </Spinner>
                        </LoadingSpinner>
                    )}

                    {answer && (
                        <AnswerCard>
                            <div className="card-header">
                                <h5>Ответ</h5>
                            </div>
                            <div className="card-body">
                                <div style={{ whiteSpace: 'pre-wrap' }}>{answer}</div>
                            </div>
                        </AnswerCard>
                    )}

                    {sources.length > 0 && (
                        <AnswerCard>
                            <div className="card-header">
                                <h5>Источники информации</h5>
                            </div>
                            <div className="card-body">
                                <SourcesList>
                                    {sources.map((source, index) => (
                                        <li key={index} className="list-group-item">
                                            <strong>Источник {index + 1}:</strong>{' '}
                                            {source.documentTitle || 'Документ'}
                                            {source.serviceId && (
                                                <span style={{ opacity: 0.7 }}>
                                                    {' '}(Услуга ID: {source.serviceId})
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </SourcesList>
                            </div>
                        </AnswerCard>
                    )}
                </div>
            </StyledCard>
        </StyledContainer>
    );
};

export default Consultant;
