
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment to match backend context
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Fallback for docker internal connection vs local connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'helpeconomia',
    port: process.env.DB_PORT || 3306
};

console.log('🔄 Starting Database Migration...');
console.log(`📡 Connecting to ${dbConfig.host}:${dbConfig.port}...`);

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        // 1. Check if columns exist
        const [columns] = await connection.query(`SHOW COLUMNS FROM users`);
        const existingColumns = columns.map(c => c.Field);

        const newColumns = [
            { name: 'subscription_status', def: "ENUM('active', 'inactive', 'trial', 'canceled') DEFAULT 'trial'" },
            { name: 'subscription_id', def: "VARCHAR(255)" },
            { name: 'trial_ends_at', def: "DATETIME" },
            { name: 'google_id', def: "VARCHAR(255)" },
            { name: 'photo_url', def: "VARCHAR(500)" },
            { name: 'reset_token', def: "VARCHAR(255)" },
            { name: 'reset_token_expires', def: "DATETIME" }
        ];

        for (const col of newColumns) {
            if (!existingColumns.includes(col.name)) {
                console.log(`✨ Adding column: ${col.name}`);
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`);
            } else {
                console.log(`ℹ️ Column ${col.name} already exists. Skipping.`);
            }
        }

        // 2. Modify password to be nullable (for Google Auth)
        console.log('🔧 Modifying password column to allow NULL...');
        await connection.query(`ALTER TABLE users MODIFY password VARCHAR(255) NULL`);

        // 3. Set default trial for existing users if NULL
        console.log('🎁 Setting 7-day trial for existing users without status...');
        await connection.query(`
            UPDATE users 
            SET subscription_status = 'trial', 
                trial_ends_at = DATE_ADD(NOW(), INTERVAL 7 DAY) 
            WHERE subscription_status IS NULL OR subscription_status = ''
        `);

        // 4. Ensure Admin is always ACTIVE
        console.log('👑 Ensuring Admin is ACTIVE...');
        await connection.query(`
            UPDATE users 
            SET subscription_status = 'active', trial_ends_at = NULL 
            WHERE role = 'ADMIN'
        `);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
