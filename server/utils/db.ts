import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getDb(): mysql.Pool {
  if (!pool) {
    const config = useRuntimeConfig();
    pool = mysql.createPool({
      host: config.dbHost,
      port: Number(config.dbPort) || 8889,
      user: config.dbUser,
      password: config.dbPass,
      database: config.dbName,
      charset: "utf8mb4",
      timezone: "+07:00",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}
