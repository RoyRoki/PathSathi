import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/brevo';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, message, email } = body;

        if (!message || message.length < 15) {
            return NextResponse.json(
                { error: 'Message must be at least 15 characters long.' },
                { status: 400 }
            );
        }

        const contactEmailTo = process.env.CONTACT_EMAIL_TO || 'rokiroy2207@gmail.com';
        const contactEmailFrom = process.env.BREVO_SENDER_EMAIL || process.env.CONTACT_EMAIL_FROM || 'noreply@pathsathi.com';

        // Send email to admin
        const emailResult = await sendEmail({
            to: contactEmailTo,
            subject: `New Contact Form Submission from ${name || 'Anonymous'}`,
            htmlContent: `
                <h1>New Message from PathSathi Contact Form</h1>
                <p><strong>Name:</strong> ${name || 'Anonymous'}</p>
                <p><strong>Email:</strong> ${email || 'Not provided'}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #ccc;">
                    ${message.replace(/\n/g, '<br>')}
                </blockquote>
            `,
            sender: { name: 'PathSathi Contact Form', email: contactEmailFrom },
            replyTo: email ? { name: name || 'User', email: email } : undefined
        });

        console.log('Email sending result:', emailResult);

        if (!emailResult.success) {
            console.error('Failed to send contact email:', emailResult.error);
            return NextResponse.json(
                { error: 'Failed to send message. Please try again later.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully!', messageId: emailResult.messageId });
    } catch (error) {
        console.error('Error processing contact request:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
