import { DataSource } from 'typeorm';
import { seedUsers } from './user.seed';

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'warsztat_admin',
    password: process.env.POSTGRES_PASSWORD || 'TajneHaslo2025',
    database: process.env.POSTGRES_DB || 'warsztat_db',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Database connected');

    await seedUsers(dataSource);

    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
