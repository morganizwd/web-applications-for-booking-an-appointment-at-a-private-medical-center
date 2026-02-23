const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } = require('docx');
const fs = require('fs');
const path = require('path');
const { 
    ReportJob, 
    ReportFile, 
    Appointment, 
    Diagnosis, 
    DoctorSchedule, 
    Patient, 
    Doctor, 
    Service, 
    Department 
} = require('../models/models');
const { Op } = require('sequelize');

class ReportController {
    async createReport(req, res) {
        try {
            const { reportType, format, filters } = req.body;
            const userId = req.user.userId;

            if (!reportType || !format) {
                return res.status(400).json({ message: 'Тип отчёта и формат обязательны' });
            }

            // Создание задания на генерацию отчёта
            const job = await ReportJob.create({
                reportType,
                format,
                status: 'pending',
                filters: filters || {},
                createdBy: userId,
            });

            // Асинхронная генерация отчёта
            this.generateReportAsync(job.id).catch(error => {
                console.error('Ошибка генерации отчёта:', error);
            });

            res.status(201).json({
                message: 'Задание на генерацию отчёта создано',
                job: {
                    id: job.id,
                    reportType: job.reportType,
                    format: job.format,
                    status: job.status,
                },
            });
        } catch (error) {
            console.error('Ошибка создания задания на отчёт:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async generateReportAsync(jobId) {
        try {
            const job = await ReportJob.findByPk(jobId);
            if (!job) {
                throw new Error('Задание не найдено');
            }

            await job.update({ status: 'processing' });

            let filePath, fileName;

            if (job.format === 'excel') {
                const result = await this.generateExcelReport(job.reportType, job.filters);
                filePath = result.filePath;
                fileName = result.fileName;
            } else if (job.format === 'word') {
                const result = await this.generateWordReport(job.reportType, job.filters);
                filePath = result.filePath;
                fileName = result.fileName;
            } else {
                throw new Error('Неподдерживаемый формат отчёта');
            }

            // Сохранение информации о файле
            const stats = fs.statSync(filePath);
            await ReportFile.create({
                jobId: job.id,
                filePath,
                fileName,
                fileSize: stats.size,
            });

            await job.update({ status: 'completed' });
        } catch (error) {
            console.error('Ошибка генерации отчёта:', error);
            const job = await ReportJob.findByPk(jobId);
            if (job) {
                await job.update({
                    status: 'failed',
                    errorMessage: error.message,
                });
            }
        }
    }

    async generateExcelReport(reportType, filters) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Отчёт');

        let data, headers, summary;

        const reportTitles = {
            'appointments': 'Отчёт по приёмам',
            'diagnoses': 'Отчёт по диагнозам',
            'schedule': 'Отчёт по расписанию',
            'patients': 'Отчёт по пациентам',
            'doctors': 'Отчёт по врачам',
            'services': 'Отчёт по услугам',
        };

        switch (reportType) {
            case 'appointments':
                ({ data, headers, summary } = await this.getAppointmentsData(filters));
                break;
            case 'diagnoses':
                ({ data, headers, summary } = await this.getDiagnosesData(filters));
                break;
            case 'schedule':
                ({ data, headers, summary } = await this.getScheduleData(filters));
                break;
            case 'patients':
                ({ data, headers, summary } = await this.getPatientsData(filters));
                break;
            case 'doctors':
                ({ data, headers, summary } = await this.getDoctorsData(filters));
                break;
            case 'services':
                ({ data, headers, summary } = await this.getServicesData(filters));
                break;
            default:
                throw new Error('Неизвестный тип отчёта');
        }

        // Заголовок отчёта
        const lastCol = String.fromCharCode(64 + headers.length); // A, B, C, etc.
        worksheet.mergeCells(`A1:${lastCol}1`);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `${reportTitles[reportType] || 'Отчёт'} - ${new Date().toLocaleDateString('ru-RU')}`;
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.addRow([]);

        // Добавление заголовков
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Добавление данных
        data.forEach(row => {
            worksheet.addRow(headers.map(h => row[h] || ''));
        });

        // Добавление подытогов для всех типов отчетов
        if (summary) {
            worksheet.addRow([]);
            const summaryRowNum = worksheet.rowCount + 1;
            worksheet.mergeCells(`A${summaryRowNum}:${lastCol}${summaryRowNum}`);
            const summaryTitle = worksheet.getCell(`A${summaryRowNum}`);
            summaryTitle.value = 'ПОДЫТОГИ';
            summaryTitle.font = { size: 14, bold: true };
            summaryTitle.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD0D0D0' }
            };
            worksheet.addRow([]);

            // Общая статистика
            worksheet.addRow(['Всего записей:', summary.total]);

            // Специфичные подытоги для каждого типа отчета
            if (reportType === 'appointments') {
                worksheet.addRow(['Общая выручка:', `${summary.totalRevenue} руб.`]);
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по статусам:']);
                Object.entries(summary.byStatus).forEach(([status, count]) => {
                    worksheet.addRow([`  ${status}:`, count]);
                });
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по врачам:']);
                Object.entries(summary.byDoctor).forEach(([doctor, stats]) => {
                    worksheet.addRow([`  ${doctor}:`, `Приёмов: ${stats.count}, Выручка: ${stats.revenue} руб.`]);
                });
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по услугам:']);
                Object.entries(summary.byService).forEach(([service, stats]) => {
                    worksheet.addRow([`  ${service}:`, `Приёмов: ${stats.count}, Выручка: ${stats.revenue} руб.`]);
                });
            } else if (reportType === 'diagnoses') {
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по врачам:']);
                Object.entries(summary.byDoctor).forEach(([doctor, count]) => {
                    worksheet.addRow([`  ${doctor}:`, count]);
                });
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по пациентам:']);
                Object.entries(summary.byPatient).forEach(([patient, count]) => {
                    worksheet.addRow([`  ${patient}:`, count]);
                });
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по специализациям:']);
                Object.entries(summary.bySpecialization).forEach(([spec, count]) => {
                    worksheet.addRow([`  ${spec}:`, count]);
                });
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по месяцам:']);
                Object.entries(summary.byMonth).forEach(([month, count]) => {
                    worksheet.addRow([`  ${month}:`, count]);
                });
            } else if (reportType === 'schedule') {
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по врачам:']);
                Object.entries(summary.byDoctor).forEach(([doctor, stats]) => {
                    worksheet.addRow([`  ${doctor}:`, `Записей: ${stats.count}, Всего часов: ${stats.totalHours.toFixed(1)}`]);
                });
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по дням недели:']);
                Object.entries(summary.byDayOfWeek).forEach(([day, count]) => {
                    worksheet.addRow([`  ${day}:`, count]);
                });
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по специализациям:']);
                Object.entries(summary.bySpecialization).forEach(([spec, count]) => {
                    worksheet.addRow([`  ${spec}:`, count]);
                });
            } else if (reportType === 'patients') {
                worksheet.addRow(['Средний возраст:', `${summary.averageAge} лет`]);
                worksheet.addRow(['С телефоном:', summary.withPhone]);
                worksheet.addRow(['С адресом:', summary.withAddress]);
                worksheet.addRow([]);
                worksheet.addRow(['Распределение по возрастным группам:']);
                Object.entries(summary.ageGroups).forEach(([group, count]) => {
                    worksheet.addRow([`  ${group} лет:`, count]);
                });
            } else if (reportType === 'doctors') {
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по отделениям:']);
                Object.entries(summary.byDepartment).forEach(([dept, count]) => {
                    worksheet.addRow([`  ${dept}:`, count]);
                });
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по специализациям:']);
                Object.entries(summary.bySpecialization).forEach(([spec, count]) => {
                    worksheet.addRow([`  ${spec}:`, count]);
                });
            } else if (reportType === 'services') {
                worksheet.addRow(['Общая стоимость всех услуг:', `${summary.totalRevenue} руб.`]);
                worksheet.addRow(['Средняя цена:', `${summary.averagePrice} руб.`]);
                worksheet.addRow(['Минимальная цена:', `${summary.minPrice} руб.`]);
                worksheet.addRow(['Максимальная цена:', `${summary.maxPrice} руб.`]);
                worksheet.addRow(['Общая длительность:', `${summary.totalDuration} мин.`]);
                worksheet.addRow([]);
                worksheet.addRow(['Статистика по отделениям:']);
                Object.entries(summary.byDepartment).forEach(([dept, stats]) => {
                    worksheet.addRow([`  ${dept}:`, `Услуг: ${stats.count}, Сумма: ${stats.totalPrice} руб.`]);
                });
            }
        }

        // Автоматическая ширина колонок
        worksheet.columns.forEach(column => {
            column.width = 20;
        });

        // Сохранение файла
        const reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const fileName = `${reportType}_${Date.now()}.xlsx`;
        const filePath = path.join(reportsDir, fileName);

        await workbook.xlsx.writeFile(filePath);

        return { filePath, fileName };
    }

    async generateWordReport(reportType, filters) {
        let data, headers, summary;

        const reportTitles = {
            'appointments': 'Отчёт по приёмам',
            'diagnoses': 'Отчёт по диагнозам',
            'schedule': 'Отчёт по расписанию',
            'patients': 'Отчёт по пациентам',
            'doctors': 'Отчёт по врачам',
            'services': 'Отчёт по услугам',
        };

        switch (reportType) {
            case 'appointments':
                ({ data, headers, summary } = await this.getAppointmentsData(filters));
                break;
            case 'diagnoses':
                ({ data, headers, summary } = await this.getDiagnosesData(filters));
                break;
            case 'schedule':
                ({ data, headers, summary } = await this.getScheduleData(filters));
                break;
            case 'patients':
                ({ data, headers, summary } = await this.getPatientsData(filters));
                break;
            case 'doctors':
                ({ data, headers, summary } = await this.getDoctorsData(filters));
                break;
            case 'services':
                ({ data, headers, summary } = await this.getServicesData(filters));
                break;
            default:
                throw new Error('Неизвестный тип отчёта');
        }

        const children = [
            new Paragraph({
                text: `${reportTitles[reportType] || 'Отчёт'} - ${new Date().toLocaleDateString('ru-RU')}`,
                heading: 'Heading1',
            }),
            new Paragraph({ text: '' }),
        ];

        // Создание таблицы данных
        const tableRows = [
            new TableRow({
                children: headers.map(h =>
                    new TableCell({
                        children: [new Paragraph({ text: h, bold: true })],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                    })
                ),
            }),
            ...data.map(row =>
                new TableRow({
                    children: headers.map(h =>
                        new TableCell({
                            children: [new Paragraph(String(row[h] || ''))],
                        })
                    ),
                })
            ),
        ];

        children.push(new Table({ rows: tableRows }));

        // Добавление подытогов для всех типов отчетов
        if (summary) {
            children.push(new Paragraph({ text: '' }));
            children.push(new Paragraph({
                text: 'ПОДЫТОГИ',
                heading: 'Heading2',
            }));
            children.push(new Paragraph({ text: '' }));
            children.push(new Paragraph({
                text: `Всего записей: ${summary.total}`,
            }));

            // Специфичные подытоги для каждого типа отчета
            if (reportType === 'appointments') {
                children.push(new Paragraph({
                    text: `Общая выручка: ${summary.totalRevenue} руб.`,
                }));
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по статусам:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byStatus).forEach(([status, count]) => {
                    children.push(new Paragraph({
                        text: `  ${status}: ${count}`,
                    }));
                });
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по врачам:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byDoctor).forEach(([doctor, stats]) => {
                    children.push(new Paragraph({
                        text: `  ${doctor}: Приёмов - ${stats.count}, Выручка - ${stats.revenue} руб.`,
                    }));
                });
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по услугам:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byService).forEach(([service, stats]) => {
                    children.push(new Paragraph({
                        text: `  ${service}: Приёмов - ${stats.count}, Выручка - ${stats.revenue} руб.`,
                    }));
                });
            } else if (reportType === 'diagnoses') {
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по врачам:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byDoctor).forEach(([doctor, count]) => {
                    children.push(new Paragraph({
                        text: `  ${doctor}: ${count}`,
                    }));
                });
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по пациентам:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byPatient).forEach(([patient, count]) => {
                    children.push(new Paragraph({
                        text: `  ${patient}: ${count}`,
                    }));
                });
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по специализациям:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.bySpecialization).forEach(([spec, count]) => {
                    children.push(new Paragraph({
                        text: `  ${spec}: ${count}`,
                    }));
                });
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по месяцам:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byMonth).forEach(([month, count]) => {
                    children.push(new Paragraph({
                        text: `  ${month}: ${count}`,
                    }));
                });
            } else if (reportType === 'schedule') {
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по врачам:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byDoctor).forEach(([doctor, stats]) => {
                    children.push(new Paragraph({
                        text: `  ${doctor}: Записей - ${stats.count}, Всего часов - ${stats.totalHours.toFixed(1)}`,
                    }));
                });
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по дням недели:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byDayOfWeek).forEach(([day, count]) => {
                    children.push(new Paragraph({
                        text: `  ${day}: ${count}`,
                    }));
                });
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по специализациям:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.bySpecialization).forEach(([spec, count]) => {
                    children.push(new Paragraph({
                        text: `  ${spec}: ${count}`,
                    }));
                });
            } else if (reportType === 'patients') {
                children.push(new Paragraph({
                    text: `Средний возраст: ${summary.averageAge} лет`,
                }));
                children.push(new Paragraph({
                    text: `С телефоном: ${summary.withPhone}`,
                }));
                children.push(new Paragraph({
                    text: `С адресом: ${summary.withAddress}`,
                }));
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Распределение по возрастным группам:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.ageGroups).forEach(([group, count]) => {
                    children.push(new Paragraph({
                        text: `  ${group} лет: ${count}`,
                    }));
                });
            } else if (reportType === 'doctors') {
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по отделениям:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byDepartment).forEach(([dept, count]) => {
                    children.push(new Paragraph({
                        text: `  ${dept}: ${count}`,
                    }));
                });
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по специализациям:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.bySpecialization).forEach(([spec, count]) => {
                    children.push(new Paragraph({
                        text: `  ${spec}: ${count}`,
                    }));
                });
            } else if (reportType === 'services') {
                children.push(new Paragraph({
                    text: `Общая стоимость всех услуг: ${summary.totalRevenue} руб.`,
                }));
                children.push(new Paragraph({
                    text: `Средняя цена: ${summary.averagePrice} руб.`,
                }));
                children.push(new Paragraph({
                    text: `Минимальная цена: ${summary.minPrice} руб.`,
                }));
                children.push(new Paragraph({
                    text: `Максимальная цена: ${summary.maxPrice} руб.`,
                }));
                children.push(new Paragraph({
                    text: `Общая длительность: ${summary.totalDuration} мин.`,
                }));
                children.push(new Paragraph({ text: '' }));
                children.push(new Paragraph({
                    text: 'Статистика по отделениям:',
                    heading: 'Heading3',
                }));
                Object.entries(summary.byDepartment).forEach(([dept, stats]) => {
                    children.push(new Paragraph({
                        text: `  ${dept}: Услуг - ${stats.count}, Сумма - ${stats.totalPrice} руб.`,
                    }));
                });
            }
        }

        const doc = new Document({
            sections: [
                {
                    children,
                },
            ],
        });

        // Сохранение файла
        const reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const fileName = `${reportType}_${Date.now()}.docx`;
        const filePath = path.join(reportsDir, fileName);

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(filePath, buffer);

        return { filePath, fileName };
    }

    async getAppointmentsData(filters) {
        const where = {};
        if (filters.dateFrom) where.date = { [Op.gte]: new Date(filters.dateFrom) };
        if (filters.dateTo) where.date = { ...where.date, [Op.lte]: new Date(filters.dateTo) };
        if (filters.doctorId) where.doctorId = filters.doctorId;
        if (filters.patientId) where.patientId = filters.patientId;
        if (filters.status) where.status = filters.status;

        const appointments = await Appointment.findAll({
            where,
            include: [
                { model: Doctor, attributes: ['firstName', 'lastName', 'specialization'] },
                { model: Patient, attributes: ['firstName', 'lastName', 'phoneNumber'] },
                { model: Service, attributes: ['name', 'price'] },
            ],
            order: [['date', 'ASC']],
        });

        const data = appointments.map(a => ({
            'ID': a.id,
            'Дата/Время': new Date(a.date).toLocaleString('ru-RU'),
            'Врач': a.Doctor ? `${a.Doctor.firstName} ${a.Doctor.lastName}` : '',
            'Специализация': a.Doctor ? a.Doctor.specialization : '',
            'Пациент': a.Patient ? `${a.Patient.firstName} ${a.Patient.lastName}` : '',
            'Телефон пациента': a.Patient ? a.Patient.phoneNumber : '',
            'Услуга': a.Service ? a.Service.name : '',
            'Цена': a.Service ? a.Service.price : 0,
            'Статус': a.status || 'scheduled',
        }));

        // Вычисление подытогов
        const summary = {
            total: appointments.length,
            totalRevenue: appointments.reduce((sum, a) => sum + (a.Service ? a.Service.price : 0), 0),
            byStatus: {},
            byDoctor: {},
            byService: {},
        };

        appointments.forEach(a => {
            // По статусам
            const status = a.status || 'scheduled';
            summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;

            // По врачам
            if (a.Doctor) {
                const doctorName = `${a.Doctor.firstName} ${a.Doctor.lastName}`;
                if (!summary.byDoctor[doctorName]) {
                    summary.byDoctor[doctorName] = { count: 0, revenue: 0 };
                }
                summary.byDoctor[doctorName].count++;
                summary.byDoctor[doctorName].revenue += a.Service ? a.Service.price : 0;
            }

            // По услугам
            if (a.Service) {
                const serviceName = a.Service.name;
                if (!summary.byService[serviceName]) {
                    summary.byService[serviceName] = { count: 0, revenue: 0 };
                }
                summary.byService[serviceName].count++;
                summary.byService[serviceName].revenue += a.Service.price;
            }
        });

        return {
            data,
            headers: ['ID', 'Дата/Время', 'Врач', 'Специализация', 'Пациент', 'Телефон пациента', 'Услуга', 'Цена', 'Статус'],
            summary,
        };
    }

    async getDiagnosesData(filters) {
        const where = {};
        if (filters.patientId) where.patientId = filters.patientId;
        if (filters.doctorId) where.doctorId = filters.doctorId;
        if (filters.dateFrom) where.createdAt = { [Op.gte]: new Date(filters.dateFrom) };
        if (filters.dateTo) where.createdAt = { ...where.createdAt, [Op.lte]: new Date(filters.dateTo) };

        const diagnoses = await Diagnosis.findAll({
            where,
            include: [
                { model: Patient, attributes: ['firstName', 'lastName'] },
                { model: Doctor, attributes: ['firstName', 'lastName', 'specialization'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        const data = diagnoses.map(d => ({
            'ID': d.id,
            'Название': d.name,
            'Заключение': d.conclusion || '',
            'Пациент': d.Patient ? `${d.Patient.firstName} ${d.Patient.lastName}` : '',
            'Врач': d.Doctor ? `${d.Doctor.firstName} ${d.Doctor.lastName}` : '',
            'Специализация': d.Doctor ? d.Doctor.specialization : '',
            'Дата': new Date(d.createdAt).toLocaleDateString('ru-RU'),
        }));

        // Вычисление подытогов
        const summary = {
            total: diagnoses.length,
            byDoctor: {},
            byPatient: {},
            bySpecialization: {},
            byMonth: {},
        };

        diagnoses.forEach(d => {
            // По врачам
            if (d.Doctor) {
                const doctorName = `${d.Doctor.firstName} ${d.Doctor.lastName}`;
                summary.byDoctor[doctorName] = (summary.byDoctor[doctorName] || 0) + 1;
            }

            // По пациентам
            if (d.Patient) {
                const patientName = `${d.Patient.firstName} ${d.Patient.lastName}`;
                summary.byPatient[patientName] = (summary.byPatient[patientName] || 0) + 1;
            }

            // По специализациям
            if (d.Doctor && d.Doctor.specialization) {
                summary.bySpecialization[d.Doctor.specialization] = (summary.bySpecialization[d.Doctor.specialization] || 0) + 1;
            }

            // По месяцам
            const month = new Date(d.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
            summary.byMonth[month] = (summary.byMonth[month] || 0) + 1;
        });

        return {
            data,
            headers: ['ID', 'Название', 'Заключение', 'Пациент', 'Врач', 'Специализация', 'Дата'],
            summary,
        };
    }

    async getScheduleData(filters) {
        const where = {};
        if (filters.doctorId) where.doctorId = filters.doctorId;

        const schedules = await DoctorSchedule.findAll({
            where,
            include: [
                { model: Doctor, attributes: ['firstName', 'lastName', 'specialization'] },
            ],
            order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
        });

        const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

        const data = schedules.map(s => ({
            'ID': s.id,
            'Врач': s.Doctor ? `${s.Doctor.firstName} ${s.Doctor.lastName}` : '',
            'Специализация': s.Doctor ? s.Doctor.specialization : '',
            'День недели': dayNames[s.dayOfWeek] || s.dayOfWeek,
            'Начало': s.startTime,
            'Конец': s.endTime,
        }));

        // Вычисление подытогов
        const summary = {
            total: schedules.length,
            byDoctor: {},
            byDayOfWeek: {},
            bySpecialization: {},
        };

        schedules.forEach(s => {
            // По врачам
            if (s.Doctor) {
                const doctorName = `${s.Doctor.firstName} ${s.Doctor.lastName}`;
                if (!summary.byDoctor[doctorName]) {
                    summary.byDoctor[doctorName] = { count: 0, totalHours: 0 };
                }
                summary.byDoctor[doctorName].count++;
                // Вычисляем часы работы
                const start = new Date(`2000-01-01T${s.startTime}`);
                const end = new Date(`2000-01-01T${s.endTime}`);
                const hours = (end - start) / (1000 * 60 * 60);
                summary.byDoctor[doctorName].totalHours += hours;
            }

            // По дням недели
            const dayName = dayNames[s.dayOfWeek] || s.dayOfWeek;
            summary.byDayOfWeek[dayName] = (summary.byDayOfWeek[dayName] || 0) + 1;

            // По специализациям
            if (s.Doctor && s.Doctor.specialization) {
                summary.bySpecialization[s.Doctor.specialization] = (summary.bySpecialization[s.Doctor.specialization] || 0) + 1;
            }
        });

        return {
            data,
            headers: ['ID', 'Врач', 'Специализация', 'День недели', 'Начало', 'Конец'],
            summary,
        };
    }

    async getPatientsData(filters) {
        const where = {};
        if (filters.ageFrom) where.age = { [Op.gte]: filters.ageFrom };
        if (filters.ageTo) where.age = { ...where.age, [Op.lte]: filters.ageTo };

        const patients = await Patient.findAll({
            where,
            order: [['lastName', 'ASC'], ['firstName', 'ASC']],
        });

        const data = patients.map(p => ({
            'ID': p.id,
            'Имя': p.firstName,
            'Фамилия': p.lastName,
            'Телефон': p.phoneNumber || '',
            'Адрес': p.address || '',
            'Возраст': p.age,
        }));

        // Вычисление подытогов
        const summary = {
            total: patients.length,
            averageAge: 0,
            ageGroups: {
                '0-18': 0,
                '19-30': 0,
                '31-50': 0,
                '51-70': 0,
                '71+': 0,
            },
            withPhone: 0,
            withAddress: 0,
        };

        if (patients.length > 0) {
            let totalAge = 0;
            patients.forEach(p => {
                totalAge += p.age || 0;
                
                // Группы по возрасту
                if (p.age <= 18) summary.ageGroups['0-18']++;
                else if (p.age <= 30) summary.ageGroups['19-30']++;
                else if (p.age <= 50) summary.ageGroups['31-50']++;
                else if (p.age <= 70) summary.ageGroups['51-70']++;
                else summary.ageGroups['71+']++;

                if (p.phoneNumber) summary.withPhone++;
                if (p.address) summary.withAddress++;
            });
            summary.averageAge = Math.round((totalAge / patients.length) * 10) / 10;
        }

        return {
            data,
            headers: ['ID', 'Имя', 'Фамилия', 'Телефон', 'Адрес', 'Возраст'],
            summary,
        };
    }

    async getDoctorsData(filters) {
        const where = {};
        if (filters.departmentId) where.departmentId = filters.departmentId;

        const doctors = await Doctor.findAll({
            where,
            include: [
                { model: Department, attributes: ['name'] },
            ],
            order: [['lastName', 'ASC'], ['firstName', 'ASC']],
        });

        const data = doctors.map(d => ({
            'ID': d.id,
            'Имя': d.firstName,
            'Фамилия': d.lastName,
            'Специализация': d.specialization,
            'Отделение': d.Department ? d.Department.name : '',
        }));

        // Вычисление подытогов
        const summary = {
            total: doctors.length,
            byDepartment: {},
            bySpecialization: {},
        };

        doctors.forEach(d => {
            // По отделениям
            const deptName = d.Department ? d.Department.name : 'Не указано';
            summary.byDepartment[deptName] = (summary.byDepartment[deptName] || 0) + 1;

            // По специализациям
            if (d.specialization) {
                summary.bySpecialization[d.specialization] = (summary.bySpecialization[d.specialization] || 0) + 1;
            }
        });

        return {
            data,
            headers: ['ID', 'Имя', 'Фамилия', 'Специализация', 'Отделение'],
            summary,
        };
    }

    async getServicesData(filters) {
        const where = {};
        if (filters.departmentId) where.departmentId = filters.departmentId;

        const services = await Service.findAll({
            where,
            include: [
                { model: Department, attributes: ['name'] },
            ],
            order: [['name', 'ASC']],
        });

        const data = services.map(s => ({
            'ID': s.id,
            'Название': s.name,
            'Цена': s.price || 0,
            'Длительность (мин)': s.duration || 0,
            'Отделение': s.Department ? s.Department.name : '',
        }));

        // Вычисление подытогов
        const summary = {
            total: services.length,
            totalRevenue: 0,
            averagePrice: 0,
            minPrice: 0,
            maxPrice: 0,
            byDepartment: {},
            totalDuration: 0,
        };

        if (services.length > 0) {
            let totalPrice = 0;
            let prices = [];
            
            services.forEach(s => {
                const price = s.price || 0;
                totalPrice += price;
                prices.push(price);
                summary.totalRevenue += price;
                summary.totalDuration += s.duration || 0;

                // По отделениям
                const deptName = s.Department ? s.Department.name : 'Не указано';
                if (!summary.byDepartment[deptName]) {
                    summary.byDepartment[deptName] = { count: 0, totalPrice: 0 };
                }
                summary.byDepartment[deptName].count++;
                summary.byDepartment[deptName].totalPrice += price;
            });

            prices.sort((a, b) => a - b);
            summary.averagePrice = Math.round((totalPrice / services.length) * 100) / 100;
            summary.minPrice = prices[0] || 0;
            summary.maxPrice = prices[prices.length - 1] || 0;
        }

        return {
            data,
            headers: ['ID', 'Название', 'Цена', 'Длительность (мин)', 'Отделение'],
            summary,
        };
    }

    async getJobs(req, res) {
        try {
            const { status } = req.query;
            const where = {};

            if (status) {
                where.status = status;
            }

            // Пользователь видит только свои отчёты, если не админ
            if (req.user.primaryRole !== 'admin') {
                where.createdBy = req.user.userId;
            }

            const jobs = await ReportJob.findAll({
                where,
                include: [
                    { model: ReportFile, attributes: ['id', 'fileName', 'fileSize'] },
                ],
                order: [['createdAt', 'DESC']],
                limit: 50,
            });

            res.json(jobs);
        } catch (error) {
            console.error('Ошибка получения заданий:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getJob(req, res) {
        try {
            const job = await ReportJob.findByPk(req.params.id, {
                include: [
                    { model: ReportFile, attributes: ['id', 'fileName', 'filePath', 'fileSize'] },
                ],
            });

            if (!job) {
                return res.status(404).json({ message: 'Задание не найдено' });
            }

            // Проверка прав доступа
            if (req.user.primaryRole !== 'admin' && job.createdBy !== req.user.userId) {
                return res.status(403).json({ message: 'Доступ запрещён' });
            }

            res.json(job);
        } catch (error) {
            console.error('Ошибка получения задания:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async downloadReport(req, res) {
        try {
            const job = await ReportJob.findByPk(req.params.id, {
                include: [
                    { model: ReportFile },
                ],
            });

            if (!job || !job.ReportFile) {
                return res.status(404).json({ message: 'Файл отчёта не найден' });
            }

            // Проверка прав доступа
            if (req.user.primaryRole !== 'admin' && job.createdBy !== req.user.userId) {
                return res.status(403).json({ message: 'Доступ запрещён' });
            }

            if (job.status !== 'completed') {
                return res.status(400).json({ message: 'Отчёт ещё не готов' });
            }

            const filePath = path.join(__dirname, '..', job.ReportFile.filePath);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'Файл не найден на сервере' });
            }

            res.download(filePath, job.ReportFile.fileName);
        } catch (error) {
            console.error('Ошибка скачивания отчёта:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Прямой экспорт приёмов без создания job
    async exportAppointments(req, res) {
        try {
            const { format, dateFrom, dateTo, doctorId, patientId, status } = req.query;
            
            if (!format || !['excel', 'word'].includes(format)) {
                return res.status(400).json({ message: 'Формат должен быть excel или word' });
            }

            const filters = {
                dateFrom,
                dateTo,
                doctorId: doctorId ? parseInt(doctorId) : undefined,
                patientId: patientId ? parseInt(patientId) : undefined,
                status,
            };

            let filePath, fileName;

            if (format === 'excel') {
                const result = await this.generateExcelReport('appointments', filters);
                filePath = result.filePath;
                fileName = result.fileName;
            } else {
                const result = await this.generateWordReport('appointments', filters);
                filePath = result.filePath;
                fileName = result.fileName;
            }

            // Используем абсолютный путь
            const absoluteFilePath = path.isAbsolute(filePath) 
                ? filePath 
                : path.join(__dirname, '..', filePath);

            if (!fs.existsSync(absoluteFilePath)) {
                return res.status(500).json({ message: 'Ошибка создания файла' });
            }

            res.download(absoluteFilePath, fileName, (err) => {
                if (err) {
                    console.error('Ошибка отправки файла:', err);
                }
                // Удаляем файл после отправки (опционально)
                // fs.unlinkSync(absoluteFilePath);
            });
        } catch (error) {
            console.error('Ошибка экспорта приёмов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ReportController();
