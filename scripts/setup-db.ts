import { DataSource } from 'typeorm';
import 'dotenv/config'; // Для загрузки переменных окружения из .env
import { User } from '../src/user/user.entity';
import { Post } from '../src/post/post.entity';

const baseConfig = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

async function setupDatabase() {
  try {
    console.log('Подключение к серверу PostgreSQL...');

    // Подключение к серверу PostgreSQL без указания базы данных
    const adminDataSource = new DataSource({
      ...baseConfig,
      database: 'postgres', // Используем базу данных "postgres" для административных задач
    });

    await adminDataSource.initialize();
    console.log('Успешно подключились к PostgreSQL.');

    // Проверка существования базы данных
    const dbName = process.env.DB_NAME || 'nestjs_db';
    const result = await adminDataSource.query(
      `SELECT datname FROM pg_database WHERE datname = '${dbName}'`,
    );

    if (result.length === 0) {
      console.log(
        `База данных "${dbName}" не найдена. Создание базы данных...`,
      );
      await adminDataSource.query(`CREATE DATABASE "${dbName}";`);
      console.log(`База данных "${dbName}" успешно создана.`);
    } else {
      console.log(`База данных "${dbName}" уже существует.`);
    }

    // Закрытие административного подключения
    await adminDataSource.destroy();

    // Подключение к созданной базе данных
    const appDataSource = new DataSource({
      ...baseConfig,
      database: dbName,
      entities: [User, Post], // Указываем сущности
      synchronize: true, // Включаем автоматическую синхронизацию для разработки
    });

    await appDataSource.initialize();
    console.log('Подключение к базе данных установлено.');

    // Синхронизация сущностей (создание таблиц)
    await appDataSource.synchronize();
    console.log('Таблицы успешно созданы.');

    // Закрытие подключения
    await appDataSource.destroy();
    console.log('Настройка базы данных завершена.');
  } catch (error) {
    console.error('Ошибка при настройке базы данных:', error);
  }
}

setupDatabase();
