const Pool = require("pg").Pool;
require("dotenv").config();

const configstring =
  "postgresql://postgres:PostgresPassword123456789@23.88.50.29:5432/jobs";
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
});


module.exports = { pool };
