

const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = require('../db');

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
}, {
    timestamps: true,
});

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
            model: Doctor,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1, 
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
}, {
    timestamps: true,
});

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
            isAfter: new Date().toISOString(),
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

Doctor.belongsTo(Department, {
    foreignKey: {
        name: 'departmentId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Department.hasMany(Doctor, {
    foreignKey: {
        name: 'departmentId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Doctor.hasMany(DoctorSchedule, {
    foreignKey: 'doctorId', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
DoctorSchedule.belongsTo(Doctor, {
    foreignKey: 'doctorId', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Doctor.hasMany(Appointment, {
    foreignKey: 'doctorId',      
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Appointment.belongsTo(Doctor, {
    foreignKey: 'doctorId',       
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Patient.hasMany(Appointment, {
    foreignKey: 'patientId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Patient, {
    foreignKey: 'patientId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Service.belongsTo(Department, {
    foreignKey: {
        name: 'departmentId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Department.hasMany(Service, {
    foreignKey: {
        name: 'departmentId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Service.hasMany(Appointment, {
    foreignKey: 'serviceId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Service, {
    foreignKey: 'serviceId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Diagnosis.belongsTo(Patient, {
    foreignKey: {
        name: 'patientId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Patient.hasMany(Diagnosis, {
    foreignKey: {
        name: 'patientId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Diagnosis.belongsTo(Doctor, {
    foreignKey: {
        name: 'doctorId',
        allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Doctor.hasMany(Diagnosis, {
    foreignKey: {
        name: 'doctorId',
        allowNull: false,
    },
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
