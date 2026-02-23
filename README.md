# Информационная система частного медицинского центра

Веб-приложение для управления записями на приём и медицинскими услугами с модулем интеллектуальной справки на базе RAG (Retrieval-Augmented Generation).

## Содержание

- [Технологический стек](#технологический-стек)
- [Функциональность](#функциональность)
- [Установка](#установка)
- [Настройка](#настройка)
- [Запуск](#запуск)
- [Эксплуатация](#эксплуатация)
- [API документация](#api-документация)
- [Устранение неполадок](#устранение-неполадок)
- [Резервное копирование](#резервное-копирование)
- [Обновление системы](#обновление-системы)

## Технологический стек

- **Frontend**: React 19, Redux Toolkit, React Bootstrap, Material-UI
- **Backend**: Node.js, Express
- **База данных**: PostgreSQL 12+ с расширением pgvector
- **ORM**: Sequelize
- **Векторный поиск**: pgvector
- **LLM**: Ollama (локально) или OpenAI API

## Функциональность

### Роли пользователей

1. **Незарегистрированный пользователь**: просмотр публичных данных (отделения, услуги, врачи), регистрация/вход
2. **Пациент**: управление профилем, просмотр диагнозов, запись на приём/услугу, просмотр своих записей, использование консультанта
3. **Врач**: просмотр расписания и записей, добавление диагнозов пациентам, формирование отчётов по приёмам
4. **Администратор**: управление справочниками (врачи, пациенты, отделения, услуги), управление расписанием, управление записями, формирование отчётов, загрузка документов в базу знаний

### Основные модули

- **Справочники клиники**: отделения, услуги, врачи
- **Запись на приём и услуги**: создание, изменение статуса, отмена, просмотр списков с фильтрами
- **Расписание**: настройка рабочих интервалов врача, контроль пересечений, ограничение по длительности услуги
- **Диагнозы**: добавление и просмотр по пациенту и по приёму, разграничение прав доступа
- **Отчётность**: выгрузка в Excel и Word по записям, диагнозам, расписанию, пациентам и врачам; параметры отчёта задаются фильтрами
- **Интеллектуальный консультант (RAG)**: ответы на вопросы по регламентам клиники и подготовке к услугам

---

## Установка

### Шаг 1: Проверка требований

Убедитесь, что установлены:

- **Node.js** версии 16 или выше
  ```bash
  node --version
  ```
- **PostgreSQL** версии 12 или выше
  ```bash
  psql --version
  ```
- **npm** или **yarn**
  ```bash
  npm --version
  ```

### Шаг 2: Установка PostgreSQL и pgvector

#### Windows

1. Скачайте и установите PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Установите pgvector:
   - Скачайте скомпилированную версию: https://github.com/pgvector/pgvector
   - Или скомпилируйте из исходников (требуется Visual Studio)

#### Linux (Ubuntu/Debian)

```bash
# Установка PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Установка pgvector
sudo apt-get install postgresql-12-pgvector
# или для другой версии PostgreSQL замените 12 на нужную версию
```

#### macOS

```bash
# Установка через Homebrew
brew install postgresql
brew install pgvector
```

### Шаг 3: Настройка базы данных

1. **Создайте базу данных**:
   ```bash
   # Войдите в PostgreSQL
   psql -U postgres
   
   # Создайте базу данных
   CREATE DATABASE medical_center;
   
   # Выйдите из psql
   \q
   ```

2. **Создайте расширение pgvector**:
   ```bash
   psql -U postgres -d medical_center -c "CREATE EXTENSION vector;"
   ```

3. **Проверьте установку**:
   ```bash
   psql -U postgres -d medical_center -c "\dx"
   ```
   Должно быть видно расширение `vector`.

### Шаг 4: Установка Ollama (для RAG модуля)

1. **Скачайте и установите Ollama**: https://ollama.ai/
2. **Запустите Ollama** (должен автоматически запуститься после установки)
3. **Скачайте модели**:
   ```bash
   # Модель для генерации ответов
   ollama pull gemma3:4b
   
   # Модель для embeddings (векторных представлений)
   ollama pull embeddinggemma
   ```

4. **Проверьте работу Ollama**:
   ```bash
   # Windows PowerShell
   curl.exe http://localhost:11434/api/tags
   
   # Linux/macOS
   curl http://localhost:11434/api/tags
   ```

### Шаг 5: Клонирование и установка зависимостей

1. **Клонируйте репозиторий** (если ещё не склонирован):
   ```bash
   git clone <repository-url>
   cd web-applications-for-booking-an-appointment-at-a-private-medical-center
   ```

2. **Установите зависимости backend**:
   ```bash
   cd server
   npm install
   ```

3. **Установите зависимости frontend**:
   ```bash
   cd ../client/medical-center
   npm install
   ```
   
   **Если возникла ошибка с конфликтом зависимостей** (например, React 19 vs @testing-library/react):
   ```bash
   # Используйте флаг --legacy-peer-deps
   npm install --legacy-peer-deps
   ```
   
   Это разрешит установку зависимостей, даже если есть незначительные конфликты версий.

---

## Настройка

### Шаг 1: Настройка переменных окружения

Создайте файл `.env` в директории `server/`:

```env
# ============================================
# База данных
# ============================================
DB_NAME=medical_center
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# ============================================
# JWT (безопасность)
# ============================================
JWT_SECRET=your_very_secure_jwt_secret_key_min_32_chars

# ============================================
# LLM - выбор между Ollama или OpenAI
# ============================================

# Вариант 1: Использование Ollama (рекомендуется для локальной разработки)
USE_OLLAMA=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
OLLAMA_EMBEDDING_MODEL=embeddinggemma

# Вариант 2: Использование OpenAI API (раскомментируйте и заполните)
# USE_OLLAMA=false
# OPENAI_API_KEY=sk-your-openai-api-key
# LLM_API_BASE=https://api.openai.com/v1
# LLM_MODEL=gpt-3.5-turbo

# ============================================
# Сервер
# ============================================
PORT=5000
NODE_ENV=development
```

**Важно**: 
- Замените `your_postgres_password` на реальный пароль PostgreSQL
- Замените `your_very_secure_jwt_secret_key_min_32_chars` на надёжный секретный ключ (минимум 32 символа)
- Не коммитьте файл `.env` в репозиторий!

### Шаг 2: Запуск миграций базы данных

```bash
cd server
npm run db:migrate
```

Миграция выполнит:
- ✅ Создание всех таблиц (Users, Roles, Patients, Doctors, Departments, Services, Appointments, Diagnoses, и др.)
- ✅ Создание таблиц для RAG модуля (KnowledgeDocuments, KnowledgeChunks, KnowledgeEmbeddings)
- ✅ Создание таблиц для отчётности (ReportJobs, ReportFiles)
- ✅ Создание ролей (admin, doctor, patient)
- ✅ Миграцию данных из старых таблиц (если есть)

**Проверка**: После миграции проверьте, что таблицы созданы:
```bash
psql -U postgres -d medical_center -c "\dt"
```

### Шаг 2.1: Заполнение базы данных тестовыми данными (опционально)

Для полноценного тестирования приложения можно заполнить базу данных тестовыми данными:

**Вариант 1: Использование Node.js скрипта (рекомендуется)**:
```bash
cd server
node scripts/seed-test-data.js
```

**Вариант 2: Использование SQL скрипта**:
```bash
psql -U postgres -d medical_center -f migrations/seed-test-data.sql
```

Скрипт создаст:
- ✅ 2 администратора
- ✅ 15 врачей с разными специализациями
- ✅ 30 пациентов
- ✅ 15 отделений
- ✅ 50+ услуг
- ✅ Расписание для всех врачей
- ✅ 200 записей на приём
- ✅ 150 диагнозов
- ✅ Документы базы знаний для RAG
- ✅ Примеры заданий на отчёты

**Учётные данные для тестирования**:
- Администратор: `admin` / `password123`
- Врач: `doctor1` / `password123`
- Пациент: `patient1` / `password123`

### Шаг 3: Создание первого администратора (ТОЛЬКО ПОСЛЕ ЗАПУСКА СЕРВЕРА НА ПОРТУ 5000)

После запуска миграций создайте первого администратора через API:

**Способ 1: Через curl (Windows PowerShell)**:
```powershell
curl.exe -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"login\":\"admin\",\"password\":\"admin123\",\"email\":\"admin@example.com\",\"role\":\"admin\"}'
```

**Способ 2: Через Postman или другой HTTP клиент**:
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "login": "admin",
  "password": "admin123",
  "email": "admin@example.com",
  "role": "admin"
}
```

**Способ 3: Через интерфейс приложения** (после запуска frontend):
- Откройте http://localhost:3000
- Зарегистрируйтесь как администратор

---

## Запуск

### Режим разработки

#### 1. Запуск Backend сервера

Откройте первый терминал:

```bash
cd server
npm run dev
```

Сервер запустится на `http://localhost:5000`

**Проверка**: Откройте в браузере `http://localhost:5000/api/auth/roles` - должен вернуться список ролей.

#### 2. Запуск Frontend приложения

Откройте второй терминал:

```bash
cd client/medical-center
npm start
```

Приложение автоматически откроется в браузере на `http://localhost:3000`

### Режим production

#### 1. Сборка Frontend

```bash
cd client/medical-center
npm run build
```

Создастся папка `build/` с готовым приложением.

#### 2. Настройка Backend для production

В файле `server/.env` установите:
```env
NODE_ENV=production
```

#### 3. Запуск через PM2 (рекомендуется)

```bash
# Установка PM2
npm install -g pm2

# Запуск сервера
cd server
pm2 start index.js --name medical-center-api

# Просмотр логов
pm2 logs medical-center-api

# Автозапуск при перезагрузке системы
pm2 startup
pm2 save
```

#### 4. Настройка Nginx (опционально)

Пример конфигурации для Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/client/medical-center/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Эксплуатация

### Работа с системой

#### Вход в систему

1. Откройте приложение в браузере: `http://localhost:3000`
2. Войдите с учётными данными администратора
3. После входа вы увидите панель управления в зависимости от роли

#### Управление пользователями (Администратор)

1. **Создание пользователя**:
   - Перейдите в раздел "Пользователи"
   - Нажмите "Добавить пользователя"
   - Заполните форму (логин, пароль, роль, профиль)
   - Сохраните

2. **Редактирование пользователя**:
   - Найдите пользователя в списке
   - Нажмите "Редактировать"
   - Внесите изменения
   - Сохраните

3. **Удаление пользователя**:
   - Найдите пользователя в списке
   - Нажмите "Удалить"
   - Подтвердите действие

#### Управление справочниками

**Отделения**:
- Создание, редактирование, удаление отделений
- Просмотр списка отделений

**Услуги**:
- Создание услуги с указанием: название, цена, длительность, описание, отделение
- Загрузка фото услуги
- Редактирование и удаление услуг

**Врачи**:
- Создание профиля врача с привязкой к отделению
- Назначение расписания работы
- Просмотр записей врача

#### Управление расписанием

1. **Создание расписания врача**:
   - Выберите врача
   - Укажите день недели (0-6, где 0 - воскресенье)
   - Укажите время начала и окончания работы
   - Сохраните

2. **Проверка пересечений**:
   - Система автоматически проверяет пересечения при создании записей
   - При конфликте будет показано предупреждение

#### Записи на приём

**Для пациентов**:
1. Выберите услугу
2. Выберите врача
3. Выберите дату и время
4. Система проверит доступность
5. Подтвердите запись

**Для администраторов**:
- Просмотр всех записей
- Изменение статуса записи (scheduled, confirmed, completed, cancelled, no_show)
- Редактирование записей
- Отмена записей

#### Диагнозы

**Для врачей**:
1. Выберите пациента
2. Выберите приём (опционально)
3. Введите название диагноза
4. Введите заключение
5. Сохраните

**Для пациентов**:
- Просмотр своих диагнозов
- Фильтрация по дате, врачу

#### Работа с RAG модулем (Интеллектуальный консультант)

**Загрузка документов (только администратор)**:

1. Перейдите в раздел "База знаний" или используйте API:
   ```bash
   POST /api/rag/documents
   Content-Type: multipart/form-data
   
   title: "Подготовка к анализу крови"
   documentType: "preparation_guide"
   serviceId: 1 (опционально)
   file: [файл с текстом]
   ```

2. Документ автоматически:
   - Разобьётся на фрагменты
   - Сгенерируются векторные представления (embeddings)
   - Будет доступен для поиска

**Использование консультанта**:

1. Откройте раздел "Консультант" в интерфейсе
2. (Опционально) Выберите услугу для более точного поиска
3. Введите вопрос, например:
   - "Что нужно взять с собой на процедуру?"
   - "Можно ли есть перед анализом?"
   - "Как подготовиться к УЗИ?"
4. Нажмите "Задать вопрос"
5. Система вернёт ответ на основе загруженных документов

#### Генерация отчётов

**Создание отчёта**:

1. Перейдите в раздел "Отчёты"
2. Выберите тип отчёта:
   - Записи на приём
   - Диагнозы
   - Расписание
   - Пациенты
   - Врачи
   - Услуги
3. Укажите формат (Excel или Word)
4. Установите фильтры (дата, врач, пациент и т.д.)
5. Нажмите "Создать отчёт"
6. Дождитесь завершения обработки (статус изменится на "completed")
7. Скачайте готовый файл

**Просмотр заданий на отчёты**:
- Список всех созданных отчётов
- Статусы: pending, processing, completed, failed
- Скачивание готовых отчётов

### Администрирование

#### Мониторинг системы

**Проверка работы сервера**:
```bash
# Проверка статуса PM2
pm2 status

# Просмотр логов
pm2 logs medical-center-api

# Мониторинг ресурсов
pm2 monit
```

**Проверка базы данных**:
```bash
# Подключение к БД
psql -U postgres -d medical_center

# Проверка размера БД
SELECT pg_size_pretty(pg_database_size('medical_center'));

# Проверка таблиц
\dt

# Проверка количества записей
SELECT 
    'Users' as table_name, COUNT(*) as count FROM "Users"
UNION ALL
SELECT 'Patients', COUNT(*) FROM "Patients"
UNION ALL
SELECT 'Doctors', COUNT(*) FROM "Doctors"
UNION ALL
SELECT 'Appointments', COUNT(*) FROM "Appointments";
```

#### Очистка старых данных

**Удаление старых отчётов**:
```sql
-- Удаление отчётов старше 30 дней
DELETE FROM "ReportFiles" 
WHERE "createdAt" < NOW() - INTERVAL '30 days';

DELETE FROM "ReportJobs" 
WHERE "createdAt" < NOW() - INTERVAL '30 days' 
AND status = 'completed';
```

**Очистка неактивных документов**:
```sql
-- Деактивация старых версий документов
UPDATE "KnowledgeDocuments" 
SET "isActive" = false 
WHERE "version" < (SELECT MAX("version") FROM "KnowledgeDocuments" kd2 
                   WHERE kd2.title = "KnowledgeDocuments".title);
```

#### Оптимизация производительности

**Индексы базы данных**:
```sql
-- Индекс для быстрого поиска по дате записей
CREATE INDEX IF NOT EXISTS idx_appointments_date 
ON "Appointments"("date");

-- Индекс для поиска по статусу
CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON "Appointments"("status");

-- Индекс для поиска диагнозов по пациенту
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient 
ON "Diagnoses"("patientId");
```

**Оптимизация pgvector** (если используется тип vector):
```sql
-- См. инструкцию в server/migrations/PGVECTOR_SETUP.md
```

---

## API документация

### Авторизация

#### Регистрация
```
POST /api/auth/register
Content-Type: application/json

{
  "login": "user123",
  "password": "password123",
  "email": "user@example.com",
  "role": "patient",
  "profileData": {
    "firstName": "Иван",
    "lastName": "Иванов",
    "age": 30,
    "phoneNumber": "+7 999 123 45 67"
  }
}
```

#### Вход
```
POST /api/auth/login
Content-Type: application/json

{
  "login": "user123",
  "password": "password123"
}
```

#### Проверка токена
```
GET /api/auth/auth
Authorization: Bearer <token>
```

### RAG модуль

#### Задать вопрос
```
POST /api/rag/ask
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "Что нужно взять с собой на анализ?",
  "serviceId": 1
}
```

#### Загрузить документ (admin)
```
POST /api/rag/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: "Название документа"
documentType: "preparation_guide"
serviceId: 1
file: [файл]
```

#### Список документов
```
GET /api/rag/documents?serviceId=1&documentType=preparation_guide
Authorization: Bearer <token>
```

### Отчёты

#### Создать отчёт
```
POST /api/reports/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportType": "appointments",
  "format": "excel",
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "doctorId": 1
  }
}
```

#### Список заданий
```
GET /api/reports/jobs?status=completed
Authorization: Bearer <token>
```

#### Скачать отчёт
```
GET /api/reports/download/:id
Authorization: Bearer <token>
```

Полный список API endpoints см. в коде контроллеров в `server/controllers/`.

---

## Устранение неполадок

### Проблемы с базой данных

**Ошибка подключения**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Решение**:
1. Проверьте, что PostgreSQL запущен
2. Проверьте параметры в `.env` (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD)
3. Проверьте права доступа пользователя PostgreSQL

**Ошибка расширения pgvector**:
```
ERROR: extension "vector" does not exist
```
**Решение**:
1. Установите pgvector (см. раздел "Установка")
2. Выполните: `CREATE EXTENSION vector;`

### Проблемы с Ollama

**Ollama не отвечает**:
```
Error: connect ECONNREFUSED localhost:11434
```
**Решение**:
1. Проверьте, что Ollama запущен
2. Проверьте URL в `.env`: `OLLAMA_URL=http://localhost:11434`
3. Перезапустите Ollama

**Модель не найдена**:
```
Error: model not found
```
**Решение**:
1. Проверьте список моделей: `ollama list`
2. Убедитесь, что имя модели в `.env` совпадает
3. Скачайте модель: `ollama pull <имя_модели>`

### Проблемы с установкой зависимостей

**Конфликт зависимостей при установке frontend**:
```
npm error ERESOLVE could not resolve
npm error peer react@"^18.0.0" from @testing-library/react@13.4.0
npm error Found: react@19.0.0
```
**Решение**:
1. Используйте флаг `--legacy-peer-deps`:
   ```bash
   cd client/medical-center
   npm install --legacy-peer-deps
   ```
2. Или обновите зависимости вручную (уже сделано в package.json):
   - `@testing-library/react` обновлён до версии `^14.1.2` (совместима с React 19)
   - Удалите `node_modules` и `package-lock.json`, затем установите заново:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```

**Ошибка "react-scripts is not recognized"**:
```
'react-scripts' is not recognized as an internal or external command
```
**Решение**:
1. Убедитесь, что зависимости установлены:
   ```bash
   cd client/medical-center
   npm install --legacy-peer-deps
   ```
2. Если проблема сохраняется, переустановите зависимости:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

### Проблемы с миграциями

**Ошибка при миграции**:
```
Error: relation "Users" already exists
```
**Решение**:
1. Если нужно пересоздать таблицы, выполните откат:
   ```bash
   npm run db:migrate:undo
   ```
2. Затем снова запустите миграцию:
   ```bash
   npm run db:migrate
   ```

### Проблемы с авторизацией

**Ошибка "Не авторизован"**:
1. Проверьте, что токен передаётся в заголовке: `Authorization: Bearer <token>`
2. Проверьте, что токен не истёк (срок действия 24 часа)
3. Выполните повторный вход

**Ошибка "Доступ запрещён"**:
1. Проверьте, что у пользователя есть необходимая роль
2. Для административных операций требуется роль `admin`

---

## Резервное копирование

### Резервное копирование базы данных

**Ежедневное резервное копирование (Linux/macOS)**:

Создайте скрипт `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/medical_center_$DATE.sql"

# Создание резервной копии
pg_dump -U postgres medical_center > $BACKUP_FILE

# Сжатие
gzip $BACKUP_FILE

# Удаление старых копий (старше 30 дней)
find $BACKUP_DIR -name "medical_center_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

Добавьте в crontab:
```bash
crontab -e
# Добавьте строку:
0 2 * * * /path/to/backup.sh
```

**Windows (через Task Scheduler)**:

Создайте скрипт `backup.bat`:
```batch
@echo off
set BACKUP_DIR=C:\backups
set DATE=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_FILE=%BACKUP_DIR%\medical_center_%DATE%.sql

pg_dump -U postgres medical_center > %BACKUP_FILE%

echo Backup completed: %BACKUP_FILE%
```

### Восстановление из резервной копии

```bash
# Распаковка (если сжато)
gunzip backup.sql.gz

# Восстановление
psql -U postgres -d medical_center < backup.sql
```

### Резервное копирование файлов

**Отчёты**:
```bash
# Копирование папки с отчётами
tar -czf reports_backup_$(date +%Y%m%d).tar.gz server/reports/
```

**Загруженные файлы**:
```bash
# Копирование загруженных фото
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz server/uploads/
```

---

## Обновление системы

### Обновление кода

1. **Создайте резервную копию** (см. раздел "Резервное копирование")

2. **Получите последние изменения**:
   ```bash
   git pull origin main
   ```

3. **Установите новые зависимости**:
   ```bash
   cd server
   npm install
   
   cd ../client/medical-center
   npm install
   ```

4. **Запустите миграции**:
   ```bash
   cd server
   npm run db:migrate
   ```

5. **Пересоберите frontend** (если нужно):
   ```bash
   cd client/medical-center
   npm run build
   ```

6. **Перезапустите сервер**:
   ```bash
   # Если используете PM2
   pm2 restart medical-center-api
   
   # Или просто
   npm run dev
   ```

### Обновление моделей Ollama

```bash
# Обновление модели для генерации
ollama pull gemma3:4b

# Обновление модели для embeddings
ollama pull embeddinggemma
```

### Откат изменений

Если что-то пошло не так:

1. **Откат миграций**:
   ```bash
   cd server
   npm run db:migrate:undo
   ```

2. **Восстановление из резервной копии** (см. раздел "Резервное копирование")

3. **Откат кода**:
   ```bash
   git checkout <previous-commit-hash>
   ```

---

## Дополнительные ресурсы

- [Документация Sequelize](https://sequelize.org/docs/v6/)
- [Документация pgvector](https://github.com/pgvector/pgvector)
- [Документация Ollama](https://github.com/ollama/ollama)
- [Документация React](https://react.dev/)

## Поддержка

При возникновении проблем:
1. Проверьте раздел "Устранение неполадок"
2. Проверьте логи сервера
3. Проверьте логи базы данных
4. Создайте issue в репозитории проекта

## Лицензия

ISC

---

**Версия документа**: 1.0  
**Последнее обновление**: 2025
