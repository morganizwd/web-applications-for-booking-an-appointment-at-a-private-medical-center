-- ============================================
-- SQL скрипт для заполнения базы данных тестовыми данными
-- ============================================
-- Использование: psql -U postgres -d medical_center -f seed-test-data.sql
-- Или через psql: \i seed-test-data.sql
-- 
-- ВАЖНО: Все пароли для тестовых пользователей: "password123"
-- Для генерации хеша используйте: node scripts/generate-password-hash.js

-- Очистка существующих данных (опционально, раскомментируйте при необходимости)
-- TRUNCATE TABLE "KnowledgeEmbeddings" CASCADE;
-- TRUNCATE TABLE "KnowledgeChunks" CASCADE;
-- TRUNCATE TABLE "KnowledgeDocuments" CASCADE;
-- TRUNCATE TABLE "ReportFiles" CASCADE;
-- TRUNCATE TABLE "ReportJobs" CASCADE;
-- TRUNCATE TABLE "Diagnoses" CASCADE;
-- TRUNCATE TABLE "Appointments" CASCADE;
-- TRUNCATE TABLE "DoctorSchedules" CASCADE;
-- TRUNCATE TABLE "Services" CASCADE;
-- TRUNCATE TABLE "Doctors" CASCADE;
-- TRUNCATE TABLE "Patients" CASCADE;
-- TRUNCATE TABLE "UserRoles" CASCADE;
-- TRUNCATE TABLE "Users" CASCADE;
-- TRUNCATE TABLE "Departments" CASCADE;

-- ============================================
-- 1. ОТДЕЛЕНИЯ (Departments)
-- ============================================
INSERT INTO "Departments" (name, description, "createdAt", "updatedAt") VALUES
('Терапия', 'Общая терапия и консультации', NOW(), NOW()),
('Кардиология', 'Диагностика и лечение заболеваний сердечно-сосудистой системы', NOW(), NOW()),
('Неврология', 'Лечение заболеваний нервной системы', NOW(), NOW()),
('Гастроэнтерология', 'Диагностика и лечение заболеваний ЖКТ', NOW(), NOW()),
('Эндокринология', 'Лечение заболеваний эндокринной системы', NOW(), NOW()),
('Офтальмология', 'Диагностика и лечение заболеваний глаз', NOW(), NOW()),
('Отоларингология', 'Лечение заболеваний уха, горла и носа', NOW(), NOW()),
('Дерматология', 'Лечение заболеваний кожи', NOW(), NOW()),
('Урология', 'Лечение заболеваний мочеполовой системы', NOW(), NOW()),
('Гинекология', 'Женское здоровье', NOW(), NOW()),
('Педиатрия', 'Лечение детей', NOW(), NOW()),
('Хирургия', 'Хирургические операции', NOW(), NOW()),
('Лабораторная диагностика', 'Анализы и исследования', NOW(), NOW()),
('УЗИ диагностика', 'Ультразвуковые исследования', NOW(), NOW()),
('Рентгенология', 'Рентгеновские исследования', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. РОЛИ (Roles) - проверка существования
-- ============================================
INSERT INTO "Roles" (name, description, "createdAt", "updatedAt") 
SELECT 'admin', 'Администратор системы', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Roles" WHERE name = 'admin');

INSERT INTO "Roles" (name, description, "createdAt", "updatedAt") 
SELECT 'doctor', 'Врач', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Roles" WHERE name = 'doctor');

INSERT INTO "Roles" (name, description, "createdAt", "updatedAt") 
SELECT 'patient', 'Пациент', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Roles" WHERE name = 'patient');

-- ============================================
-- 3. ПОЛЬЗОВАТЕЛИ (Users)
-- Пароль для всех: "password123"
-- Хеш: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================

-- Администраторы
INSERT INTO "Users" (login, password, email, "isActive", "createdAt", "updatedAt") VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@clinic.ru', true, NOW(), NOW()),
('admin2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin2@clinic.ru', true, NOW(), NOW())
ON CONFLICT (login) DO NOTHING;

-- Врачи
INSERT INTO "Users" (login, password, email, "isActive", "createdAt", "updatedAt") VALUES
('doctor1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'petrov@clinic.ru', true, NOW(), NOW()),
('doctor2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ivanova@clinic.ru', true, NOW(), NOW()),
('doctor3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'sidorov@clinic.ru', true, NOW(), NOW()),
('doctor4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'kozlov@clinic.ru', true, NOW(), NOW()),
('doctor5', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'volkov@clinic.ru', true, NOW(), NOW()),
('doctor6', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'morozov@clinic.ru', true, NOW(), NOW()),
('doctor7', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'novikov@clinic.ru', true, NOW(), NOW()),
('doctor8', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'fedorov@clinic.ru', true, NOW(), NOW()),
('doctor9', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'sokolov@clinic.ru', true, NOW(), NOW()),
('doctor10', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'popov@clinic.ru', true, NOW(), NOW()),
('doctor11', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'lebedev@clinic.ru', true, NOW(), NOW()),
('doctor12', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'kozlov2@clinic.ru', true, NOW(), NOW()),
('doctor13', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'novikov2@clinic.ru', true, NOW(), NOW()),
('doctor14', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'morozov2@clinic.ru', true, NOW(), NOW()),
('doctor15', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'petrov2@clinic.ru', true, NOW(), NOW())
ON CONFLICT (login) DO NOTHING;

-- Пациенты
INSERT INTO "Users" (login, password, email, "isActive", "createdAt", "updatedAt") VALUES
('patient1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'smirnov@mail.ru', true, NOW(), NOW()),
('patient2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ivanov@mail.ru', true, NOW(), NOW()),
('patient3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'kuznetsov@mail.ru', true, NOW(), NOW()),
('patient4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'sokolov@mail.ru', true, NOW(), NOW()),
('patient5', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'popov@mail.ru', true, NOW(), NOW()),
('patient6', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'lebedev@mail.ru', true, NOW(), NOW()),
('patient7', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'kozlov@mail.ru', true, NOW(), NOW()),
('patient8', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'novikov@mail.ru', true, NOW(), NOW()),
('patient9', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'morozov@mail.ru', true, NOW(), NOW()),
('patient10', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'petrov@mail.ru', true, NOW(), NOW()),
('patient11', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'volkov@mail.ru', true, NOW(), NOW()),
('patient12', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'alekseev@mail.ru', true, NOW(), NOW()),
('patient13', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'lebedev2@mail.ru', true, NOW(), NOW()),
('patient14', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'semenov@mail.ru', true, NOW(), NOW()),
('patient15', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'egorov@mail.ru', true, NOW(), NOW()),
('patient16', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'pavlov@mail.ru', true, NOW(), NOW()),
('patient17', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'kozlov2@mail.ru', true, NOW(), NOW()),
('patient18', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'stepanov@mail.ru', true, NOW(), NOW()),
('patient19', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nikolaev@mail.ru', true, NOW(), NOW()),
('patient20', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'orlov@mail.ru', true, NOW(), NOW()),
('patient21', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'aleksandrov@mail.ru', true, NOW(), NOW()),
('patient22', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'romanov@mail.ru', true, NOW(), NOW()),
('patient23', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'vasiliev@mail.ru', true, NOW(), NOW()),
('patient24', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'fedorov@mail.ru', true, NOW(), NOW()),
('patient25', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'mikhailov@mail.ru', true, NOW(), NOW()),
('patient26', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'rogozin@mail.ru', true, NOW(), NOW()),
('patient27', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'melikov@mail.ru', true, NOW(), NOW()),
('patient28', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'volodin@mail.ru', true, NOW(), NOW()),
('patient29', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'kuzmin@mail.ru', true, NOW(), NOW()),
('patient30', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'tarasov@mail.ru', true, NOW(), NOW())
ON CONFLICT (login) DO NOTHING;

-- ============================================
-- 4. СВЯЗИ ПОЛЬЗОВАТЕЛЕЙ И РОЛЕЙ (UserRoles)
-- ============================================
-- Администраторы
INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
SELECT u.id, r.id, NOW(), NOW()
FROM "Users" u
CROSS JOIN "Roles" r
WHERE u.login IN ('admin', 'admin2') AND r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Врачи
INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
SELECT u.id, r.id, NOW(), NOW()
FROM "Users" u
CROSS JOIN "Roles" r
WHERE u.login LIKE 'doctor%' AND r.name = 'doctor'
ON CONFLICT DO NOTHING;

-- Пациенты
INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
SELECT u.id, r.id, NOW(), NOW()
FROM "Users" u
CROSS JOIN "Roles" r
WHERE u.login LIKE 'patient%' AND r.name = 'patient'
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. ПРОФИЛИ ВРАЧЕЙ (Doctors)
-- ============================================
INSERT INTO "Doctors" ("userId", "firstName", "lastName", specialization, "departmentId", "createdAt", "updatedAt")
SELECT 
    u.id,
    CASE u.login
        WHEN 'doctor1' THEN 'Александр'
        WHEN 'doctor2' THEN 'Елена'
        WHEN 'doctor3' THEN 'Дмитрий'
        WHEN 'doctor4' THEN 'Сергей'
        WHEN 'doctor5' THEN 'Андрей'
        WHEN 'doctor6' THEN 'Мария'
        WHEN 'doctor7' THEN 'Ольга'
        WHEN 'doctor8' THEN 'Иван'
        WHEN 'doctor9' THEN 'Наталья'
        WHEN 'doctor10' THEN 'Владимир'
        WHEN 'doctor11' THEN 'Татьяна'
        WHEN 'doctor12' THEN 'Михаил'
        WHEN 'doctor13' THEN 'Анна'
        WHEN 'doctor14' THEN 'Павел'
        WHEN 'doctor15' THEN 'Юлия'
    END,
    CASE u.login
        WHEN 'doctor1' THEN 'Петров'
        WHEN 'doctor2' THEN 'Иванова'
        WHEN 'doctor3' THEN 'Сидоров'
        WHEN 'doctor4' THEN 'Козлов'
        WHEN 'doctor5' THEN 'Волков'
        WHEN 'doctor6' THEN 'Морозова'
        WHEN 'doctor7' THEN 'Новикова'
        WHEN 'doctor8' THEN 'Фёдоров'
        WHEN 'doctor9' THEN 'Соколова'
        WHEN 'doctor10' THEN 'Попов'
        WHEN 'doctor11' THEN 'Лебедева'
        WHEN 'doctor12' THEN 'Козлов'
        WHEN 'doctor13' THEN 'Новиков'
        WHEN 'doctor14' THEN 'Морозов'
        WHEN 'doctor15' THEN 'Петрова'
    END,
    CASE u.login
        WHEN 'doctor1' THEN 'Терапевт'
        WHEN 'doctor2' THEN 'Кардиолог'
        WHEN 'doctor3' THEN 'Невролог'
        WHEN 'doctor4' THEN 'Гастроэнтеролог'
        WHEN 'doctor5' THEN 'Эндокринолог'
        WHEN 'doctor6' THEN 'Офтальмолог'
        WHEN 'doctor7' THEN 'Отоларинголог'
        WHEN 'doctor8' THEN 'Дерматолог'
        WHEN 'doctor9' THEN 'Уролог'
        WHEN 'doctor10' THEN 'Гинеколог'
        WHEN 'doctor11' THEN 'Педиатр'
        WHEN 'doctor12' THEN 'Хирург'
        WHEN 'doctor13' THEN 'Терапевт'
        WHEN 'doctor14' THEN 'Кардиолог'
        WHEN 'doctor15' THEN 'Невролог'
    END,
    CASE u.login
        WHEN 'doctor1' THEN 1
        WHEN 'doctor2' THEN 2
        WHEN 'doctor3' THEN 3
        WHEN 'doctor4' THEN 4
        WHEN 'doctor5' THEN 5
        WHEN 'doctor6' THEN 6
        WHEN 'doctor7' THEN 7
        WHEN 'doctor8' THEN 8
        WHEN 'doctor9' THEN 9
        WHEN 'doctor10' THEN 10
        WHEN 'doctor11' THEN 11
        WHEN 'doctor12' THEN 12
        WHEN 'doctor13' THEN 1
        WHEN 'doctor14' THEN 2
        WHEN 'doctor15' THEN 3
    END,
    NOW(), NOW()
FROM "Users" u
WHERE u.login LIKE 'doctor%'
ON CONFLICT ("userId") DO NOTHING;

-- ============================================
-- 6. ПРОФИЛИ ПАЦИЕНТОВ (Patients)
-- ============================================
INSERT INTO "Patients" ("userId", "firstName", "lastName", "phoneNumber", address, age, "createdAt", "updatedAt")
VALUES
((SELECT id FROM "Users" WHERE login = 'patient1'), 'Александр', 'Смирнов', '+7 (901) 123-45-67', 'г. Москва, ул. Ленина, д. 10, кв. 25', 35, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient2'), 'Елена', 'Иванова', '+7 (902) 234-56-78', 'г. Москва, ул. Пушкина, д. 20, кв. 15', 28, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient3'), 'Дмитрий', 'Кузнецов', '+7 (903) 345-67-89', 'г. Москва, ул. Гагарина, д. 5, кв. 42', 42, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient4'), 'Сергей', 'Соколов', '+7 (904) 456-78-90', 'г. Москва, ул. Мира, д. 15, кв. 8', 31, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient5'), 'Андрей', 'Попов', '+7 (905) 567-89-01', 'г. Москва, ул. Советская, д. 30, кв. 12', 45, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient6'), 'Мария', 'Лебедева', '+7 (906) 678-90-12', 'г. Москва, ул. Ленина, д. 8, кв. 33', 29, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient7'), 'Ольга', 'Козлова', '+7 (907) 789-01-23', 'г. Москва, ул. Пушкина, д. 12, кв. 7', 38, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient8'), 'Иван', 'Новиков', '+7 (908) 890-12-34', 'г. Москва, ул. Гагарина, д. 25, кв. 19', 52, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient9'), 'Наталья', 'Морозова', '+7 (909) 901-23-45', 'г. Москва, ул. Мира, д. 18, кв. 55', 26, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient10'), 'Владимир', 'Петров', '+7 (910) 012-34-56', 'г. Москва, ул. Советская, д. 22, кв. 11', 48, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient11'), 'Татьяна', 'Волкова', '+7 (911) 123-45-67', 'г. Москва, ул. Ленина, д. 7, кв. 44', 33, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient12'), 'Михаил', 'Алексеев', '+7 (912) 234-56-78', 'г. Москва, ул. Пушкина, д. 14, кв. 22', 41, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient13'), 'Анна', 'Лебедева', '+7 (913) 345-67-89', 'г. Москва, ул. Гагарина, д. 9, кв. 6', 27, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient14'), 'Павел', 'Семёнов', '+7 (914) 456-78-90', 'г. Москва, ул. Мира, д. 11, кв. 38', 39, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient15'), 'Юлия', 'Егорова', '+7 (915) 567-89-01', 'г. Москва, ул. Советская, д. 16, кв. 9', 24, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient16'), 'Алексей', 'Павлов', '+7 (916) 678-90-12', 'г. Москва, ул. Ленина, д. 13, кв. 27', 36, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient17'), 'Екатерина', 'Козлова', '+7 (917) 789-01-23', 'г. Москва, ул. Пушкина, д. 6, кв. 14', 30, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient18'), 'Денис', 'Степанов', '+7 (918) 890-12-34', 'г. Москва, ул. Гагарина, д. 19, кв. 51', 43, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient19'), 'Светлана', 'Николаева', '+7 (919) 901-23-45', 'г. Москва, ул. Мира, д. 4, кв. 3', 25, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient20'), 'Роман', 'Орлов', '+7 (920) 012-34-56', 'г. Москва, ул. Советская, д. 28, кв. 16', 47, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient21'), 'Ирина', 'Александрова', '+7 (921) 123-45-67', 'г. Москва, ул. Ленина, д. 17, кв. 29', 32, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient22'), 'Андрей', 'Романов', '+7 (922) 234-56-78', 'г. Москва, ул. Пушкина, д. 21, кв. 13', 40, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient23'), 'Людмила', 'Васильева', '+7 (923) 345-67-89', 'г. Москва, ул. Гагарина, д. 3, кв. 47', 34, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient24'), 'Николай', 'Фёдоров', '+7 (924) 456-78-90', 'г. Москва, ул. Мира, д. 26, кв. 21', 46, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient25'), 'Оксана', 'Михайлова', '+7 (925) 567-89-01', 'г. Москва, ул. Советская, д. 2, кв. 5', 23, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient26'), 'Виктор', 'Рогозин', '+7 (926) 678-90-12', 'г. Москва, ул. Ленина, д. 24, кв. 18', 50, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient27'), 'Галина', 'Меликова', '+7 (927) 789-01-23', 'г. Москва, ул. Пушкина, д. 1, кв. 2', 37, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient28'), 'Максим', 'Володин', '+7 (928) 890-12-34', 'г. Москва, ул. Гагарина, д. 27, кв. 40', 44, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient29'), 'Валентина', 'Кузьмина', '+7 (929) 901-23-45', 'г. Москва, ул. Мира, д. 23, кв. 35', 31, NOW(), NOW()),
((SELECT id FROM "Users" WHERE login = 'patient30'), 'Артём', 'Тарасов', '+7 (930) 012-34-56', 'г. Москва, ул. Советская, д. 9, кв. 4', 28, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- ============================================
-- 7. УСЛУГИ (Services)
-- ============================================
INSERT INTO "Services" (name, price, duration, description, "departmentId", "createdAt", "updatedAt") VALUES
-- Терапия
('Консультация терапевта', 1500, 30, 'Первичная консультация терапевта с осмотром и сбором анамнеза', 1, NOW(), NOW()),
('Повторная консультация терапевта', 1200, 20, 'Повторный приём терапевта', 1, NOW(), NOW()),
('Профилактический осмотр', 2000, 45, 'Полный профилактический осмотр', 1, NOW(), NOW()),

-- Кардиология
('Консультация кардиолога', 2500, 40, 'Консультация кардиолога с ЭКГ', 2, NOW(), NOW()),
('ЭКГ с расшифровкой', 1500, 20, 'Электрокардиограмма с расшифровкой', 2, NOW(), NOW()),
('Суточное мониторирование ЭКГ', 3500, 5, 'Холтеровское мониторирование ЭКГ на 24 часа', 2, NOW(), NOW()),
('Эхокардиография', 3000, 30, 'УЗИ сердца', 2, NOW(), NOW()),

-- Неврология
('Консультация невролога', 2200, 40, 'Консультация невролога с неврологическим осмотром', 3, NOW(), NOW()),
('ЭЭГ (электроэнцефалография)', 2500, 30, 'Электроэнцефалография головного мозга', 3, NOW(), NOW()),
('УЗИ сосудов головы и шеи', 2800, 30, 'Допплерография сосудов', 3, NOW(), NOW()),

-- Гастроэнтерология
('Консультация гастроэнтеролога', 2300, 40, 'Консультация гастроэнтеролога', 4, NOW(), NOW()),
('ФГДС (гастроскопия)', 3500, 20, 'Фиброгастродуоденоскопия', 4, NOW(), NOW()),
('Колоноскопия', 5000, 40, 'Эндоскопическое исследование толстого кишечника', 4, NOW(), NOW()),

-- Эндокринология
('Консультация эндокринолога', 2400, 40, 'Консультация эндокринолога', 5, NOW(), NOW()),
('УЗИ щитовидной железы', 1800, 20, 'Ультразвуковое исследование щитовидной железы', 5, NOW(), NOW()),

-- Офтальмология
('Консультация офтальмолога', 2000, 30, 'Консультация офтальмолога с проверкой зрения', 6, NOW(), NOW()),
('Подбор очков', 1500, 30, 'Подбор очков и рецепта', 6, NOW(), NOW()),
('Осмотр глазного дна', 1800, 20, 'Офтальмоскопия', 6, NOW(), NOW()),

-- Отоларингология
('Консультация ЛОР-врача', 2000, 30, 'Консультация отоларинголога', 7, NOW(), NOW()),
('Аудиометрия', 1500, 20, 'Исследование слуха', 7, NOW(), NOW()),

-- Дерматология
('Консультация дерматолога', 2000, 30, 'Консультация дерматолога', 8, NOW(), NOW()),
('Удаление родинки', 3000, 15, 'Удаление доброкачественного образования', 8, NOW(), NOW()),

-- Урология
('Консультация уролога', 2200, 30, 'Консультация уролога', 9, NOW(), NOW()),
('УЗИ почек и мочевого пузыря', 2000, 20, 'Ультразвуковое исследование', 9, NOW(), NOW()),

-- Гинекология
('Консультация гинеколога', 2000, 30, 'Консультация гинеколога', 10, NOW(), NOW()),
('УЗИ органов малого таза', 2200, 20, 'Ультразвуковое исследование', 10, NOW(), NOW()),
('Кольпоскопия', 2500, 20, 'Исследование шейки матки', 10, NOW(), NOW()),

-- Педиатрия
('Консультация педиатра', 1800, 30, 'Консультация педиатра', 11, NOW(), NOW()),
('Вакцинация', 1500, 15, 'Проведение вакцинации', 11, NOW(), NOW()),

-- Хирургия
('Консультация хирурга', 2200, 30, 'Консультация хирурга', 12, NOW(), NOW()),
('Удаление аппендикса', 25000, 60, 'Аппендэктомия', 12, NOW(), NOW()),

-- Лабораторная диагностика
('Общий анализ крови', 800, 5, 'Клинический анализ крови', 13, NOW(), NOW()),
('Биохимический анализ крови', 2000, 5, 'Биохимия крови (базовый)', 13, NOW(), NOW()),
('Общий анализ мочи', 500, 5, 'Клинический анализ мочи', 13, NOW(), NOW()),
('Анализ на гормоны', 2500, 5, 'Исследование гормонального фона', 13, NOW(), NOW()),
('Анализ на онкомаркеры', 3500, 5, 'Исследование онкомаркеров', 13, NOW(), NOW()),

-- УЗИ диагностика
('УЗИ брюшной полости', 2500, 30, 'УЗИ органов брюшной полости', 14, NOW(), NOW()),
('УЗИ молочных желез', 2200, 20, 'УЗИ молочных желез', 14, NOW(), NOW()),
('УЗИ предстательной железы', 2000, 20, 'ТРУЗИ простаты', 14, NOW(), NOW()),

-- Рентгенология
('Рентген грудной клетки', 1500, 10, 'Рентгенография органов грудной клетки', 15, NOW(), NOW()),
('Рентген позвоночника', 2000, 15, 'Рентгенография позвоночника', 15, NOW(), NOW()),
('КТ головного мозга', 5000, 30, 'Компьютерная томография', 15, NOW(), NOW()),
('МРТ головного мозга', 6000, 40, 'Магнитно-резонансная томография', 15, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. РАСПИСАНИЕ ВРАЧЕЙ (DoctorSchedules)
-- ============================================
-- Генерируем расписание для всех врачей на рабочие дни (понедельник-пятница, день недели 1-5)
INSERT INTO "DoctorSchedules" ("doctorId", "dayOfWeek", "startTime", "endTime", "createdAt", "updatedAt")
SELECT 
    d.id,
    day,
    CASE 
        WHEN day IN (1, 3, 5) THEN '09:00'::time  -- Пн, Ср, Пт
        ELSE '10:00'::time  -- Вт, Чт
    END,
    CASE 
        WHEN day IN (1, 3, 5) THEN '18:00'::time
        ELSE '17:00'::time
    END,
    NOW(), NOW()
FROM "Doctors" d
CROSS JOIN generate_series(1, 5) AS day  -- Понедельник-пятница
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. ЗАПИСИ НА ПРИЁМ (Appointments)
-- ============================================
-- Генерируем записи на ближайшие 30 дней
DO $$
DECLARE
    doctor_rec RECORD;
    patient_rec RECORD;
    service_rec RECORD;
    appt_date TIMESTAMP;
    appt_status TEXT;
    day_offset INT;
    hour_offset INT;
    minute_offset INT;
    counter INT := 0;
BEGIN
    FOR doctor_rec IN SELECT id FROM "Doctors" LIMIT 15 LOOP
        FOR patient_rec IN SELECT id FROM "Patients" LIMIT 30 LOOP
            FOR service_rec IN SELECT id, duration FROM "Services" LIMIT 50 LOOP
                IF counter >= 200 THEN
                    EXIT;
                END IF;
                
                IF random() < 0.15 THEN  -- 15% вероятность создания записи
                    day_offset := floor(random() * 30)::int;
                    hour_offset := CASE 
                        WHEN random() < 0.3 THEN 9
                        WHEN random() < 0.5 THEN 10
                        WHEN random() < 0.7 THEN 11
                        WHEN random() < 0.85 THEN 14
                        WHEN random() < 0.95 THEN 15
                        ELSE 16
                    END;
                    minute_offset := (floor(random() * 2) * 30)::int;
                    
                    appt_date := (CURRENT_DATE + day_offset)::timestamp + 
                                 (hour_offset || ' hours')::interval + 
                                 (minute_offset || ' minutes')::interval;
                    
                    appt_status := CASE (floor(random() * 5)::int)
                        WHEN 0 THEN 'scheduled'
                        WHEN 1 THEN 'confirmed'
                        WHEN 2 THEN 'completed'
                        WHEN 3 THEN 'cancelled'
                        ELSE 'no_show'
                    END;
                    
                    INSERT INTO "Appointments" (date, status, "doctorId", "patientId", "serviceId", notes, "createdAt", "updatedAt")
                    VALUES (
                        appt_date,
                        appt_status,
                        doctor_rec.id,
                        patient_rec.id,
                        service_rec.id,
                        CASE 
                            WHEN random() < 0.3 THEN 'Повторный приём'
                            WHEN random() < 0.5 THEN 'Первичный приём'
                            WHEN random() < 0.7 THEN 'Профилактический осмотр'
                            ELSE NULL
                        END,
                        NOW() - (random() * 30)::int * '1 day'::interval,
                        NOW() - (random() * 30)::int * '1 day'::interval
                    )
                    ON CONFLICT DO NOTHING;
                    
                    counter := counter + 1;
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 10. ДИАГНОЗЫ (Diagnoses)
-- ============================================
DO $$
DECLARE
    patient_rec RECORD;
    doctor_rec RECORD;
    appointment_rec RECORD;
    diagnosis_name TEXT;
    diagnosis_conclusion TEXT;
    counter INT := 0;
    diagnosis_names TEXT[] := ARRAY[
        'Гипертоническая болезнь', 'Сахарный диабет 2 типа', 'Остеохондроз позвоночника',
        'Гастрит', 'Бронхит', 'Пневмония', 'Ангина', 'Гипотиреоз', 'Аритмия', 'Мигрень',
        'Артрит', 'Цистит', 'Аллергический ринит', 'Экзема', 'Гиперхолестеринемия',
        'Железодефицитная анемия', 'Ожирение', 'Хронический тонзиллит', 'Конъюнктивит', 'ОРВИ'
    ];
    conclusions TEXT[] := ARRAY[
        'Рекомендовано наблюдение и лечение',
        'Требуется дополнительное обследование',
        'Состояние стабильное, продолжать лечение',
        'Выздоровление'
    ];
BEGIN
    FOR patient_rec IN SELECT id FROM "Patients" LIMIT 30 LOOP
        FOR doctor_rec IN SELECT id FROM "Doctors" LIMIT 15 LOOP
            IF counter >= 150 THEN
                EXIT;
            END IF;
            
            IF random() < 0.4 THEN  -- 40% вероятность создания диагноза
                diagnosis_name := diagnosis_names[floor(random() * array_length(diagnosis_names, 1))::int + 1];
                diagnosis_conclusion := conclusions[floor(random() * array_length(conclusions, 1))::int + 1];
                
                SELECT id INTO appointment_rec 
                FROM "Appointments" 
                WHERE "patientId" = patient_rec.id AND "doctorId" = doctor_rec.id 
                LIMIT 1;
                
                INSERT INTO "Diagnoses" (name, conclusion, "patientId", "doctorId", "appointmentId", "createdAt", "updatedAt")
                VALUES (
                    diagnosis_name,
                    CASE WHEN random() < 0.7 THEN diagnosis_conclusion ELSE NULL END,
                    patient_rec.id,
                    doctor_rec.id,
                    appointment_rec.id,
                    NOW() - (random() * 90)::int * '1 day'::interval,
                    NOW() - (random() * 90)::int * '1 day'::interval
                )
                ON CONFLICT DO NOTHING;
                
                counter := counter + 1;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 11. ДОКУМЕНТЫ БАЗЫ ЗНАНИЙ (KnowledgeDocuments)
-- ============================================
INSERT INTO "KnowledgeDocuments" (title, content, "documentType", "serviceId", version, "isActive", "uploadedBy", "createdAt", "updatedAt")
SELECT 
    'Подготовка к общему анализу крови',
    'Перед сдачей общего анализа крови необходимо:
1. Сдавать кровь натощак (не есть 8-12 часов)
2. Можно пить чистую воду
3. Исключить физические нагрузки за сутки до анализа
4. Не курить за час до сдачи
5. Сообщить врачу о принимаемых лекарствах',
    'preparation_guide',
    s.id,
    1,
    true,
    (SELECT id FROM "Users" WHERE login = 'admin' LIMIT 1),
    NOW(),
    NOW()
FROM "Services" s
WHERE s.name = 'Общий анализ крови'
ON CONFLICT DO NOTHING;

INSERT INTO "KnowledgeDocuments" (title, content, "documentType", "serviceId", version, "isActive", "uploadedBy", "createdAt", "updatedAt")
SELECT 
    'Подготовка к ФГДС',
    'Подготовка к фиброгастродуоденоскопии:
1. Последний приём пищи за 12 часов до процедуры
2. Последний приём жидкости за 4 часа до процедуры
3. Не курить в день процедуры
4. Сообщить врачу о принимаемых лекарствах
5. При необходимости врач назначит специальную диету за 2-3 дня до процедуры',
    'preparation_guide',
    s.id,
    1,
    true,
    (SELECT id FROM "Users" WHERE login = 'admin' LIMIT 1),
    NOW(),
    NOW()
FROM "Services" s
WHERE s.name = 'ФГДС (гастроскопия)'
ON CONFLICT DO NOTHING;

INSERT INTO "KnowledgeDocuments" (title, content, "documentType", "serviceId", version, "isActive", "uploadedBy", "createdAt", "updatedAt")
SELECT 
    'Подготовка к УЗИ брюшной полости',
    'Подготовка к ультразвуковому исследованию брюшной полости:
1. За 3 дня до исследования исключить из рациона продукты, вызывающие газообразование
2. Последний приём пищи за 8-12 часов до исследования
3. Можно пить чистую воду
4. При необходимости врач назначит приём препаратов для уменьшения газообразования
5. Прийти на исследование натощак',
    'preparation_guide',
    s.id,
    1,
    true,
    (SELECT id FROM "Users" WHERE login = 'admin' LIMIT 1),
    NOW(),
    NOW()
FROM "Services" s
WHERE s.name = 'УЗИ брюшной полости'
ON CONFLICT DO NOTHING;

INSERT INTO "KnowledgeDocuments" (title, content, "documentType", "serviceId", version, "isActive", "uploadedBy", "createdAt", "updatedAt")
SELECT 
    'Подготовка к колоноскопии',
    'Подготовка к колоноскопии требует тщательной подготовки кишечника:
1. За 3 дня до процедуры - бесшлаковая диета
2. За день до процедуры - только прозрачные жидкости
3. Вечером перед процедурой - приём слабительных препаратов по назначению врача
4. В день процедуры - только вода до начала исследования
5. Обязательно обсудите с врачом все детали подготовки',
    'preparation_guide',
    s.id,
    1,
    true,
    (SELECT id FROM "Users" WHERE login = 'admin' LIMIT 1),
    NOW(),
    NOW()
FROM "Services" s
WHERE s.name = 'Колоноскопия'
ON CONFLICT DO NOTHING;

INSERT INTO "KnowledgeDocuments" (title, content, "documentType", version, "isActive", "uploadedBy", "createdAt", "updatedAt") VALUES
('Общие правила посещения клиники', 
'Правила посещения медицинского центра:
1. Приходить на приём за 10-15 минут до назначенного времени
2. Иметь при себе документ, удостоверяющий личность
3. При наличии полиса ОМС или ДМС - принести его с собой
4. Сообщить администратору о своём прибытии
5. В случае опоздания более чем на 15 минут приём может быть отменён
6. При отмене записи сообщить не менее чем за 24 часа
7. Соблюдать тишину в клинике
8. Не курить на территории клиники',
'regulation', 1, true, (SELECT id FROM "Users" WHERE login = 'admin' LIMIT 1), NOW(), NOW()),

('Что взять с собой на приём', 
'Список необходимых документов и вещей:
1. Паспорт или другой документ, удостоверяющий личность
2. Полис ОМС или ДМС (если есть)
3. Результаты предыдущих анализов и обследований (если есть)
4. Список принимаемых лекарств
5. Медицинскую карту (если ведётся)
6. Наличные деньги или банковскую карту для оплаты услуг',
'general', 1, true, (SELECT id FROM "Users" WHERE login = 'admin' LIMIT 1), NOW(), NOW()),

('Режим работы клиники', 
'Режим работы медицинского центра:
Понедельник - Пятница: 08:00 - 20:00
Суббота: 09:00 - 18:00
Воскресенье: выходной

Приём ведётся по предварительной записи.
Экстренные случаи принимаются в любое время.',
'regulation', 1, true, (SELECT id FROM "Users" WHERE login = 'admin' LIMIT 1), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. ОТЧЁТЫ (ReportJobs) - примеры заданий
-- ============================================
INSERT INTO "ReportJobs" ("reportType", format, status, filters, "createdBy", "createdAt", "updatedAt")
SELECT 
    CASE (ROW_NUMBER() OVER ())
        WHEN 1 THEN 'appointments'
        WHEN 2 THEN 'diagnoses'
        WHEN 3 THEN 'patients'
        WHEN 4 THEN 'doctors'
        WHEN 5 THEN 'services'
        ELSE 'schedule'
    END,
    CASE (ROW_NUMBER() OVER () % 2)
        WHEN 0 THEN 'excel'
        ELSE 'word'
    END,
    CASE (ROW_NUMBER() OVER () % 4)
        WHEN 0 THEN 'completed'
        WHEN 1 THEN 'processing'
        WHEN 2 THEN 'pending'
        ELSE 'failed'
    END,
    jsonb_build_object(
        'dateFrom', (CURRENT_DATE - 30)::text,
        'dateTo', CURRENT_DATE::text
    ),
    u.id,
    NOW() - (random() * 7)::int * '1 day'::interval,
    NOW() - (random() * 7)::int * '1 day'::interval
FROM "Users" u
WHERE u.login = 'admin'
LIMIT 10
ON CONFLICT DO NOTHING;

-- ============================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- ============================================
SELECT 
    'Users' as table_name, COUNT(*) as count FROM "Users"
UNION ALL
SELECT 'Patients', COUNT(*) FROM "Patients"
UNION ALL
SELECT 'Doctors', COUNT(*) FROM "Doctors"
UNION ALL
SELECT 'Departments', COUNT(*) FROM "Departments"
UNION ALL
SELECT 'Services', COUNT(*) FROM "Services"
UNION ALL
SELECT 'DoctorSchedules', COUNT(*) FROM "DoctorSchedules"
UNION ALL
SELECT 'Appointments', COUNT(*) FROM "Appointments"
UNION ALL
SELECT 'Diagnoses', COUNT(*) FROM "Diagnoses"
UNION ALL
SELECT 'KnowledgeDocuments', COUNT(*) FROM "KnowledgeDocuments"
UNION ALL
SELECT 'ReportJobs', COUNT(*) FROM "ReportJobs"
ORDER BY table_name;

-- ============================================
-- ВАЖНО: Пароли для всех пользователей
-- ============================================
-- Все пароли в тестовых данных: "password123"
-- Хеш пароля: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- 
-- Для входа используйте:
-- Логин: admin / Пароль: password123
-- Логин: doctor1 / Пароль: password123
-- Логин: patient1 / Пароль: password123
-- и т.д.
