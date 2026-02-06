
import db from '../config/database.js';

// Note: In a real Scenario, verify webhook signature from Kiwify
export const handleKiwifyWebhook = async (req, res) => {
    try {
        const { event, data } = req.body;
        // Kiwify payload structure might vary, this is a generic implementation
        // Adjust based on actual Kiwify documentation: https://help.kiwify.com.br/

        console.log('🔔 Kiwify Webhook received:', event);

        // Mapping Data (Verify these fields with Kiwify Docs)
        const customerEmail = data.Customer.email;
        const subscriptionId = data.Subscription?.id;

        if (!customerEmail) {
            return res.status(400).json({ error: 'Email missing' });
        }

        if (event === 'order.approved' || event === 'subscription.renewed') {
            console.log(`✅ Activating subscription for ${customerEmail}`);

            await db.query(
                `UPDATE users 
                 SET subscription_status = 'active', 
                     subscription_id = ?,
                     trial_ends_at = NULL 
                 WHERE email = ?`,
                [subscriptionId, customerEmail]
            );
        } else if (event === 'subscription.canceled' || event === 'order.refunded') {
            console.log(`❌ Canceling subscription for ${customerEmail}`);

            await db.query(
                `UPDATE users 
                 SET subscription_status = 'canceled' 
                 WHERE email = ?`,
                [customerEmail]
            );
        }

        res.json({ status: 'received' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};
