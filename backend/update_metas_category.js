import db from './src/config/database.js';

async function updateExistingTransactions() {
  try {
    const [result] = await db.query(
      "UPDATE transactions SET category = 'Metas' WHERE description LIKE 'Depósito na Meta:%' AND type = 'INVESTMENT'"
    );
    console.log(`Successfully updated ${result.affectedRows} Transactions to category 'Metas'.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating transactions:', error);
    process.exit(1);
  }
}

updateExistingTransactions();
