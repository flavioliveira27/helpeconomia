import 'dotenv/config';
import db from '../config/database.js';

const runMigration = async () => {
    try {
        console.log('Adding reset password columns to users table...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN reset_password_token VARCHAR(255) NULL,
            ADD COLUMN reset_password_expires DATETIME NULL;
        `);
        console.log('Columns added successfully.');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist. Skipping.');
            process.exit(0);
        }
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
