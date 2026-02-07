import 'server-only';

interface SendEmailProps {
    to: string;
    subject: string;
    htmlContent: string;
    sender?: { name: string; email: string };
    replyTo?: { name: string; email: string };
}

export async function sendEmail({
    to,
    subject,
    htmlContent,
    sender,
    replyTo,
}: SendEmailProps) {
    const apiKey = process.env.BREVO_API_KEY;
    const defaultSenderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@pathsathi.com';
    const defaultSenderName = process.env.BREVO_SENDER_NAME || 'PathSathi';

    if (!apiKey) {
        console.error('BREVO_API_KEY is missing');
        return { success: false, error: 'Configuration error: API Key missing' };
    }

    console.log('Using Brevo API Key:', apiKey.substring(0, 5) + '...');
    console.log('Sender:', defaultSenderEmail);

    const payload = {
        sender: sender || { name: defaultSenderName, email: defaultSenderEmail },
        to: [{ email: to }],
        subject,
        htmlContent,
        replyTo: replyTo || (process.env.BREVO_REPLY_TO ? { email: process.env.BREVO_REPLY_TO } : undefined),
    };

    try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Brevo API Error:', data);
            return { success: false, error: data.message || 'Failed to send email' };
        }

        console.log('Brevo Email Success:', data);
        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: 'Network error or invalid request' };
    }
}
