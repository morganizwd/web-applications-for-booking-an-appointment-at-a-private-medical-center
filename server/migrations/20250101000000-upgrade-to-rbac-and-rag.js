'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. Установка расширения pgvector
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS vector;',
        { transaction }
      );

      // 2. Создание таблицы Users
      await queryInterface.createTable('Users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        login: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 3. Создание таблицы Roles
      await queryInterface.createTable('Roles', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 4. Создание таблицы UserRoles
      await queryInterface.createTable('UserRoles', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        roleId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Roles',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 5. Добавление уникального индекса для UserRoles
      await queryInterface.addIndex('UserRoles', ['userId', 'roleId'], {
        unique: true,
        name: 'userRole_unique',
        transaction
      });

      // 6. Обновление таблицы Patients: добавление userId, удаление login/password
      await queryInterface.addColumn('Patients', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction });

      // 7. Обновление таблицы Doctors: добавление userId, удаление login/password
      await queryInterface.addColumn('Doctors', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction });

      // 8. Добавление description в Departments
      await queryInterface.addColumn('Departments', 'description', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      // 9. Обновление таблицы Services: добавление duration и description
      await queryInterface.addColumn('Services', 'duration', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      }, { transaction });

      await queryInterface.addColumn('Services', 'description', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      // 10. Обновление таблицы Appointments: добавление status и notes
      await queryInterface.addColumn('Appointments', 'status', {
        type: Sequelize.ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'),
        allowNull: false,
        defaultValue: 'scheduled'
      }, { transaction });

      await queryInterface.addColumn('Appointments', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      // 11. Обновление таблицы Diagnoses: добавление appointmentId
      await queryInterface.addColumn('Diagnoses', 'appointmentId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      // 12. Обновление DoctorSchedule: расширение dayOfWeek до 0-6
      // (миграция данных не требуется, так как валидация только на уровне приложения)

      // 13. Создание таблицы KnowledgeDocuments
      await queryInterface.createTable('KnowledgeDocuments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        documentType: {
          type: Sequelize.ENUM('service_description', 'preparation_guide', 'regulation', 'general'),
          allowNull: false,
          defaultValue: 'general'
        },
        serviceId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Services',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        uploadedBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 14. Создание таблицы KnowledgeChunks
      await queryInterface.createTable('KnowledgeChunks', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        documentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'KnowledgeDocuments',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        chunkIndex: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 15. Создание таблицы KnowledgeEmbeddings с использованием vector типа
      await queryInterface.createTable('KnowledgeEmbeddings', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        chunkId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'KnowledgeChunks',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        embedding: {
          type: Sequelize.ARRAY(Sequelize.FLOAT),
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // Создание индекса для векторного поиска (после создания таблицы)
      // Примечание: для использования типа vector нужно вручную изменить тип колонки
      // ALTER TABLE "KnowledgeEmbeddings" ALTER COLUMN embedding TYPE vector(384);
      // CREATE INDEX ON "KnowledgeEmbeddings" USING ivfflat (embedding vector_cosine_ops);

      // 16. Создание таблицы ReportJobs
      await queryInterface.createTable('ReportJobs', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        reportType: {
          type: Sequelize.ENUM('appointments', 'diagnoses', 'schedule', 'patients', 'doctors', 'services'),
          allowNull: false
        },
        format: {
          type: Sequelize.ENUM('excel', 'word'),
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'pending'
        },
        filters: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        errorMessage: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 17. Создание таблицы ReportFiles
      await queryInterface.createTable('ReportFiles', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        jobId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'ReportJobs',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        filePath: {
          type: Sequelize.STRING,
          allowNull: false
        },
        fileName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        fileSize: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 18. Создание таблицы AuditLogs
      await queryInterface.createTable('AuditLogs', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        action: {
          type: Sequelize.STRING,
          allowNull: false
        },
        entityType: {
          type: Sequelize.STRING,
          allowNull: true
        },
        entityId: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        details: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        ipAddress: {
          type: Sequelize.STRING,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 19. Миграция данных из старых таблиц в новую структуру
      // Сначала создаём роли
      await queryInterface.bulkInsert('Roles', [
        { name: 'admin', description: 'Администратор системы', createdAt: new Date(), updatedAt: new Date() },
        { name: 'doctor', description: 'Врач', createdAt: new Date(), updatedAt: new Date() },
        { name: 'patient', description: 'Пациент', createdAt: new Date(), updatedAt: new Date() }
      ], { transaction });

      // Миграция Admins в Users
      const [admins] = await queryInterface.sequelize.query(
        'SELECT id, login, password FROM "Admins"',
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );
      
      for (const admin of admins || []) {
        const [users] = await queryInterface.sequelize.query(
          `INSERT INTO "Users" (login, password, "isActive", "createdAt", "updatedAt")
           VALUES (:login, :password, true, NOW(), NOW())
           RETURNING id`,
          {
            replacements: { login: admin.login, password: admin.password },
            transaction,
            type: Sequelize.QueryTypes.SELECT
          }
        );
        
        if (users && users.length > 0) {
          const userId = users[0].id;
          await queryInterface.sequelize.query(
            `INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
             SELECT :userId, id, NOW(), NOW() FROM "Roles" WHERE name = 'admin'`,
            {
              replacements: { userId },
              transaction
            }
          );
        }
      }

      // Миграция Patients в Users
      const [patients] = await queryInterface.sequelize.query(
        'SELECT id, login, password FROM "Patients"',
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );
      
      for (const patient of patients || []) {
        const [users] = await queryInterface.sequelize.query(
          `INSERT INTO "Users" (login, password, "isActive", "createdAt", "updatedAt")
           VALUES (:login, :password, true, NOW(), NOW())
           RETURNING id`,
          {
            replacements: { login: patient.login, password: patient.password },
            transaction,
            type: Sequelize.QueryTypes.SELECT
          }
        );
        
        if (users && users.length > 0) {
          const userId = users[0].id;
          await queryInterface.sequelize.query(
            `UPDATE "Patients" SET "userId" = :userId WHERE id = :patientId`,
            {
              replacements: { userId, patientId: patient.id },
              transaction
            }
          );
          await queryInterface.sequelize.query(
            `INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
             SELECT :userId, id, NOW(), NOW() FROM "Roles" WHERE name = 'patient'`,
            {
              replacements: { userId },
              transaction
            }
          );
        }
      }

      // Миграция Doctors в Users
      const [doctors] = await queryInterface.sequelize.query(
        'SELECT id, login, password FROM "Doctors"',
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );
      
      for (const doctor of doctors || []) {
        const [users] = await queryInterface.sequelize.query(
          `INSERT INTO "Users" (login, password, "isActive", "createdAt", "updatedAt")
           VALUES (:login, :password, true, NOW(), NOW())
           RETURNING id`,
          {
            replacements: { login: doctor.login, password: doctor.password },
            transaction,
            type: Sequelize.QueryTypes.SELECT
          }
        );
        
        if (users && users.length > 0) {
          const userId = users[0].id;
          await queryInterface.sequelize.query(
            `UPDATE "Doctors" SET "userId" = :userId WHERE id = :doctorId`,
            {
              replacements: { userId, doctorId: doctor.id },
              transaction
            }
          );
          await queryInterface.sequelize.query(
            `INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
             SELECT :userId, id, NOW(), NOW() FROM "Roles" WHERE name = 'doctor'`,
            {
              replacements: { userId },
              transaction
            }
          );
        }
      }

      // Установка NOT NULL для userId после миграции данных
      await queryInterface.changeColumn('Patients', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      }, { transaction });

      await queryInterface.changeColumn('Doctors', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Удаление новых таблиц в обратном порядке
      await queryInterface.dropTable('AuditLogs', { transaction });
      await queryInterface.dropTable('ReportFiles', { transaction });
      await queryInterface.dropTable('ReportJobs', { transaction });
      await queryInterface.dropTable('KnowledgeEmbeddings', { transaction });
      await queryInterface.dropTable('KnowledgeChunks', { transaction });
      await queryInterface.dropTable('KnowledgeDocuments', { transaction });
      
      // Удаление колонок из существующих таблиц
      await queryInterface.removeColumn('Diagnoses', 'appointmentId', { transaction });
      await queryInterface.removeColumn('Appointments', 'notes', { transaction });
      await queryInterface.removeColumn('Appointments', 'status', { transaction });
      await queryInterface.removeColumn('Services', 'description', { transaction });
      await queryInterface.removeColumn('Services', 'duration', { transaction });
      await queryInterface.removeColumn('Departments', 'description', { transaction });
      await queryInterface.removeColumn('Doctors', 'userId', { transaction });
      await queryInterface.removeColumn('Patients', 'userId', { transaction });
      
      // Удаление таблиц RBAC
      await queryInterface.dropTable('UserRoles', { transaction });
      await queryInterface.dropTable('Roles', { transaction });
      await queryInterface.dropTable('Users', { transaction });
      
      // Удаление расширения pgvector (опционально, может использоваться другими таблицами)
      // await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS vector;', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
