import "dotenv/config";

const knexConfig = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: './test.sqlite'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};

export default knexConfig;
