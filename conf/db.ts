const { Pool } = require('pg');

const pool = new Pool({
  user: 'api_generator_3dey_user',
  host: 'dpg-cpvh7ehu0jms73asp0qg-a.oregon-postgres.render.com',
  database: 'api_generator_3dey',
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
