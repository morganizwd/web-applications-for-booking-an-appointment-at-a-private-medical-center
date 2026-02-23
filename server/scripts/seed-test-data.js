require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;
const { sequelize, User, Role, UserRole, Patient, Doctor, Department, Service, DoctorSchedule, Appointment, Diagnosis, KnowledgeDocument, ReportJob } = require('../models/models');

async function seedDatabase() {
    try {
        // Проверка переменных окружения
        console.log('Проверка подключения к базе данных...');
        console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
        console.log('DB_PORT:', process.env.DB_PORT || 5432);
        console.log('DB_NAME:', process.env.DB_NAME || 'medical_center');
        console.log('DB_USER:', process.env.DB_USER || 'postgres');
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***установлен***' : 'НЕ УСТАНОВЛЕН');
        
        await sequelize.authenticate();
        console.log('✅ Подключение к базе данных установлено.');

        const passwordHash = await bcrypt.hash('password123', 10);
        console.log('Хеш пароля сгенерирован:', passwordHash);

        // ============================================
        // 1. ОТДЕЛЕНИЯ
        // ============================================
        const departments = await Department.bulkCreate([
            { name: 'Терапия', description: 'Общая терапия и консультации' },
            { name: 'Кардиология', description: 'Диагностика и лечение заболеваний сердечно-сосудистой системы' },
            { name: 'Неврология', description: 'Лечение заболеваний нервной системы' },
            { name: 'Гастроэнтерология', description: 'Диагностика и лечение заболеваний ЖКТ' },
            { name: 'Эндокринология', description: 'Лечение заболеваний эндокринной системы' },
            { name: 'Офтальмология', description: 'Диагностика и лечение заболеваний глаз' },
            { name: 'Отоларингология', description: 'Лечение заболеваний уха, горла и носа' },
            { name: 'Дерматология', description: 'Лечение заболеваний кожи' },
            { name: 'Урология', description: 'Лечение заболеваний мочеполовой системы' },
            { name: 'Гинекология', description: 'Женское здоровье' },
            { name: 'Педиатрия', description: 'Лечение детей' },
            { name: 'Хирургия', description: 'Хирургические операции' },
            { name: 'Лабораторная диагностика', description: 'Анализы и исследования' },
            { name: 'УЗИ диагностика', description: 'Ультразвуковые исследования' },
            { name: 'Рентгенология', description: 'Рентгеновские исследования' },
        ], { ignoreDuplicates: true });
        console.log(`Создано отделений: ${departments.length}`);

        // ============================================
        // 2. ПОЛЬЗОВАТЕЛИ - Администраторы
        // ============================================
        const adminUsers = await User.bulkCreate([
            { login: 'admin', password: passwordHash, email: 'admin@clinic.ru', isActive: true },
            { login: 'admin2', password: passwordHash, email: 'admin2@clinic.ru', isActive: true },
        ], { ignoreDuplicates: true });
        console.log(`Создано администраторов: ${adminUsers.length}`);

        // ============================================
        // 3. ПОЛЬЗОВАТЕЛИ - Врачи
        // ============================================
        const doctorUsers = await User.bulkCreate([
            { login: 'doctor1', password: passwordHash, email: 'petrov@clinic.ru', isActive: true },
            { login: 'doctor2', password: passwordHash, email: 'ivanova@clinic.ru', isActive: true },
            { login: 'doctor3', password: passwordHash, email: 'sidorov@clinic.ru', isActive: true },
            { login: 'doctor4', password: passwordHash, email: 'kozlov@clinic.ru', isActive: true },
            { login: 'doctor5', password: passwordHash, email: 'volkov@clinic.ru', isActive: true },
            { login: 'doctor6', password: passwordHash, email: 'morozov@clinic.ru', isActive: true },
            { login: 'doctor7', password: passwordHash, email: 'novikov@clinic.ru', isActive: true },
            { login: 'doctor8', password: passwordHash, email: 'fedorov@clinic.ru', isActive: true },
            { login: 'doctor9', password: passwordHash, email: 'sokolov@clinic.ru', isActive: true },
            { login: 'doctor10', password: passwordHash, email: 'popov@clinic.ru', isActive: true },
            { login: 'doctor11', password: passwordHash, email: 'lebedev@clinic.ru', isActive: true },
            { login: 'doctor12', password: passwordHash, email: 'kozlov2@clinic.ru', isActive: true },
            { login: 'doctor13', password: passwordHash, email: 'novikov2@clinic.ru', isActive: true },
            { login: 'doctor14', password: passwordHash, email: 'morozov2@clinic.ru', isActive: true },
            { login: 'doctor15', password: passwordHash, email: 'petrov2@clinic.ru', isActive: true },
        ], { ignoreDuplicates: true });
        console.log(`Создано врачей: ${doctorUsers.length}`);

        // ============================================
        // 4. ПОЛЬЗОВАТЕЛИ - Пациенты
        // ============================================
        const patientUsersData = [];
        for (let i = 1; i <= 30; i++) {
            patientUsersData.push({
                login: `patient${i}`,
                password: passwordHash,
                email: `patient${i}@mail.ru`,
                isActive: true,
            });
        }
        const patientUsers = await User.bulkCreate(patientUsersData, { ignoreDuplicates: true });
        console.log(`Создано пациентов: ${patientUsers.length}`);

        // ============================================
        // 5. РОЛИ
        // ============================================
        const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' }, defaults: { description: 'Администратор системы' } });
        const [doctorRole] = await Role.findOrCreate({ where: { name: 'doctor' }, defaults: { description: 'Врач' } });
        const [patientRole] = await Role.findOrCreate({ where: { name: 'patient' }, defaults: { description: 'Пациент' } });
        console.log('Роли проверены/созданы');

        // ============================================
        // 6. СВЯЗИ ПОЛЬЗОВАТЕЛЕЙ И РОЛЕЙ
        // ============================================
        // Получаем всех пользователей из базы (на случай, если они уже существовали)
        const allAdminUsers = await User.findAll({ where: { login: ['admin', 'admin2'] } });
        const allDoctorUsers = await User.findAll({ where: { login: { [Op.like]: 'doctor%' } } });
        const allPatientUsers = await User.findAll({ where: { login: { [Op.like]: 'patient%' } } });
        
        const userRoles = [];
        
        // Администраторы
        for (const admin of allAdminUsers) {
            if (admin && admin.id) {
                userRoles.push({ userId: admin.id, roleId: adminRole.id });
            }
        }
        
        // Врачи
        for (const doctor of allDoctorUsers) {
            if (doctor && doctor.id) {
                userRoles.push({ userId: doctor.id, roleId: doctorRole.id });
            }
        }
        
        // Пациенты
        for (const patient of allPatientUsers) {
            if (patient && patient.id) {
                userRoles.push({ userId: patient.id, roleId: patientRole.id });
            }
        }
        
        await UserRole.bulkCreate(userRoles, { ignoreDuplicates: true });
        console.log(`Создано связей пользователей и ролей: ${userRoles.length}`);

        // ============================================
        // 7. ПРОФИЛИ ВРАЧЕЙ
        // ============================================
        // Получаем всех врачей из базы, отсортированных по логину
        const allDoctorsFromDB = await User.findAll({ 
            where: { login: { [Op.like]: 'doctor%' } },
            order: [['login', 'ASC']]
        });
        
        const doctorsData = [
            { userId: allDoctorsFromDB[0]?.id, firstName: 'Александр', lastName: 'Петров', specialization: 'Терапевт', departmentId: 1 },
            { userId: allDoctorsFromDB[1]?.id, firstName: 'Елена', lastName: 'Иванова', specialization: 'Кардиолог', departmentId: 2 },
            { userId: allDoctorsFromDB[2]?.id, firstName: 'Дмитрий', lastName: 'Сидоров', specialization: 'Невролог', departmentId: 3 },
            { userId: allDoctorsFromDB[3]?.id, firstName: 'Сергей', lastName: 'Козлов', specialization: 'Гастроэнтеролог', departmentId: 4 },
            { userId: allDoctorsFromDB[4]?.id, firstName: 'Андрей', lastName: 'Волков', specialization: 'Эндокринолог', departmentId: 5 },
            { userId: allDoctorsFromDB[5]?.id, firstName: 'Мария', lastName: 'Морозова', specialization: 'Офтальмолог', departmentId: 6 },
            { userId: allDoctorsFromDB[6]?.id, firstName: 'Ольга', lastName: 'Новикова', specialization: 'Отоларинголог', departmentId: 7 },
            { userId: allDoctorsFromDB[7]?.id, firstName: 'Иван', lastName: 'Фёдоров', specialization: 'Дерматолог', departmentId: 8 },
            { userId: allDoctorsFromDB[8]?.id, firstName: 'Наталья', lastName: 'Соколова', specialization: 'Уролог', departmentId: 9 },
            { userId: allDoctorsFromDB[9]?.id, firstName: 'Владимир', lastName: 'Попов', specialization: 'Гинеколог', departmentId: 10 },
            { userId: allDoctorsFromDB[10]?.id, firstName: 'Татьяна', lastName: 'Лебедева', specialization: 'Педиатр', departmentId: 11 },
            { userId: allDoctorsFromDB[11]?.id, firstName: 'Михаил', lastName: 'Козлов', specialization: 'Хирург', departmentId: 12 },
            { userId: allDoctorsFromDB[12]?.id, firstName: 'Анна', lastName: 'Новикова', specialization: 'Терапевт', departmentId: 1 },
            { userId: allDoctorsFromDB[13]?.id, firstName: 'Павел', lastName: 'Морозов', specialization: 'Кардиолог', departmentId: 2 },
            { userId: allDoctorsFromDB[14]?.id, firstName: 'Юлия', lastName: 'Петрова', specialization: 'Невролог', departmentId: 3 },
        ].filter(d => d.userId); // Фильтруем записи без userId
        
        const doctors = await Doctor.bulkCreate(doctorsData, { ignoreDuplicates: true });
        console.log(`Создано профилей врачей: ${doctors.length}`);

        // ============================================
        // 8. ПРОФИЛИ ПАЦИЕНТОВ
        // ============================================
        // Получаем всех пациентов из базы, отсортированных по логину
        const allPatientsFromDB = await User.findAll({ 
            where: { login: { [Op.like]: 'patient%' } },
            order: [['login', 'ASC']]
        });
        
        const firstNames = ['Александр', 'Елена', 'Дмитрий', 'Сергей', 'Андрей', 'Мария', 'Ольга', 'Иван', 'Наталья', 'Владимир', 'Татьяна', 'Михаил', 'Анна', 'Павел', 'Юлия', 'Алексей', 'Екатерина', 'Денис', 'Светлана', 'Роман', 'Ирина', 'Андрей', 'Людмила', 'Николай', 'Оксана', 'Виктор', 'Галина', 'Максим', 'Валентина', 'Артём'];
        const lastNames = ['Смирнов', 'Иванова', 'Кузнецов', 'Соколов', 'Попов', 'Лебедева', 'Козлова', 'Новиков', 'Морозова', 'Петров', 'Волкова', 'Алексеев', 'Лебедева', 'Семёнов', 'Егорова', 'Павлов', 'Козлова', 'Степанов', 'Николаева', 'Орлов', 'Александрова', 'Романов', 'Васильева', 'Фёдоров', 'Михайлова', 'Рогозин', 'Меликова', 'Володин', 'Кузьмина', 'Тарасов'];
        const streets = ['Ленина', 'Пушкина', 'Гагарина', 'Мира', 'Советская'];
        
        const patientsData = allPatientsFromDB.map((user, index) => ({
            userId: user.id,
            firstName: firstNames[index % firstNames.length],
            lastName: lastNames[index % lastNames.length],
            phoneNumber: `+7 (9${String(index + 1).padStart(2, '0')}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 90 + 10)}`,
            address: `г. Москва, ул. ${streets[index % streets.length]}, д. ${Math.floor(Math.random() * 30 + 1)}, кв. ${Math.floor(Math.random() * 100 + 1)}`,
            age: Math.floor(Math.random() * 60 + 18),
        })).filter(p => p.userId); // Фильтруем записи без userId
        
        const patients = await Patient.bulkCreate(patientsData, { ignoreDuplicates: true });
        console.log(`Создано профилей пациентов: ${patients.length}`);

        // ============================================
        // 9. УСЛУГИ
        // ============================================
        const servicesData = [
            // Терапия
            { name: 'Консультация терапевта', price: 1500, duration: 30, description: 'Первичная консультация терапевта с осмотром и сбором анамнеза', departmentId: 1 },
            { name: 'Повторная консультация терапевта', price: 1200, duration: 20, description: 'Повторный приём терапевта', departmentId: 1 },
            { name: 'Профилактический осмотр', price: 2000, duration: 45, description: 'Полный профилактический осмотр', departmentId: 1 },
            // Кардиология
            { name: 'Консультация кардиолога', price: 2500, duration: 40, description: 'Консультация кардиолога с ЭКГ', departmentId: 2 },
            { name: 'ЭКГ с расшифровкой', price: 1500, duration: 20, description: 'Электрокардиограмма с расшифровкой', departmentId: 2 },
            { name: 'Суточное мониторирование ЭКГ', price: 3500, duration: 5, description: 'Холтеровское мониторирование ЭКГ на 24 часа', departmentId: 2 },
            { name: 'Эхокардиография', price: 3000, duration: 30, description: 'УЗИ сердца', departmentId: 2 },
            // Неврология
            { name: 'Консультация невролога', price: 2200, duration: 40, description: 'Консультация невролога с неврологическим осмотром', departmentId: 3 },
            { name: 'ЭЭГ (электроэнцефалография)', price: 2500, duration: 30, description: 'Электроэнцефалография головного мозга', departmentId: 3 },
            { name: 'УЗИ сосудов головы и шеи', price: 2800, duration: 30, description: 'Допплерография сосудов', departmentId: 3 },
            // Гастроэнтерология
            { name: 'Консультация гастроэнтеролога', price: 2300, duration: 40, description: 'Консультация гастроэнтеролога', departmentId: 4 },
            { name: 'ФГДС (гастроскопия)', price: 3500, duration: 20, description: 'Фиброгастродуоденоскопия', departmentId: 4 },
            { name: 'Колоноскопия', price: 5000, duration: 40, description: 'Эндоскопическое исследование толстого кишечника', departmentId: 4 },
            // Эндокринология
            { name: 'Консультация эндокринолога', price: 2400, duration: 40, description: 'Консультация эндокринолога', departmentId: 5 },
            { name: 'УЗИ щитовидной железы', price: 1800, duration: 20, description: 'Ультразвуковое исследование щитовидной железы', departmentId: 5 },
            // Офтальмология
            { name: 'Консультация офтальмолога', price: 2000, duration: 30, description: 'Консультация офтальмолога с проверкой зрения', departmentId: 6 },
            { name: 'Подбор очков', price: 1500, duration: 30, description: 'Подбор очков и рецепта', departmentId: 6 },
            { name: 'Осмотр глазного дна', price: 1800, duration: 20, description: 'Офтальмоскопия', departmentId: 6 },
            // Отоларингология
            { name: 'Консультация ЛОР-врача', price: 2000, duration: 30, description: 'Консультация отоларинголога', departmentId: 7 },
            { name: 'Аудиометрия', price: 1500, duration: 20, description: 'Исследование слуха', departmentId: 7 },
            // Дерматология
            { name: 'Консультация дерматолога', price: 2000, duration: 30, description: 'Консультация дерматолога', departmentId: 8 },
            { name: 'Удаление родинки', price: 3000, duration: 15, description: 'Удаление доброкачественного образования', departmentId: 8 },
            // Урология
            { name: 'Консультация уролога', price: 2200, duration: 30, description: 'Консультация уролога', departmentId: 9 },
            { name: 'УЗИ почек и мочевого пузыря', price: 2000, duration: 20, description: 'Ультразвуковое исследование', departmentId: 9 },
            // Гинекология
            { name: 'Консультация гинеколога', price: 2000, duration: 30, description: 'Консультация гинеколога', departmentId: 10 },
            { name: 'УЗИ органов малого таза', price: 2200, duration: 20, description: 'Ультразвуковое исследование', departmentId: 10 },
            { name: 'Кольпоскопия', price: 2500, duration: 20, description: 'Исследование шейки матки', departmentId: 10 },
            // Педиатрия
            { name: 'Консультация педиатра', price: 1800, duration: 30, description: 'Консультация педиатра', departmentId: 11 },
            { name: 'Вакцинация', price: 1500, duration: 15, description: 'Проведение вакцинации', departmentId: 11 },
            // Хирургия
            { name: 'Консультация хирурга', price: 2200, duration: 30, description: 'Консультация хирурга', departmentId: 12 },
            { name: 'Удаление аппендикса', price: 25000, duration: 60, description: 'Аппендэктомия', departmentId: 12 },
            // Лабораторная диагностика
            { name: 'Общий анализ крови', price: 800, duration: 5, description: 'Клинический анализ крови', departmentId: 13 },
            { name: 'Биохимический анализ крови', price: 2000, duration: 5, description: 'Биохимия крови (базовый)', departmentId: 13 },
            { name: 'Общий анализ мочи', price: 500, duration: 5, description: 'Клинический анализ мочи', departmentId: 13 },
            { name: 'Анализ на гормоны', price: 2500, duration: 5, description: 'Исследование гормонального фона', departmentId: 13 },
            { name: 'Анализ на онкомаркеры', price: 3500, duration: 5, description: 'Исследование онкомаркеров', departmentId: 13 },
            // УЗИ диагностика
            { name: 'УЗИ брюшной полости', price: 2500, duration: 30, description: 'УЗИ органов брюшной полости', departmentId: 14 },
            { name: 'УЗИ молочных желез', price: 2200, duration: 20, description: 'УЗИ молочных желез', departmentId: 14 },
            { name: 'УЗИ предстательной железы', price: 2000, duration: 20, description: 'ТРУЗИ простаты', departmentId: 14 },
            // Рентгенология
            { name: 'Рентген грудной клетки', price: 1500, duration: 10, description: 'Рентгенография органов грудной клетки', departmentId: 15 },
            { name: 'Рентген позвоночника', price: 2000, duration: 15, description: 'Рентгенография позвоночника', departmentId: 15 },
            { name: 'КТ головного мозга', price: 5000, duration: 30, description: 'Компьютерная томография', departmentId: 15 },
            { name: 'МРТ головного мозга', price: 6000, duration: 40, description: 'Магнитно-резонансная томография', departmentId: 15 },
        ];
        const services = await Service.bulkCreate(servicesData, { ignoreDuplicates: true });
        console.log(`Создано услуг: ${services.length}`);

        // ============================================
        // 10. РАСПИСАНИЕ ВРАЧЕЙ
        // ============================================
        const schedulesData = [];
        for (const doctor of doctors) {
            for (let day = 1; day <= 5; day++) { // Понедельник-пятница
                schedulesData.push({
                    doctorId: doctor.id,
                    dayOfWeek: day,
                    startTime: day % 2 === 1 ? '09:00' : '10:00',
                    endTime: day % 2 === 1 ? '18:00' : '17:00',
                });
            }
        }
        const schedules = await DoctorSchedule.bulkCreate(schedulesData, { ignoreDuplicates: true });
        console.log(`Создано расписаний: ${schedules.length}`);

        // ============================================
        // 11. ЗАПИСИ НА ПРИЁМ
        // ============================================
        const appointmentsData = [];
        const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
        const notes = ['Повторный приём', 'Первичный приём', 'Профилактический осмотр', null];
        
        for (let i = 0; i < 200; i++) {
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const service = services[Math.floor(Math.random() * services.length)];
            
            const dayOffset = Math.floor(Math.random() * 30);
            const hour = [9, 10, 11, 14, 15, 16][Math.floor(Math.random() * 6)];
            const minute = Math.floor(Math.random() * 2) * 30;
            
            const date = new Date();
            date.setDate(date.getDate() + dayOffset);
            date.setHours(hour, minute, 0, 0);
            
            appointmentsData.push({
                date,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                doctorId: doctor.id,
                patientId: patient.id,
                serviceId: service.id,
                notes: notes[Math.floor(Math.random() * notes.length)],
            });
        }
        const appointments = await Appointment.bulkCreate(appointmentsData, { ignoreDuplicates: true });
        console.log(`Создано записей на приём: ${appointments.length}`);

        // ============================================
        // 12. ДИАГНОЗЫ
        // ============================================
        const diagnosisNames = [
            'Гипертоническая болезнь', 'Сахарный диабет 2 типа', 'Остеохондроз позвоночника',
            'Гастрит', 'Бронхит', 'Пневмония', 'Ангина', 'Гипотиреоз', 'Аритмия', 'Мигрень',
            'Артрит', 'Цистит', 'Аллергический ринит', 'Экзема', 'Гиперхолестеринемия',
            'Железодефицитная анемия', 'Ожирение', 'Хронический тонзиллит', 'Конъюнктивит', 'ОРВИ'
        ];
        const conclusions = [
            'Рекомендовано наблюдение и лечение',
            'Требуется дополнительное обследование',
            'Состояние стабильное, продолжать лечение',
            'Выздоровление'
        ];
        
        const diagnosesData = [];
        for (let i = 0; i < 150; i++) {
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];
            
            // Находим случайную запись для этого пациента и врача
            const appointment = appointments.find(a => a.patientId === patient.id && a.doctorId === doctor.id);
            
            diagnosesData.push({
                name: diagnosisNames[Math.floor(Math.random() * diagnosisNames.length)],
                conclusion: Math.random() < 0.7 ? conclusions[Math.floor(Math.random() * conclusions.length)] : null,
                patientId: patient.id,
                doctorId: doctor.id,
                appointmentId: appointment ? appointment.id : null,
            });
        }
        const diagnoses = await Diagnosis.bulkCreate(diagnosesData, { ignoreDuplicates: true });
        console.log(`Создано диагнозов: ${diagnoses.length}`);

        // ============================================
        // 13. ДОКУМЕНТЫ БАЗЫ ЗНАНИЙ
        // ============================================
        const adminUser = await User.findOne({ where: { login: 'admin' } });
        const bloodTestService = await Service.findOne({ where: { name: 'Общий анализ крови' } });
        const fgdsService = await Service.findOne({ where: { name: 'ФГДС (гастроскопия)' } });
        const usiService = await Service.findOne({ where: { name: 'УЗИ брюшной полости' } });
        const colonService = await Service.findOne({ where: { name: 'Колоноскопия' } });
        
        const knowledgeDocs = await KnowledgeDocument.bulkCreate([
            {
                title: 'Подготовка к общему анализу крови',
                content: 'Перед сдачей общего анализа крови необходимо:\n1. Сдавать кровь натощак (не есть 8-12 часов)\n2. Можно пить чистую воду\n3. Исключить физические нагрузки за сутки до анализа\n4. Не курить за час до сдачи\n5. Сообщить врачу о принимаемых лекарствах',
                documentType: 'preparation_guide',
                serviceId: bloodTestService ? bloodTestService.id : null,
                version: 1,
                isActive: true,
                uploadedBy: adminUser ? adminUser.id : null,
            },
            {
                title: 'Подготовка к ФГДС',
                content: 'Подготовка к фиброгастродуоденоскопии:\n1. Последний приём пищи за 12 часов до процедуры\n2. Последний приём жидкости за 4 часа до процедуры\n3. Не курить в день процедуры\n4. Сообщить врачу о принимаемых лекарствах\n5. При необходимости врач назначит специальную диету за 2-3 дня до процедуры',
                documentType: 'preparation_guide',
                serviceId: fgdsService ? fgdsService.id : null,
                version: 1,
                isActive: true,
                uploadedBy: adminUser ? adminUser.id : null,
            },
            {
                title: 'Подготовка к УЗИ брюшной полости',
                content: 'Подготовка к ультразвуковому исследованию брюшной полости:\n1. За 3 дня до исследования исключить из рациона продукты, вызывающие газообразование\n2. Последний приём пищи за 8-12 часов до исследования\n3. Можно пить чистую воду\n4. При необходимости врач назначит приём препаратов для уменьшения газообразования\n5. Прийти на исследование натощак',
                documentType: 'preparation_guide',
                serviceId: usiService ? usiService.id : null,
                version: 1,
                isActive: true,
                uploadedBy: adminUser ? adminUser.id : null,
            },
            {
                title: 'Подготовка к колоноскопии',
                content: 'Подготовка к колоноскопии требует тщательной подготовки кишечника:\n1. За 3 дня до процедуры - бесшлаковая диета\n2. За день до процедуры - только прозрачные жидкости\n3. Вечером перед процедурой - приём слабительных препаратов по назначению врача\n4. В день процедуры - только вода до начала исследования\n5. Обязательно обсудите с врачом все детали подготовки',
                documentType: 'preparation_guide',
                serviceId: colonService ? colonService.id : null,
                version: 1,
                isActive: true,
                uploadedBy: adminUser ? adminUser.id : null,
            },
            {
                title: 'Общие правила посещения клиники',
                content: 'Правила посещения медицинского центра:\n1. Приходить на приём за 10-15 минут до назначенного времени\n2. Иметь при себе документ, удостоверяющий личность\n3. При наличии полиса ОМС или ДМС - принести его с собой\n4. Сообщить администратору о своём прибытии\n5. В случае опоздания более чем на 15 минут приём может быть отменён\n6. При отмене записи сообщить не менее чем за 24 часа\n7. Соблюдать тишину в клинике\n8. Не курить на территории клиники',
                documentType: 'regulation',
                serviceId: null,
                version: 1,
                isActive: true,
                uploadedBy: adminUser ? adminUser.id : null,
            },
            {
                title: 'Что взять с собой на приём',
                content: 'Список необходимых документов и вещей:\n1. Паспорт или другой документ, удостоверяющий личность\n2. Полис ОМС или ДМС (если есть)\n3. Результаты предыдущих анализов и обследований (если есть)\n4. Список принимаемых лекарств\n5. Медицинскую карту (если ведётся)\n6. Наличные деньги или банковскую карту для оплаты услуг',
                documentType: 'general',
                serviceId: null,
                version: 1,
                isActive: true,
                uploadedBy: adminUser ? adminUser.id : null,
            },
            {
                title: 'Режим работы клиники',
                content: 'Режим работы медицинского центра:\nПонедельник - Пятница: 08:00 - 20:00\nСуббота: 09:00 - 18:00\nВоскресенье: выходной\n\nПриём ведётся по предварительной записи.\nЭкстренные случаи принимаются в любое время.',
                documentType: 'regulation',
                serviceId: null,
                version: 1,
                isActive: true,
                uploadedBy: adminUser ? adminUser.id : null,
            },
        ], { ignoreDuplicates: true });
        console.log(`Создано документов базы знаний: ${knowledgeDocs.length}`);

        // ============================================
        // 14. ОТЧЁТЫ
        // ============================================
        const reportTypes = ['appointments', 'diagnoses', 'patients', 'doctors', 'services', 'schedule'];
        const formats = ['excel', 'word'];
        const reportStatuses = ['pending', 'processing', 'completed', 'failed'];
        
        const reportsData = [];
        for (let i = 0; i < 10; i++) {
            reportsData.push({
                reportType: reportTypes[i % reportTypes.length],
                format: formats[i % 2],
                status: reportStatuses[i % 4],
                filters: {
                    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    dateTo: new Date().toISOString().split('T')[0],
                },
                createdBy: adminUser ? adminUser.id : null,
            });
        }
        const reports = await ReportJob.bulkCreate(reportsData, { ignoreDuplicates: true });
        console.log(`Создано заданий на отчёты: ${reports.length}`);

        // ============================================
        // ИТОГОВАЯ СТАТИСТИКА
        // ============================================
        console.log('\n=== ИТОГОВАЯ СТАТИСТИКА ===');
        console.log(`Пользователей: ${await User.count()}`);
        console.log(`Пациентов: ${await Patient.count()}`);
        console.log(`Врачей: ${await Doctor.count()}`);
        console.log(`Отделений: ${await Department.count()}`);
        console.log(`Услуг: ${await Service.count()}`);
        console.log(`Расписаний: ${await DoctorSchedule.count()}`);
        console.log(`Записей на приём: ${await Appointment.count()}`);
        console.log(`Диагнозов: ${await Diagnosis.count()}`);
        console.log(`Документов базы знаний: ${await KnowledgeDocument.count()}`);
        console.log(`Заданий на отчёты: ${await ReportJob.count()}`);
        console.log('\n✅ База данных успешно заполнена тестовыми данными!');
        console.log('\n📝 Учётные данные для входа:');
        console.log('   Администратор: admin / password123');
        console.log('   Врач: doctor1 / password123');
        console.log('   Пациент: patient1 / password123');

    } catch (error) {
        console.error('Ошибка при заполнении базы данных:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

seedDatabase();
