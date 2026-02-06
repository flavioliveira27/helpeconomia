
import db from '../config/database.js';

export const checkSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            'SELECT subscription_status, trial_ends_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = users[0];
        const now = new Date();
        const trialEnds = new Date(user.trial_ends_at);

        // 1. If Active, allow
        if (user.subscription_status === 'active') {
            return next();
        }

        // 2. If Trial, check date
        if (user.subscription_status === 'trial') {
            if (trialEnds > now) {
                return next();
            } else {
                // Trial expired
                await db.query("UPDATE users SET subscription_status = 'inactive' WHERE id = ?", [userId]);
                return res.status(403).json({
                    error: 'Período de teste expirado',
                    code: 'SUBSCRIPTION_REQUIRED',
                    redirect: '/subscription'
                });
            }
        }

        // 3. Otherwise (inactive, canceled)
        return res.status(403).json({
            error: 'Assinatura necessária para acessar este recurso',
            code: 'SUBSCRIPTION_REQUIRED',
            redirect: '/subscription'
        });

    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ error: 'Erro ao verificar assinatura' });
    }
};
