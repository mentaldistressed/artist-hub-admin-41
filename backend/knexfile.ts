import { config } from './src/config/config';

/**
 * Knex configuration for migrations and seeds
 */
export default {
  development: {
    client: 'postgresql',
    connection: {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },
  
  production: {
    client: 'postgresql',
    connection: {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },
};