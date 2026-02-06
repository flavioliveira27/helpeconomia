import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendPasswordResetEmail = async (to, resetToken) => {
    const resetLink = `${process.env.FRONTEND_URL}/#/reset-password?token=${resetToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Recuperação de Senha - HelpEconomia</h2>
            <p>Você solicitou a redefinição de sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Redefinir Senha</a>
            <p>Se você não solicitou isso, pode ignorar este e-mail. O link expira em 1 hora.</p>
            <hr>
            <p style="font-size: 12px; color: #777;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style="font-size: 12px; color: #777;">${resetLink}</p>
        </div>
    `;

    return sendEmail(to, 'Redefinição de Senha - HelpEconomia', html);
};
