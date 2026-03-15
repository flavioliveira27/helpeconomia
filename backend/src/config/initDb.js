import db from './database.js';

/**
 * Ensures that the required tables and columns exist in the database.
 * This is useful for updates where init.sql wouldn't run again.
 */
export async function syncDatabase() {
    console.log('🔄 Checking database schema synchronization...');
    try {
        // 1. Create credit_cards table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS credit_cards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                brand VARCHAR(50) NOT NULL,
                limit_amount DECIMAL(10,2) NOT NULL,
                closing_day INT NOT NULL,
                due_day INT NOT NULL,
                color_theme VARCHAR(50) DEFAULT 'purple',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table "credit_cards" verified/created');

        // 2. Check and add missing columns to transactions table
        const [columns] = await db.query('SHOW COLUMNS FROM transactions');
        const columnNames = columns.map(c => c.Field);

        const columnsToAdd = [
            { name: 'payment_method', type: "ENUM('CREDITO', 'DEBITO', 'PIX', 'CREDITO PARCELADO')" },
            { name: 'importance', type: "ENUM('ESSENCIAL', 'SUPERFLUO')" },
            { name: 'credit_card_id', type: "INT DEFAULT NULL" },
            { name: 'installments', type: "INT DEFAULT NULL" },
            { name: 'installment_number', type: "INT DEFAULT NULL" },
            { name: 'invoice_date', type: "DATE DEFAULT NULL" },
            { name: 'recurring', type: "BOOLEAN DEFAULT FALSE" }
        ];

        for (const col of columnsToAdd) {
            if (!columnNames.includes(col.name)) {
                console.log(`➕ Adding missing column "${col.name}" to "transactions"...`);
                await db.query(`ALTER TABLE transactions ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        // 3. Add foreign key index for credit_card_id if missing
        try {
            const [indexes] = await db.query('SHOW INDEX FROM transactions WHERE Key_name = "idx_card_invoice"');
            if (indexes.length === 0) {
                console.log('➕ Adding missing index "idx_card_invoice" to "transactions"...');
                await db.query('ALTER TABLE transactions ADD INDEX idx_card_invoice (credit_card_id, invoice_date)');
            }
        } catch (idxErr) {
            console.warn('⚠️ Could not verify/create index:', idxErr.message);
        }

        console.log('✨ Database synchronization completed successfully');
    } catch (error) {
        console.error('❌ Database synchronization failed:', error);
    }
}
