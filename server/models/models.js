
const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = require('../db');

// ==================== ЕДИНАЯ СИСТЕМА ПОЛЬЗОВАТЕЛЕЙ И RBAC ====================

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [5, 50],
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
});

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 50],
        },
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

const UserRole = sequelize.define('UserRole', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Roles',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    uniqueKeys: {
        userRole_unique: {
            fields: ['userId', 'roleId'],
        },
    },
});

// ==================== ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ ====================

const Patient = sequelize.define('Patient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9\-+() ]+$/i,
        },
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

const Doctor = sequelize.define('Doctor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 100],
        },
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Departments',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
});

// ==================== СПРАВОЧНИКИ ====================

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 100],
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 100],
        },
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: true,
            min: 0,
        },
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Длительность услуги в минутах',
        validate: {
            min: 1,
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Departments',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
});

// ==================== РАСПИСАНИЕ ====================

const DoctorSchedule = sequelize.define('DoctorSchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    doctorId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Doctors',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0, 
            max: 6, 
        },
        comment: '0 - воскресенье, 1 - понедельник, ..., 6 - суббота',
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
}, {
    timestamps: true,
});

// ==================== ЗАПИСИ НА ПРИЁМ ====================

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
        },
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'),
        allowNull: false,
        defaultValue: 'scheduled',
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Doctors',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Patients',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Services',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// ==================== ДИАГНОЗЫ ====================

const Diagnosis = sequelize.define('Diagnosis', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 100],
        },
    },
    conclusion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    patientId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Patients',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    doctorId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Doctors',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Appointments',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
}, {
    timestamps: true,
});

// ==================== RAG МОДУЛЬ (БАЗА ЗНАНИЙ) ====================

const KnowledgeDocument = sequelize.define('KnowledgeDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 200],
        },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    documentType: {
        type: DataTypes.ENUM('service_description', 'preparation_guide', 'regulation', 'general'),
        allowNull: false,
        defaultValue: 'general',
    },
    serviceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Services',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
}, {
    timestamps: true,
});

const KnowledgeChunk = sequelize.define('KnowledgeChunk', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'KnowledgeDocuments',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    chunkIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Индекс фрагмента в документе',
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Дополнительные метаданные фрагмента',
    },
}, {
    timestamps: true,
});

const KnowledgeEmbedding = sequelize.define('KnowledgeEmbedding', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chunkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'KnowledgeChunks',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    embedding: {
        type: DataTypes.ARRAY(DataTypes.FLOAT),
        allowNull: false,
        comment: 'Векторное представление фрагмента (pgvector)',
    },
}, {
    timestamps: true,
});

// ==================== СИСТЕМА ОТЧЁТНОСТИ ====================

const ReportJob = sequelize.define('ReportJob', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    reportType: {
        type: DataTypes.ENUM('appointments', 'diagnoses', 'schedule', 'patients', 'doctors', 'services'),
        allowNull: false,
    },
    format: {
        type: DataTypes.ENUM('excel', 'word'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    filters: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Параметры фильтрации для отчёта',
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
});

const ReportFile = sequelize.define('ReportFile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'ReportJobs',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Размер файла в байтах',
    },
}, {
    timestamps: true,
});

// ==================== АУДИТ ====================

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Тип действия (create, update, delete, login, etc.)',
    },
    entityType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Тип сущности (User, Appointment, etc.)',
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID сущности',
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Дополнительные детали операции',
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// ==================== СВЯЗИ МЕЖДУ МОДЕЛЯМИ ====================

// User - Role связи
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
});
Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId',
});

// User - Profile связи
User.hasOne(Patient, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.hasOne(Doctor, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Department - Doctor связи
Department.hasMany(Doctor, { foreignKey: 'departmentId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Doctor.belongsTo(Department, { foreignKey: 'departmentId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Department - Service связи
Department.hasMany(Service, { foreignKey: 'departmentId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Service.belongsTo(Department, { foreignKey: 'departmentId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Doctor - Schedule связи
Doctor.hasMany(DoctorSchedule, { foreignKey: 'doctorId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
DoctorSchedule.belongsTo(Doctor, { foreignKey: 'doctorId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Doctor - Appointment связи
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Patient - Appointment связи
Patient.hasMany(Appointment, { foreignKey: 'patientId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Service - Appointment связи
Service.hasMany(Appointment, { foreignKey: 'serviceId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Appointment - Diagnosis связи
Appointment.hasMany(Diagnosis, { foreignKey: 'appointmentId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Diagnosis.belongsTo(Appointment, { foreignKey: 'appointmentId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Patient - Diagnosis связи
Patient.hasMany(Diagnosis, { foreignKey: 'patientId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Diagnosis.belongsTo(Patient, { foreignKey: 'patientId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Doctor - Diagnosis связи
Doctor.hasMany(Diagnosis, { foreignKey: 'doctorId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Diagnosis.belongsTo(Doctor, { foreignKey: 'doctorId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Knowledge Document - Chunk связи
KnowledgeDocument.hasMany(KnowledgeChunk, { foreignKey: 'documentId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
KnowledgeChunk.belongsTo(KnowledgeDocument, { foreignKey: 'documentId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Knowledge Chunk - Embedding связи
KnowledgeChunk.hasOne(KnowledgeEmbedding, { foreignKey: 'chunkId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
KnowledgeEmbedding.belongsTo(KnowledgeChunk, { foreignKey: 'chunkId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Service - Knowledge Document связи
Service.hasMany(KnowledgeDocument, { foreignKey: 'serviceId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
KnowledgeDocument.belongsTo(Service, { foreignKey: 'serviceId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// User - Knowledge Document связи
User.hasMany(KnowledgeDocument, { foreignKey: 'uploadedBy', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
KnowledgeDocument.belongsTo(User, { foreignKey: 'uploadedBy', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Report Job - Report File связи
ReportJob.hasOne(ReportFile, { foreignKey: 'jobId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ReportFile.belongsTo(ReportJob, { foreignKey: 'jobId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// User - Report Job связи
User.hasMany(ReportJob, { foreignKey: 'createdBy', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ReportJob.belongsTo(User, { foreignKey: 'createdBy', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// User - Audit Log связи
User.hasMany(AuditLog, { foreignKey: 'userId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
AuditLog.belongsTo(User, { foreignKey: 'userId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

module.exports = {
    sequelize,
    // RBAC
    User,
    Role,
    UserRole,
    // Profiles
    Patient,
    Doctor,
    // Directories
    Department,
    Service,
    // Schedule
    DoctorSchedule,
    // Appointments
    Appointment,
    // Diagnoses
    Diagnosis,
    // RAG Module
    KnowledgeDocument,
    KnowledgeChunk,
    KnowledgeEmbedding,
    // Reports
    ReportJob,
    ReportFile,
    // Audit
    AuditLog,
};
