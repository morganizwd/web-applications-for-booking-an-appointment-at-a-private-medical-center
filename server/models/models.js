// models/index.js

const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = require('../db'); // Убедитесь, что путь правильный

// Admin Model
const Admin = sequelize.define('Admin', {
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
}, {
    timestamps: true,
});

// Patient Model
const Patient = sequelize.define('Patient', {
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
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
            len: [2, 50],
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
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

// Doctor Model
const Doctor = sequelize.define('Doctor', {
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
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
            len: [2, 50],
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
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
}, {
    timestamps: true,
});

// Department Model
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
}, {
    timestamps: true,
});

// DoctorSchedule Model
const DoctorSchedule = sequelize.define('DoctorSchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    dayOfWeek: { // День недели (0 - воскресенье, 5 - пятница)
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 5,
        },
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

// Service Model
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
    photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// Diagnosis Model
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
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 500],
        },
    },
}, {
    timestamps: true,
});

// Appointment Model
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
            isAfter: new Date().toISOString(), // Приемы должны быть в будущем
        },
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Doctor,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Patient,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Service,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
});

// Relationships

// Doctor - Department
Doctor.belongsTo(Department, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Department.hasMany(Doctor, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Doctor - DoctorSchedule
Doctor.hasMany(DoctorSchedule, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
DoctorSchedule.belongsTo(Doctor, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Doctor - Appointment
Doctor.hasMany(Appointment, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Doctor, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Patient - Appointment
Patient.hasMany(Appointment, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Patient, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Service - Department
Service.belongsTo(Department, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Department.hasMany(Service, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Service - Appointment
Service.hasMany(Appointment, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Service, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Diagnosis - Patient
Diagnosis.belongsTo(Patient, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Patient.hasMany(Diagnosis, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Diagnosis - Doctor
Diagnosis.belongsTo(Doctor, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Doctor.hasMany(Diagnosis, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

module.exports = {
    sequelize,
    Admin,
    Patient,
    Doctor,
    Department,
    DoctorSchedule,
    Service,
    Diagnosis,
    Appointment,
};
