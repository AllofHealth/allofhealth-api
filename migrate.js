require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { migrate } = require('drizzle-orm/neon-serverless/migrator');
const fs = require('fs');
const path = require('path');
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

// Extended timeout configuration - 2 minutes
const DB_CONNECTION_TIMEOUT = 180000;
const DB_STATEMENT_TIMEOUT = 180000;
const DB_IDLE_TIMEOUT = 180000;

/**
 * Custom migration script with improved error handling and extended timeouts
 * Replaces the default drizzle-kit migrate command to prevent ECONNRESET errors
 */
async function runMigrations() {
  console.log(
    `${colors.cyan}Starting database migration with extended timeout...${colors.reset}`,
  );
  console.log(
    `${colors.cyan}Connection timeout set to ${DB_CONNECTION_TIMEOUT}ms${colors.reset}`,
  );

  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error(
      `${colors.red}ERROR: DATABASE_URL is not defined in .env file${colors.reset}`,
    );
    process.exit(1);
  }

  // Create a pool with extended timeout
  const pool = new Pool({
    connectionString: uri,
    max: 5, // Reduce concurrent connections during migration
    connectionTimeoutMillis: DB_CONNECTION_TIMEOUT,
    statement_timeout: DB_STATEMENT_TIMEOUT,
    idle_in_transaction_session_timeout: DB_IDLE_TIMEOUT,
  });

  console.log(
    `${colors.cyan}Establishing connection to Neon database...${colors.reset}`,
  );

  try {
    // Test connection first
    const client = await pool.connect();
    console.log(
      `${colors.green}Successfully connected to database${colors.reset}`,
    );

    // Get database info
    const dbInfo = await client.query(
      'SELECT current_database() as db, current_user as user',
    );
    console.log(
      `${colors.cyan}Connected to: ${colors.magenta}${dbInfo.rows[0].db}${colors.reset} as ${colors.magenta}${dbInfo.rows[0].user}${colors.reset}`,
    );

    client.release();

    // Create drizzle instance
    const db = drizzle(pool);

    // Check if migrations directory exists
    const migrationsPath = path.join(__dirname, 'drizzle/migrations');
    if (!fs.existsSync(migrationsPath)) {
      console.error(
        `${colors.red}Migrations directory not found at: ${migrationsPath}${colors.reset}`,
      );
      process.exit(1);
    }

    console.log(
      `${colors.cyan}Found migrations directory: ${colors.magenta}${migrationsPath}${colors.reset}`,
    );

    // List migration files
    const migrationFiles = fs
      .readdirSync(migrationsPath)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log(
        `${colors.yellow}No migration files found. Nothing to apply.${colors.reset}`,
      );
      process.exit(0);
    }

    console.log(`${colors.cyan}Migration files to apply:${colors.reset}`);
    migrationFiles.forEach((file) =>
      console.log(`${colors.blue}- ${file}${colors.reset}`),
    );

    console.log(`\n${colors.cyan}Starting migration process...${colors.reset}`);

    // Run migrations with verbose logging
    await migrate(db, { migrationsFolder: migrationsPath })
      .then(() => {
        console.log(
          `${colors.green}Migrations completed successfully!${colors.reset}`,
        );
      })
      .catch((error) => {
        console.error(`${colors.red}Migration failed:${colors.reset}`);
        console.error(`${colors.red}Error code: ${error.code}${colors.reset}`);
        console.error(
          `${colors.red}Error message: ${error.message}${colors.reset}`,
        );

        if (error.code === 'ECONNRESET') {
          console.error(
            `\n${colors.yellow}ECONNRESET error indicates that the connection was reset by the server.${colors.reset}`,
          );
          console.error(`${colors.yellow}This could be due to:${colors.reset}`);
          console.error(
            `${colors.yellow}1. Network issues or instability${colors.reset}`,
          );
          console.error(
            `${colors.yellow}2. Server-side timeout policies${colors.reset}`,
          );
          console.error(
            `${colors.yellow}3. Long-running transactions being terminated${colors.reset}`,
          );
        }

        throw error;
      });
  } catch (error) {
    console.error(
      `${colors.red}Fatal error during migration:${colors.reset}`,
      error,
    );
    process.exit(1);
  } finally {
    console.log(
      `${colors.cyan}Closing database connection pool...${colors.reset}`,
    );
    await pool.end();
    console.log(`${colors.cyan}Database connection pool closed${colors.reset}`);
  }
}

// Run the migration function
runMigrations()
  .then(() => {
    console.log(
      `${colors.green}Migration script completed successfully${colors.reset}`,
    );
    process.exit(0);
  })
  .catch(() => {
    console.log(`${colors.red}Migration script failed${colors.reset}`);
    process.exit(1);
  });
