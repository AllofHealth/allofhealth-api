require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
 * Parse migration file and extract SQL statements
 */
function parseMigrationFile(content) {
  // Split by statement-breakpoint comments
  const parts = content.split('--> statement-breakpoint');
  const statements = [];

  for (const part of parts) {
    const cleanPart = part.trim();
    if (cleanPart && !cleanPart.startsWith('-->')) {
      // Remove any remaining comments and empty lines
      const lines = cleanPart.split('\n');
      const sqlLines = lines.filter((line) => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('--');
      });

      if (sqlLines.length > 0) {
        const statement = sqlLines.join('\n').trim();
        if (statement) {
          statements.push(statement);
        }
      }
    }
  }

  return statements;
}

/**
 * Check if a table exists in the database
 */
async function tableExists(client, tableName) {
  try {
    const result = await client.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      );
    `,
      [tableName],
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error(
      `${colors.red}Error checking if table ${tableName} exists: ${error.message}${colors.reset}`,
    );
    return false;
  }
}

/**
 * Check if a constraint exists in the database
 */
async function constraintExists(client, constraintName) {
  try {
    const result = await client.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints
        WHERE constraint_name = $1
      );
    `,
      [constraintName],
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error(
      `${colors.red}Error checking if constraint ${constraintName} exists: ${error.message}${colors.reset}`,
    );
    return false;
  }
}

/**
 * Execute a single SQL statement with proper error handling
 */
async function executeStatement(client, statement) {
  try {
    await client.query(statement);
    return { success: true, error: null };
  } catch (error) {
    // Handle common "already exists" errors
    if (
      (error.code === '42P07' && error.message.includes('already exists')) || // Table/relation already exists
      (error.code === '42710' && error.message.includes('already exists')) || // Object already exists
      (error.code === '42P16' &&
        error.message.includes('multiple primary key')) || // Multiple primary key constraints
      (error.code === '23505' && error.message.includes('already exists')) // Unique constraint already exists
    ) {
      return { success: true, error: 'already_exists', message: error.message };
    }

    return { success: false, error: error.code, message: error.message };
  }
}

/**
 * Safe migration script that handles existing tables gracefully
 * Checks for existing tables and migrations before executing
 */
async function runMigrations() {
  console.log(
    `${colors.cyan}Starting safe database migration with extended timeout...${colors.reset}`,
  );
  console.log(
    `${colors.cyan}Connection timeout set to ${DB_CONNECTION_TIMEOUT}ms${colors.reset}`,
  );

  const uri =
    process.env.NODE_ENV === 'PRODUCTION'
      ? process.env.DATABASE_URL
      : process.env.DATABASE_URL_STAGING;
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

  let client;
  try {
    // Test connection first
    client = await pool.connect();
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

    // Create migration tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    // Check if custom enums need to be created first
    console.log(`${colors.cyan}Checking for custom types...${colors.reset}`);

    const customTypes = [
      `CREATE TYPE "role" AS ENUM('USER', 'ADMIN', 'MODERATOR');`,
      `CREATE TYPE "status" AS ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');`,
    ];

    for (const typeQuery of customTypes) {
      const result = await executeStatement(client, typeQuery);
      if (result.success) {
        if (result.error === 'already_exists') {
          console.log(
            `${colors.yellow}  ⚠ Custom type already exists, skipping...${colors.reset}`,
          );
        } else {
          console.log(
            `${colors.green}  ✓ Custom type created successfully${colors.reset}`,
          );
        }
      } else {
        console.log(
          `${colors.yellow}  ⚠ Custom type creation skipped: ${result.message}${colors.reset}`,
        );
      }
    }

    // Check if migrations directory exists
    const migrationsPath = path.join(__dirname, 'drizzle', 'migrations');
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
      return;
    }

    console.log(`${colors.cyan}Migration files to process:${colors.reset}`);
    migrationFiles.forEach((file) =>
      console.log(`${colors.blue}- ${file}${colors.reset}`),
    );

    console.log(
      `\n${colors.cyan}Starting safe migration process...${colors.reset}`,
    );

    // Process each migration file
    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(migrationsPath, migrationFile);
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      const migrationHash = crypto
        .createHash('sha256')
        .update(migrationContent)
        .digest('hex');

      // Check if migration was already applied
      const existingMigration = await client.query(
        'SELECT * FROM __drizzle_migrations WHERE hash = $1',
        [migrationHash],
      );

      if (existingMigration.rows.length > 0) {
        console.log(
          `${colors.yellow}Migration ${migrationFile} already applied (hash exists)${colors.reset}`,
        );
        continue;
      }

      console.log(
        `\n${colors.cyan}Processing migration: ${migrationFile}${colors.reset}`,
      );

      // Parse migration file to extract individual statements
      const statements = parseMigrationFile(migrationContent);

      console.log(
        `${colors.cyan}Found ${statements.length} statements to execute${colors.reset}`,
      );

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      // Execute each statement individually
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        const statementPreview = statement
          .substring(0, 60)
          .replace(/\s+/g, ' ')
          .trim();

        console.log(
          `${colors.blue}  [${i + 1}/${statements.length}] Executing: ${statementPreview}...${colors.reset}`,
        );

        const result = await executeStatement(client, statement);

        if (result.success) {
          if (result.error === 'already_exists') {
            console.log(
              `${colors.yellow}    ⚠ Already exists, skipping...${colors.reset}`,
            );
            skipCount++;
          } else {
            console.log(
              `${colors.green}    ✓ Executed successfully${colors.reset}`,
            );
            successCount++;
          }
        } else {
          console.error(
            `${colors.red}    ✗ Failed: ${result.message}${colors.reset}`,
          );
          errorCount++;

          // For critical errors, stop the migration
          if (
            result.error !== '42P07' &&
            result.error !== '42710' &&
            result.error !== '23505'
          ) {
            throw new Error(`Critical error in statement: ${result.message}`);
          }
        }
      }

      console.log(
        `${colors.cyan}Migration ${migrationFile} summary:${colors.reset}`,
      );
      console.log(
        `${colors.green}  ✓ Successful: ${successCount}${colors.reset}`,
      );
      console.log(`${colors.yellow}  ⚠ Skipped: ${skipCount}${colors.reset}`);
      console.log(`${colors.red}  ✗ Errors: ${errorCount}${colors.reset}`);

      // Mark migration as applied
      await client.query(
        'INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)',
        [migrationHash, Date.now()],
      );

      console.log(
        `${colors.green}Migration ${migrationFile} completed and marked as applied!${colors.reset}`,
      );
    }

    // Verify critical tables exist
    console.log(`\n${colors.cyan}Verifying critical tables...${colors.reset}`);
    const criticalTables = ['users', 'health_journal', 'approvals', 'accounts'];

    for (const tableName of criticalTables) {
      const exists = await tableExists(client, tableName);
      if (exists) {
        console.log(
          `${colors.green}  ✓ Table '${tableName}' exists${colors.reset}`,
        );
      } else {
        console.log(
          `${colors.red}  ✗ Table '${tableName}' missing!${colors.reset}`,
        );
      }
    }

    console.log(
      `\n${colors.green}All migrations processed successfully!${colors.reset}`,
    );
  } catch (error) {
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
  } finally {
    if (client) {
      client.release();
    }
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
